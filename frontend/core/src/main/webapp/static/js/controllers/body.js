/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('BodyController', ['$location', '$rootScope', '$scope', 'locationHandler', 'pageTitle',
    function($location, $rootScope, $scope, locationHandler, pageTitle) {

      $scope.pageTitle = pageTitle.getTitle();

      $scope.swipeLeft = function(url) {
console.log('asd');
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
