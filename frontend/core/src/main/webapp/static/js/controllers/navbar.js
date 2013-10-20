/*global angular*/

( function() {'use strict';

    function NavbarController($scope, userSessionStorage) {
      $scope.user = userSessionStorage.getUserUUID();
      $scope.collectives = userSessionStorage.getCollectives();

      $scope.setActiveUuid = function(uuid) {
        userSessionStorage.setActiveUuid(uuid);
      };
    }


    NavbarController.$inject = ['$scope', 'userSessionStorage'];
    angular.module('em.app').controller('NavbarController', NavbarController);
  }());
