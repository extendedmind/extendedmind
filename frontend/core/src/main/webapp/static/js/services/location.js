/*global angular*/

( function() {'use strict';

    angular.module('em.services').factory('location', ['$location', '$route', '$rootScope',
    function($location, $route, $rootScope) {

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

    angular.module('em.services').factory('locationHandler', [
    function() {
      var nextLocation, previousLocation;

      return {
        setNextLocation : function(location) {
          nextLocation = location;
        },
        getNextLocation : function() {
          return nextLocation;
        },
        setPreviousLocation : function(location) {
          previousLocation = location;
        },
        getPreviousLocation : function() {
          return previousLocation;
        }
      };
    }]);

    angular.module('em.services').factory('slideUrl', [
    function() {
      var slideUrl;

      return {
        setSlideUrl : function(slideUrl) {
          this.slideUrl = slideUrl;
        },
        getSlideUrl : function() {
          return this.slideUrl;
        }
      };
    }]);
  }());
