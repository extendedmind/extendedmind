/*global angular, Swiper */
'use strict';

angular.module('em.services').factory('emSwiper', [
  function() {
    var initialSlideIndex, slides, swiper;
    slides = [];

    return {
      initSwiper: function(container, params) {
        // http://www.idangero.us/sliders/swiper/api.php
        initialSlideIndex = 0;
        swiper = new Swiper(container, params);
        return swiper;
      },
      setSlides: function(initialIndex) {
        slides = ['inbox', '', 'tasks', 'tasks/today'];
        initialSlideIndex = initialIndex;
      },
      getSlides: function() {
        return slides;
      },
      getInitiaSlideIndex: function() {
        return initialSlideIndex;
      }
    };
  }]);

angular.module('em.directives').directive('swiperSlide', [
  function() {

    return {
      restrict: 'A',
      require: '^emSwiperSlider',
      scope: true,
      compile: function compile() {
        var slidePathData = [];

        return {
          pre: function preLink(scope, element, attrs, ctrl) {
            ctrl.scrollVerticalSlide(element[0]);
            slidePathData.push(attrs.swiperSlide);
          },
          post: function postLink(scope, element, attrs, ctrl) {
            // http://stackoverflow.com/a/18757437
            if (scope.$last) {
              ctrl.slidesReady(slidePathData);
            }
          }
        };
      }
    };
  }]);

function emSwiperSlider($rootScope, Enum, location, userPrefix, emSwiper) {
  var swipers = {};
  return {
    restrict: 'A',
    scope: {
      mode: '@emSwiperSlider'
    },
    controller: function($scope, $element) {
      var swiper;

      this.slidesReady = function(pathData) {
        var i, slide;
        swiper.reInit();

        if (pathData) {
          for (i = 0; i < swiper.slides.length; i++) {
            slide = swiper.getSlide(i);
            slide.setData('path', pathData[i]);
          }
        }
      };

      this.scrollVerticalSlide = function(elem) {
        elem.addEventListener('touchstart', slideTouchStart, false);
        elem.addEventListener('touchmove', slideTouchMove, false);
      };

      function changePath() {
        var activeSlide, slidePath, slideSubPath;
        activeSlide = swiper.getSlide(swiper.activeIndex);

        if (swiper.params.mode === 'horizontal') {
          swiper.params.activePath = activeSlide.getData('path');
          if (swiper.params.activePath) {
            slidePath = '/' + userPrefix.getPrefix() + '/' + swiper.params.activePath;
          } else {
            slidePath = '/' + userPrefix.getPrefix();
          }
        } else {
          slideSubPath = activeSlide.getData('path');
          slidePath = '/' + userPrefix.getPrefix() + '/' + swipers.horizontal.params.activePath + '/' + slideSubPath;
        }
        location.skipReload().path(slidePath);
        $rootScope.$apply();
      }

      function emOnSlideChangeEnd() {
        changePath();
      }

      $rootScope.slideIndex = emSwiper.getInitiaSlideIndex();

      var swiperParams = {
        mode: $scope.mode,
        noSwiping: true,
        queueStartCallbacks: true,
        queueEndCallbacks: true,
        simulateTouch: true,
        initialSlide: emSwiper.getInitiaSlideIndex(),
        onSlideChangeEnd: emOnSlideChangeEnd
      };

      swiper = emSwiper.initSwiper($element[0], swiperParams);

      if (swiper.params.mode === 'horizontal') {
        var i, slide, slides;
        i = 0;
        slides = emSwiper.getSlides();

        while (swiper.slides[i]) {
          slide = swiper.slides[i];
          slide.setData('path', slides[i]);
          i++;
        }
        swiper.params.activePath = swiper.getSlide(swiper.params.initialSlide).getData('path');
        swiper.reInit();
      }
      swipers[swiper.params.mode] = swiper;

      var top = false;
      var bottom = false;
      var up = false;
      var down = false;
      var startX, startY, distX, distY;

      function slideTouchStart() {
        var touchobj = event.changedTouches[0];
        startX = touchobj.pageX;
        startY = touchobj.pageY;
      }

      function slideTouchMove() {
        /*jshint validthis: true */
        var touchobj = event.changedTouches[0];
        distX = touchobj.pageX - startX;
        distY = touchobj.pageY - startY;

        // http://www.javascriptkit.com/javatutors/touchevents2.shtml
        if (Math.abs(distX) > Math.abs(distY)) { // horizontal
          return;
        } else if (Math.abs(distX) < Math.abs(distY)) { // vertical

          if (distY < 0) {
            down = true;
            up = false;
          } else {
            down = false;
            up = true;
          }

        // https://developer.mozilla.org/en-US/docs/Web/API/Element.scrollHeight#Determine_if_an_element_has_been_totally_scrolled
        if (this.scrollHeight - this.scrollTop <= this.clientHeight && down) {
          bottom = true;
        } else if (this.scrollTop <= 0 && up) {
          top = true;
        } else {
          bottom = false;
          top = false;
          event.stopPropagation();
        }
      }
    }
  }
};
}
angular.module('em.directives').directive('emSwiperSlider', emSwiperSlider);
emSwiperSlider.$inject = ['$rootScope', 'Enum', 'location', 'userPrefix', 'emSwiper'];
