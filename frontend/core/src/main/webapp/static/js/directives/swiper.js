/*global Swiper */
/*jslint white: true */
'use strict';

angular.module('em.directives').directive('emSwiper', ['$location', '$rootScope', 'Enum', 'location', 'userPrefix', 'swiperSlides', function($location, $rootScope, Enum, location, userPrefix, swiperSlides) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var swiper;
      $rootScope.slideIndex = swiperSlides.getInitiaSlideIndex();

      function changePath() {
        scope.feature = swiper.getSlide(swiper.activeIndex).getData('feature');
        location.skipReload().path('/' + userPrefix.getPrefix() + swiper.getSlide(swiper.activeIndex).getData('path'));
        $rootScope.$apply();
      }

      // http://www.idangero.us/sliders/swiper/api.php
      swiper = new Swiper('.swiper-container', {
        initialSlide: swiperSlides.getInitiaSlideIndex(),
        noSwiping: true,
        simulateTouch: true,
        queueEndCallbacks: true,
        onSlideChangeEnd: function(sw) {
          $rootScope.slideIndex = sw.activeIndex;
          changePath();
        }
      });

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
