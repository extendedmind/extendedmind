'use strict';

function OnboardingService($q, $timeout, ModalService) {
  var onboardingModalOptions = {
    id: 'onboardingDialog',
    showHeaderCloseButton: false,
    backdrop: true,
    footerTemplateUrl: 'static/app/base/onboardingFooter.html',
    modalClass: 'modal'
  };
  
  var scroller;
  var scrollEndCallback;

  function refreshScroller() {
    $q.when(scroller.refresh()).then(registerDeferredScrollEndCallback);
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
      $timeout(refreshScroller, 200);
    },
    nextSlide: function nextSlide() {
      scroller.next();
    },
    registerScrollEndCallback: function registerScrollEndCallback(callback) {
      scrollEndCallback = callback;
    },
    getScrollerCurrentSlide: function getScrollerCurrentSlide() {
      return scroller.currentPage.pageX;
    },
    getScrollerPagesLength: function getScrollerPagesLength() {
      return scroller.pages.length;
    },
    launchOnboarding: function launchOnboarding() {
      ModalService.createDialog('static/app/base/onboarding.html', onboardingModalOptions);
    }
  };
}

OnboardingService.$inject = ['$q', '$timeout', 'ModalService'];
angular.module('em.services').factory('OnboardingService', OnboardingService);

function onboardingCarouselDirective(OnboardingService) {
  return {
    restrict: 'A',
    replace: true,
    link: function postLink($scope, $element) {
      OnboardingService.initializeCarousel($element[0]);
    }
  };
}
onboardingCarouselDirective.$inject = ['OnboardingService'];
angular.module('em.directives').directive('onboardingCarousel', onboardingCarouselDirective);

function onboardingFooterDirective(OnboardingService) {
  return {
    restrict: 'A',
    link: function postLink(scope) {
      scope.onboardingButtonText = 'next';

      scope.nextOnboardingSlide = function nextOnboardingSlide() {
        if (OnboardingService.getScrollerCurrentSlide() === OnboardingService.getScrollerPagesLength() - 1) {
          scope.$modalCancel();
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
