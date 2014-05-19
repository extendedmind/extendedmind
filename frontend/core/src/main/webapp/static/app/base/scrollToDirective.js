/* global IScroll */
'use strict';

function scrollToDirective($timeout, SwiperService, UISessionService) {

  return {
    restrict: 'A',
    require: '^featureContainer',
    controller: function($scope) {
      var edgeElements = {};

      // Control add item... input element's focus.
      $scope.addItems = {};

      this.registerToggleEdgeElementActiveCallback = function registerToggleEdgeElementActiveCallback(edge, toggleElementActiveCallback) {
        edgeElements[edge] = toggleElementActiveCallback;
      };

      this.registerAddItemElement = function registerAddItemElement(element) {
        $scope.addItems[element] = {
          focus: false
        };
      };

      this.focusedAddItemElement = function focusedAddItemElement(element) {
        if ($scope.addItems[element]) $scope.addItems[element].focus = true;
      };

      this.blurredAddItemElement = function blurredAddItemElement(element) {
        if ($scope.addItems[element]) $scope.addItems[element].focus = false;
      };

      $scope.fireToggleEdgeElementActiveCallback = function fireEdgeElementCallback(edge, isActive) {
        if (edgeElements[edge]) {
          edgeElements[edge](isActive);
        }
      };
    },
    link: function postLink(scope, element, attrs, featureContainerController) {
      featureContainerController.registerViewActiveCallback(attrs.scrollTo, scrollerViewActiveCallback);

      function scrollerViewActiveCallback(){
        delayedScrollerRefresh();
      }

      // IScroll needs to be refreshed, when the DOM is rendered.
      var refreshing = false;
      function delayedScrollerRefresh() {
        if (refreshing) return false;
        refreshing = true;
        return $timeout(function() {
          scroller.refresh();
          refreshing = false;
        }, 200);
      }
      var scroller;

      scroller = new IScroll(element[0], {
        mouseWheel: true,
        disableMouse: true,
        preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|LABEL)$/ }
      });
      delayedScrollerRefresh();

      // Strict boolean type equality (===) can be achieved with scope.$eval(attrs.scrollTo<Top|Bottom>Edge).
      // Currently it is not needed.
      if (attrs.scrollToTopEdge === 'true' || attrs.scrollToBottomEdge === 'true') {
        scroller.options.probeType = 2;
        scroller.on('scroll', pageSwiperSlideTouchMove);
      }
      scroller.on('scrollStart', scrollStart);
      element.bind('touchend', pageSwiperSlideTouchEnd);

      scope.scrollToElement = function scrollToElement(element) {
        scroller.scrollToElement(element, 500);
      };

      scope.refreshScroller = function refreshScroller() {
        delayedScrollerRefresh();
      };

      scope.refreshScrollerAndScrollToElement = function refreshScrollerAndScrollToElement(element) {
        var refreshPromise = delayedScrollerRefresh();
        if (refreshPromise){
          refreshPromise.then(function() {
            scroller.scrollToElement(element, 500);
          });
        }
      };

      scope.refreshScrollerAndScrollToFocusedAddElement = function refreshScrollerAndScrollToFocusedAddElement(element) {
        var refreshPromise = delayedScrollerRefresh();
        if (refreshPromise){
          refreshPromise.then(function() {
            if (scope.addItems[element] && scope.addItems[element].focus) scroller.scrollToElement(element, 500);
          });
        }
      };

      var scrollerWrapper = element[0];
      var scrollerContent = element[0].firstElementChild;

      // Return threshold to set edge loader element's height
      scope.getBottomEdgeRubberBandThreshold = function getBottomEdgeRubberBandThreshold() {
        return 100;
      };

      // Default rubber band threshold is 60 pixels.
      var rubberBandThreshold = 60;
      // Bottom edge loader height is 100 pixels which increases bottom slide height by 100 pixels respectively.
      // Set new variable with the following threshold adjustment for bottom edge slide which contains loader.
      var bottomEdgeRubberBandThreshold = (attrs.scrollToBottomEdge === 'true') ? -100 : 0;
      var reachedEdgeThreshold = false;

      function scrollStart() {
        SwiperService.setOnlyExternal(UISessionService.getCurrentFeatureName(), true);
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
        function scrolledUpwardPastSlideTopThreshold() {
          return scroller.y >= rubberBandThreshold && scroller.directionY === -1;
        }
        function scrolledDownWardPastSlideBottomThreshold() {
          return (scrollerWrapper.clientHeight - scrollerContent.scrollHeight >= scroller.y + rubberBandThreshold) && scroller.directionY === 1;
        }

        SwiperService.setOnlyExternal(UISessionService.getCurrentFeatureName(), false);

        if (attrs.scrollToSwiper){
          if (reachedEdgeThreshold) {
            reachedEdgeThreshold = false;
            swipeTo('edge');
          } else if (scrolledUpwardPastSlideTopThreshold()) {
            swipeTo('previous');
          } else if (scrolledDownWardPastSlideBottomThreshold()) {
            swipeTo('next');
          }
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
