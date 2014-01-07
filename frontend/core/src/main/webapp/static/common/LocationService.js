/*global angular */
'use strict';

function LocationService($location, $rootScope, $route) {
  // https://github.com/angular/angular.js/issues/1699#issuecomment-22511464
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
}
angular.module('common').factory('LocationService', LocationService);
LocationService.$inject = ['$location', '$rootScope', '$route'];
