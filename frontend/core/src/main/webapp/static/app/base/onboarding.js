/* global $, IScroll */
'use strict';

function OnboardingService($q, $timeout, ModalService) {
  var onboardingModalOptions = {
    id: 'onboarding-modal',
    showHeaderCloseButton: false,
    footerTemplateUrl: 'static/app/base/onboardingFooter.html',
    modalClass: 'modal small-modal'
  };

  var scroller;
  var scrollEndCallback;
  var adjustModalMaxHeightCallback;

  function refreshScroller() {
    return $q.when(scroller.refresh());
  }

  function registerAndExecuteCallbacks() {
    registerDeferredScrollEndCallback();
    if (adjustModalMaxHeightCallback) {
      adjustModalMaxHeightCallback();
    }
  }

  function registerDeferredScrollEndCallback() {
    if (scrollEndCallback) {
      scroller.on('scrollEnd', scrollEnd);
    }
  }
  function scrollEnd() {
    scrollEndCallback(scroller.currentPage.pageX);
  }

  return {
    initializeCarousel: function initializeCarousel(element) {
      scroller = new IScroll(element, {
        snap: true,
        momentum: false,
        scrollX: true
      });

      // http://iscrolljs.com/#refresh
      $timeout(function() {
        refreshScroller().then(function() {
          registerAndExecuteCallbacks();
        });
      }, 200);
    },
    nextSlide: function nextSlide() {
      scroller.next();
    },
    registerScrollEndCallback: function registerScrollEndCallback(callback) {
      scrollEndCallback = callback;
    },
    registerAdjustModalMaxHeightCallback: function registerAdjustModalMaxHeightCallback(callback) {
      adjustModalMaxHeightCallback = callback;
    },
    getScrollerCurrentSlide: function getScrollerCurrentSlide() {
      return scroller.currentPage.pageX;
    },
    getScrollerPagesLength: function getScrollerPagesLength() {
      return scroller.pages.length;
    },
    launchOnboarding: function launchOnboarding(successCallback) {
      onboardingModalOptions.success = {
        fn: successCallback
      };
      ModalService.createDialog('static/app/base/onboarding.html', onboardingModalOptions);
    },
    destroyScroller: function destroyScroller() {
      scroller.destroy();
      scroller = null;
    },
    executeOnboardingSuccessCallback: function executeOnboardingSuccessCallback() {
      onboardingModalOptions.success.fn();
    }
  };
}

OnboardingService.$inject = ['$q', '$timeout', 'ModalService'];
angular.module('em.services').factory('OnboardingService', OnboardingService);

function onboardingCarouselDirective($window, OnboardingService) {
  return {
    restrict: 'A',
    replace: true,
    link: function postLink(scope, element) {

      // http://codepen.io/anon/pen/Icfbj
      function adjustModalMaxHeight() {

        $('.modal').each(function() {
          if($(this).hasClass('in') === false){
            $(this).show();
          }

          var contentHeight = $window.innerHeight - 20;
          var footerHeight = $(this).find('.modal-footer').outerHeight();

          $(this).find('.modal-content').css({
            'max-height': function() {
              return contentHeight;
            }
          });

          $(this).find('.modal-body').css({
            'max-height': function() {
              return (contentHeight - footerHeight);
            }
          });

          $(this).find('.modal-dialog').css({
            'margin-top': function() {
              return -($(this).outerHeight() / 2);
            },
            'margin-left': function() {
              return -($(this).outerWidth() / 2);
            }
          });
          if($(this).hasClass('in') === false){
            $(this).hide();
          }
        });
      }

      adjustModalMaxHeight();
      OnboardingService.registerAdjustModalMaxHeightCallback(adjustModalMaxHeight);
      OnboardingService.initializeCarousel(element[0]);

      angular.element($window).bind('resize', adjustModalMaxHeight);

      // Hide event from ModalService
      var onboardingModal = document.getElementById('onboarding-modal');
      angular.element(onboardingModal).bind('hidden.bs.modal', tearDown);

      function tearDown() {
        OnboardingService.executeOnboardingSuccessCallback();
        angular.element($window).unbind('resize', adjustModalMaxHeight);
        OnboardingService.destroyScroller();
      }
    }
  };
}
onboardingCarouselDirective.$inject = ['$window', 'OnboardingService'];
angular.module('em.directives').directive('onboardingCarousel', onboardingCarouselDirective);

function onboardingFooterDirective(OnboardingService) {
  return {
    restrict: 'A',
    link: function postLink(scope) {
      scope.onboardingButtonText = 'next';

      scope.nextOnboardingSlide = function nextOnboardingSlide() {
        if (OnboardingService.getScrollerCurrentSlide() === OnboardingService.getScrollerPagesLength() - 1) {
          scope.$modalSuccess();
        } else {
          OnboardingService.nextSlide();
        }
      };

      OnboardingService.registerScrollEndCallback(scrollEnd);
      function scrollEnd(pageIndex) {
        if (pageIndex === OnboardingService.getScrollerPagesLength() - 1) {
          scope.onboardingButtonText = 'got it!';
          scope.$digest();
        } else {
          if (scope.onboardingButtonText !== 'next') {
            scope.onboardingButtonText = 'next';
            scope.$digest();
          }
        }
      }
    }
  };
}
onboardingFooterDirective.$inject = ['OnboardingService'];
angular.module('em.directives').directive('onboardingFooter', onboardingFooterDirective);
