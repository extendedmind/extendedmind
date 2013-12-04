'use strict';

angular.module('em.directives').directive('emSwiper', ['$rootScope', 'Enum', 'location', 'userPrefix', 'swiperSlides', function($rootScope, Enum, location, userPrefix, swiperSlides) {
  return {
    restrict: 'A',
    link: function(scope, element) {
      var swiper;

      function changePath() {
        scope.feature = swiper.getSlide(swiper.activeIndex).getData('feature');
        location.skipReload().path('/' + userPrefix.getPrefix() + swiper.getSlide(swiper.activeIndex).getData('path'));
        $rootScope.$apply();
      }

      function emOnSlideChangeEnd(sw) {
        $rootScope.slideIndex = sw.activeIndex;
        changePath();
      }

      $rootScope.slideIndex = swiperSlides.getInitiaSlideIndex();

      // http://www.idangero.us/sliders/swiper/api.php
      swiper = new Swiper(element[0], {
        mode: 'vertical',
        freeModeFluid: true,
        initialSlide: swiperSlides.getInitiaSlideIndex(),
        noSwiping: true,
        // simulateTouch: true,
        queueStartCallbacks: true,
        queueEndCallbacks: true,
        visibilityFullFit: true,

        onSlideChangeEnd: emOnSlideChangeEnd,
      });

      var top = false;
      var bottom = false;
      var up = false;
      var down = false;
      var startY, distY;

      function slideTouchStart() {
        var touchobj = event.changedTouches[0];
        startY = touchobj.pageY;
      }

      function slideTouchMove() {
        /*jshint validthis: true */
        var touchobj = event.changedTouches[0];
        distY = touchobj.pageY - startY;

        if (distY < 0) {
          down = true;
          up = false;
        } else {
          down = false;
          up = true;
        }

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

      swiper.getSlide(2).addEventListener('touchstart', slideTouchStart, false);
      swiper.getSlide(2).addEventListener('touchmove', slideTouchMove, false);

      scope.nextSlide = function() {
        swiper.swipeNext();
      };

      scope.prevSlide = function() {
        swiper.swipePrev();
      };

      scope.gotoHome = function() {
        swiper.swipeTo(Enum.MY);
      };

      scope.gotoTasks = function() {
        swiper.swipeTo(Enum.TASKS);
      };

      scope.gotoInbox = function() {
        swiper.swipeTo(Enum.INBOX);
      };

      swiper.getSlide(Enum.INBOX).setData('path', '/inbox').setData('feature', 'inbox');
      swiper.getSlide(Enum.MY).setData('path', '').setData('feature', 'my');
      swiper.getSlide(Enum.TASKS).setData('path', '/tasks').setData('feature', 'tasks');
      swiper.getSlide(Enum.TODAY).setData('path', '/tasks/today').setData('feature', 'date');

      scope.feature = swiper.getSlide(swiperSlides.getInitiaSlideIndex()).getData('feature');
    }
  };
}]);
