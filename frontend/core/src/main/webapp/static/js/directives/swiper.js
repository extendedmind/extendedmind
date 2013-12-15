/*global angular, Swiper */
'use strict';

function emSwiper($rootScope, emLocation, userPrefix) {
  var initialSlideIndex, initialSubPath, slides, swiper, swipers;
  slides = [];
  swipers = {};

  var slideX, slideY;
  var sw = {};

  return {
    initSwiper: function(container, params) {
      // http://www.idangero.us/sliders/swiper/api.php
      swiper = new Swiper(container, params);
      swipers[swiper.params.mode] = swiper;
      return swiper;
    },
    changePath: function(swiper) {
      var activeSlide, slidePath, slideSubPath;
      activeSlide = swiper.getSlide(swiper.activeIndex);

      if (swiper.params.mode === 'horizontal') {
        if (activeSlide.getData('path')) {
          slidePath = '/' + userPrefix.getPrefix() + '/' + activeSlide.getData('path');
        } else {
          slidePath = '/' + userPrefix.getPrefix();
        }
      } else { // vertical
        slideSubPath = activeSlide.getData('path');
        slidePath = '/' + userPrefix.getPrefix() + '/' + this.getSwiper('horizontal').getSlide(this.getSwiper('horizontal').activeIndex).getData('path') + '/' + slideSubPath;
      }
      emLocation.skipReload().path(slidePath);
      $rootScope.$apply();
    },
    getSwiper: function(mode) {
      return swipers[mode];
    },
    setSlides: function(initialIndex, subPath) {
      initialSubPath = subPath;
      slides = ['inbox', '', 'tasks/dates', 'tasks/projects', 'tasks'];
      initialSlideIndex = initialIndex;
    },
    getSlides: function() {
      return slides;
    },
    setSlideIndex: function(coordX, coordY) {
      swipers.horizontal.swipeTo(coordX);

      sw[coordX].swipeTo(coordY);
    },
    setInitialSlideIndex: function(initialIndex) {
      initialSlideIndex = initialIndex;
    },
    getInitiaSlideIndex: function() {
      return initialSlideIndex;
    },
    setVerticalSwiper: function(coordX) {
      sw[coordX] = swiper;
    },
    getSlideX: function() {
      return slideX;
    },
    setSlideY: function(coordY) {
      slideY = coordY;
    },
    getSlideY: function() {
      return slideY;
    },
    getInitialSubPath: function() {
      return initialSubPath;
    }
  };
}
angular.module('em.services').factory('emSwiper', emSwiper);
emSwiper.$inject = ['$rootScope', 'emLocation', 'userPrefix'];

function swiperSlide(emSwiper) {
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
            var i = 0;

            if (emSwiper.getInitialSubPath()) {
              while (slidePathData[i]) {
                if (slidePathData[i] === emSwiper.getInitialSubPath()) {
                  emSwiper.setInitialSlideIndex(i);
                }
                i++;
              }
            }
            ctrl.slidesReady(slidePathData);
          }
        }
      };
    }
  };
}
angular.module('em.directives').directive('swiperSlide', swiperSlide);
swiperSlide.$inject = ['emSwiper'];

function emSwiperSlider(emSwiper) {
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
          swiper.swipeTo(emSwiper.getInitiaSlideIndex(), 0, false);
        }
      };

      this.scrollVerticalSlide = function(elem) {
        elem.addEventListener('touchstart', slideTouchStart, false);
        elem.addEventListener('touchmove', slideTouchMove, false);
      };

      function emOnSlideChangeEnd() {
        emSwiper.changePath(swiper);
      }

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
      }

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
emSwiperSlider.$inject = ['emSwiper'];
