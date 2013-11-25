/*global Swiper */
/*jslint white: true */
'use strict';

angular.module('em.directives').directive('emSwiper', ['$location', '$rootScope', 'location', 'userPrefix', function($location, $rootScope, location, userPrefix) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var swiper;
      $rootScope.slideIndex = 0;

      function changePath() {
        scope.feature = swiper.getSlide(swiper.activeIndex).getData('feature');
        location.skipReload().path('/' + userPrefix.getPrefix() + swiper.getSlide(swiper.activeIndex).getData('path'));
        $rootScope.$apply();
      }

      // http://www.idangero.us/sliders/swiper/api.php
      swiper = new Swiper('.swiper-container', {
        // initialSlide: 0,
        noSwiping: true,
        simulateTouch: true,
        queueEndCallbacks: true,
        onSlideChangeEnd: function(sw) {
          $rootScope.slideIndex = sw.activeIndex;
          changePath();
        }
      });

      swiper.params.emFeature = 'tasks';

      scope.nextSlide = function() {
        swiper.swipeNext();
      };

      scope.prevSlide = function() {
        swiper.swipePrev();
      };

      scope.gotoHome = function() {
        swiper.swipeTo(0);
      };

      scope.gotoTasks = function() {
        if (swiper.params.emFeature === 'tasks') {
          swiper.swipeTo(1);
        }
        else {
          $location.path(userPrefix.getPrefix + '/tasks');
        }
      };

      swiper.getSlide(0).setData('path', '');
      swiper.getSlide(1).setData('path', '/tasks').setData('feature', 'tasks');
      swiper.getSlide(2).setData('path', '/tasks/today').setData('feature', 'date');
    }
  };
}]);
