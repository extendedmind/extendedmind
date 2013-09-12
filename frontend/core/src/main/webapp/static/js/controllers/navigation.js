/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('NavigationController', ['$location', '$rootScope', '$scope', 'locationHandler', 'pageTitle',
    function($location, $rootScope, $scope, locationHandler, pageTitle) {
      
      $scope.previous=function(){
        $location.path(locationHandler.getPreviousLocation());
      };
      
      $scope.next=function(){
        $location.path(locationHandler.getNextLocation());
      };

      $scope.swipeLeft = function() {
        $rootScope.pageAnimation = {
          enter : 'em-animate-enter-right',
          leave : 'em-animate-leave-left'
        };
        $location.path(locationHandler.getPreviousLocation());
      };

      $scope.swipeRight = function() {
        $rootScope.pageAnimation = {
          enter : 'em-animate-enter-left',
          leave : 'em-animate-leave-right'
        };
        $location.path(locationHandler.getNextLocation());
      };

    }]);
  }());
