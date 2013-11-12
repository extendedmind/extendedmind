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
}());
