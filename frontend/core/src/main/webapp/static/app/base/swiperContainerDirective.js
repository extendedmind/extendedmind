'use strict';

function swiperContainerDirective($rootScope, $window, SwiperService) {

  return {
    restrict: 'A',
    scope: {
      swiperPath: '@swiperContainer',
      swiperType: '@swiperType',
      expectedSlidesFn: '&expectedSlides',
      onlyExternalSwipe: '=?swiperContainerOnlyExternalSwipe'
    },
    controller: function($scope, $element) {
      var swiperSlideInfos = [];
      var initializeSwiperCalled = false;

      $scope.expectedSlides = $scope.expectedSlidesFn();

      function sortAndFlattenSlideInfos() {
        // does array contain slide objects
        if (swiperSlideInfos[0].slidePath) {
          swiperSlideInfos.sort(function(a, b) {
            return a.slideIndex - b.slideIndex;
          });
          var slides = [];
          // flatten
          for (var i = 0, len = swiperSlideInfos.length; i < len; i++) {
            slides.push(swiperSlideInfos[i].slidePath);
          }
          return slides;
        }
      }

      function getSlideInfosIndex(path) {
        for (var i = 0, len = swiperSlideInfos.length; i < len; i++) {
          if (swiperSlideInfos[i].slidePath === path) {
            return i;
          }
        }
      }

      function updateSwiper() {
        var currentExpectedSlides = $scope.expectedSlidesFn();

        // (Re)inializes the swiper after the digest to make sure the whole
        // DOM is ready before this is done. Otherwise Swiper does not register
        // the slides. It is in the registerSlide function to prevent the DOM
        // from being incomplete before the swiper is created.
        //
        // To get this to work, we have to know the expected slide count.
        // Using $scope.$evalAsync should have done the right thing, but it is
        // fired way too early - only the first slides is evaluated before it
        // is fired. Using $timeout causes flickering and slows down everything.
        // https://groups.google.com/forum/#!topic/angular/SCc45uVhTt9
        // http://stackoverflow.com/a/17303759/2659424
        if (currentExpectedSlides === swiperSlideInfos.length) {
          // Update the expected slides variable only now, to make it possible
          // to push indexes forward
          $scope.expectedSlides = $scope.expectedSlidesFn();

          var slides = sortAndFlattenSlideInfos();
          if (!initializeSwiperCalled) {
            SwiperService.initializeSwiper(
              $element[0],
              $scope.swiperPath,
              $scope.swiperType,
              slides,
              onSlideChangeEndCallback,
              onResistanceBeforeCallback,
              onResistanceAfterCallback,
              $scope.onlyExternalSwipe);
            initializeSwiperCalled = true;
          } else {
            SwiperService.refreshSwiper($scope.swiperPath, slides);
          }
        }
      }

      // Registers the path of the slide to the swiper
      // and sets up listeners for element, if needed
      this.registerSlide = function(path, element, index) {

        // Slides from DOM (AngularJS directive) are not necessarily registered in desired order.
        // Slide array of objects is sorted later, during swiper initialization.
        var slideInfo = {slidePath: path, slideIndex: index, slideElement: element};
        var oldSlideInfosIndex;
        if (initializeSwiperCalled) {
          oldSlideInfosIndex = getSlideInfosIndex(path);
        }
        if (oldSlideInfosIndex === undefined) {
          // If index is somewhere in the middle of the pack, we need to
          // increase bigger indexes by one
          if ($scope.expectedSlides <= swiperSlideInfos.length) {
            for (var i = 0, len = swiperSlideInfos.length; i < len; i++) {
              if (swiperSlideInfos[i].slideIndex >= index) {
                swiperSlideInfos[i].slideIndex += 1;
              }
            }
          }
          swiperSlideInfos.push(slideInfo);
        } else {
          swiperSlideInfos[oldSlideInfosIndex] = slideInfo;
        }
        updateSwiper();
      };

      this.unregisterSlide = function(path) {
        var slideInfosIndex = getSlideInfosIndex(path);
        if (slideInfosIndex !== undefined) {
          swiperSlideInfos.splice(slideInfosIndex, 1);
          updateSwiper();
        }
      };

      function onSlideChangeEndCallback() {
        SwiperService.onSlideChangeEnd($scope, $scope.swiperPath);
      }

      var negativeHoldPosition, positiveHoldPosition;
      function onResistanceBeforeCallback(swiper, negativePosition) {
        negativeHoldPosition = negativePosition;
      }
      function onResistanceAfterCallback(swiper, positivePosition) {
        positiveHoldPosition = positivePosition;
      }
    }
  };
}
swiperContainerDirective['$inject'] = ['$rootScope', '$window', 'SwiperService'];
angular.module('em.directives').directive('swiperContainer', swiperContainerDirective);
