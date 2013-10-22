/*global angular*/

( function() {'use strict';

    function NavbarController($location, $rootScope, $scope, userPrefix, userSessionStorage) {
      $scope.user = userSessionStorage.getUserUUID();
      $scope.collectives = userSessionStorage.getCollectives();

      $scope.setActiveUuid = function(uuid, collective) {
        userSessionStorage.setActiveUUID(uuid);
        if (collective) {
          $location.path('/collective/' + uuid);
        }
      };
    }


    NavbarController.$inject = ['$location', '$rootScope', '$scope', 'userPrefix', 'userSessionStorage'];
    angular.module('em.app').controller('NavbarController', NavbarController);
  }());
