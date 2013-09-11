/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('NavigationController', ['$location', '$rootScope', '$scope', 'locationHandler',
    function($location, $rootScope, $scope, locationHandler) {

      $scope.swipeLeft = function(url) {
        $rootScope.pageAnimation = {
          enter : 'em-page-enter-right',
          leave : 'em-page-leave-left'
        };
        $location.path(locationHandler.getPreviousLocation());
      };

      $scope.swipeRight = function(url) {
        $rootScope.pageAnimation = {
          enter : 'em-page-enter-left',
          leave : 'em-page-leave-right'
        };
        $location.path(locationHandler.getNextLocation());
      };

    }]);
  }());
