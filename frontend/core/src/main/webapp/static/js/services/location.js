/*global angular */
/*jslint white: true */

( function() {'use strict';

  angular.module('em.services').factory('location', ['$location', '$rootScope', '$route',
    function($location, $rootScope, $route) {

      $location.skipReload = function() {
        var lastRoute, un;

        lastRoute = $route.current;

        un = $rootScope.$on('$locationChangeSuccess', function() {
          $route.current = lastRoute;
          un();
        });

        return $location;
      };

      return $location;
    }]);

  angular.module('em.services').factory('carouselSlide', ['$location', 'location', 'Enum', 'userPrefix',
    function($location, location, Enum, userPrefix) {

      var carouselSlideIndex;

      function setSlidePath() {

        switch(carouselSlideIndex) {
          case Enum.my.my:
          if ($location.path() !== '/' + userPrefix.getPrefix()) {
            location.skipReload().path('/' + userPrefix.getPrefix());
          }
          break;
          case Enum.my.tasks:
          if ($location.path() !== '/' + userPrefix.getPrefix() + '/tasks') {
            location.skipReload().path('/' + userPrefix.getPrefix() + '/tasks');
          }
          break;
          default:
          break;
        }
      }

      return {
        setSlideIndex: function(slide) {
          carouselSlideIndex = slide;
          setSlidePath();
        },
        getSlideIndex: function() {
          return carouselSlideIndex;
        },
        setSlidePath: function() {

        }
      };
    }]);
}());
