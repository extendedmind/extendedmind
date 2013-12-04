/*jslint white: true */
'use strict';

function NavbarController($location, $scope, authenticateRequest, userAuthenticate, userSessionStorage) {
  $scope.user = userSessionStorage.getUserUUID();
  $scope.collectives = userSessionStorage.getCollectives();

  $scope.logout = function() {
    authenticateRequest.logout().then(function() {
      $location.path('/login');
    });
  };

  $scope.setActiveUuid = function(uuid, collective) {
    userAuthenticate.setActiveUUID(uuid);
    if (collective) {
      $location.path('/collective/' + uuid);
    }
  };
}

NavbarController.$inject = ['$location', '$scope', 'authenticateRequest', 'userAuthenticate', 'userSessionStorage'];
angular.module('em.app').controller('NavbarController', NavbarController);
