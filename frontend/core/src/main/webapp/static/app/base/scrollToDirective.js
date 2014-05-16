/* global IScroll */
'use strict';

function scrollToDirective($timeout, SwiperService, UISessionService) {

  return {
    restrict: 'A',
    controller: function($scope, $element, $attrs) {
      var edgeElements = {};

      this.registerToggleEdgeElementActiveCallback = function registerToggleEdgeElementActiveCallback(edge, toggleElementActiveCallback) {
        edgeElements[edge] = toggleElementActiveCallback;
      };

      $scope.fireToggleEdgeElementActiveCallback = function fireEdgeElementCallback(edge, isActive) {
        if (edgeElements[edge]) {
          edgeElements[edge](isActive);
        }
      };
    },
    link: function postLink(scope, element, attrs) {
      var scroller;

      // Control add item... input element's focus.
      var addItem = {
        focus: false
      };

      scroller = new IScroll(element[0], {
        mouseWheel: true,
        preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|LABEL)$/ }
      });

      // Strict boolean type equality (===) can be achieved with scope.$eval(attrs.scrollTo<Top|Bottom>Edge).
      // Currently it is not needed.
      if (attrs.scrollToTopEdge === 'true' || attrs.scrollToBottomEdge === 'true') {
        scroller.options.probeType = 2;
        scroller.on('scroll', pageSwiperSlideTouchMove);
      }
      scroller.on('scrollStart', scrollStart);
      if (attrs.scrollToSwiper) {
        element.bind('touchend', pageSwiperSlideTouchEnd);
      }

      scope.$watch('scrollToItems.length', function(newLength, oldLength) {
        if (newLength > oldLength) {
          scope.$evalAsync(function() {
            scroller.refresh();
            if (addItem.focus) {
              scroller.scrollToElement(addItem.element, 500);
            }
          });
        } else if (newLength < oldLength) {
          $timeout(function() {
            scroller.refresh();
          }, 200);
        }
      });

      scope.focusedAddElement = function focusedAddElement(event) {
        addItem.focus = true;
        addItem.element = event.target;
      };

      scope.blurredAddElement = function blurredAddElement() {
        addItem.focus = false;
        delete addItem.element;
      };

      // IScroll needs to be refreshed, when the DOM is rendered.
      scope.scrollerIncludeContentLoaded = function scrollerIncludeContentLoaded() {
        scroller.refresh();
      };

      scope.refreshScroller = function refreshScroller() {
        scroller.refresh();
      };

      scope.scrollToElement = function scrollToElement(element) {
        scroller.scrollToElement(element, 500);
      };

      scope.refreshScrollerAndScrollToElement = function refreshScrollerAndScrollToElement(element) {
        $timeout(function() {
          scroller.refresh();
          scroller.scrollToElement(element, 500);
        }, 200);
      };

      var scrollerWrapper = element[0];
      var scrollerContent = element[0].firstElementChild;

      // Return threshold to set edge loader element's height
      scope.getRubberBandThreshold = function getRubberBandThreshold() {
        return 100;
      };

      // Default rubber band threshold is 70 pixels.
      var rubberBandThreshold = 70;
      // Bottom edge loader height is 100 pixels which increases bottom slide height by 100 pixels respectively.
      // Set new variable with the following threshold adjustment for bottom edge slide which contains loader.
      var bottomEdgeRubberBandThreshold = (attrs.scrollToBottomEdge === 'true') ? -100 : 0;
      var reachedEdgeThreshold = false;

      function scrollStart() {
        if (scroller.directionY === 0) {
          SwiperService.setOnlyExternal(UISessionService.getCurrentFeatureName(), false);
        } else {
          SwiperService.setOnlyExternal(UISessionService.getCurrentFeatureName(), true);
        }
      }

      function pageSwiperSlideTouchMove() {
        if (attrs.scrollToBottomEdge === 'true') {
          if (scrolledPastBottomEdgeThreshold()) {
            scope.fireToggleEdgeElementActiveCallback('bottom', true);
            reachedEdgeThreshold = true;
          } else {
            scope.fireToggleEdgeElementActiveCallback('bottom', false);
            reachedEdgeThreshold = false;
          }
        } else if (attrs.scrollToTopEdge === 'true') {
          if (scrolledPastTopEdgeThreshold()) {
            scope.fireToggleEdgeElementActiveCallback('top', true);
            reachedEdgeThreshold = true;
          } else {
            scope.fireToggleEdgeElementActiveCallback('top', false);
            reachedEdgeThreshold = false;
          }
        }

        function scrolledPastBottomEdgeThreshold() {
          return scrollerWrapper.clientHeight - scrollerContent.scrollHeight >= scroller.y + rubberBandThreshold + bottomEdgeRubberBandThreshold;
        }

        function scrolledPastTopEdgeThreshold() {
          return scroller.y >= rubberBandThreshold;
        }
      }

      function pageSwiperSlideTouchEnd() {
        SwiperService.setOnlyExternal(UISessionService.getCurrentFeatureName(), false);
        if (reachedEdgeThreshold) {
          reachedEdgeThreshold = false;
          swipeTo('edge');
        } else if (scrolledUpwardPastSlideTopThreshold()) {
          swipeTo('previous');
        } else if (scrolledDownWardPastSlideBottomThreshold()) {
          swipeTo('next');
        }

        function scrolledUpwardPastSlideTopThreshold() {
          return scroller.y >= rubberBandThreshold && scroller.directionY === -1;
        }

        function scrolledDownWardPastSlideBottomThreshold() {
          return (scrollerWrapper.clientHeight - scrollerContent.scrollHeight >= scroller.y + rubberBandThreshold) && scroller.directionY === 1;
        }
      }

      function swipeTo(destination) {
        if (destination === 'previous') {
          SwiperService.swipePrevious(attrs.scrollToSwiper);
        } else if (destination === 'next') {
          SwiperService.swipeNext(attrs.scrollToSwiper);
        } else if (destination === 'edge') {
          if (attrs.scrollToBottomEdge === 'true') {
            SwiperService.reachedPositiveResistancePullToRefreshPosition(attrs.scrollToSwiper);
          } else if (attrs.scrollToTopEdge === 'true') {
            SwiperService.reachedNegativeResistancePullToRefreshPosition(attrs.scrollToSwiper);
          }
        }
      }

      scope.$on('$destroy', function() {
        element.unbind('touchend', pageSwiperSlideTouchEnd);
        scroller.destroy();
        scroller = null;
      });
    }
  };
}
scrollToDirective.$inject = ['$timeout', 'SwiperService', 'UISessionService'];
angular.module('em.directives').directive('scrollTo', scrollToDirective);