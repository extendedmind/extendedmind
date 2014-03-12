'use strict';

function MenuController($location, $scope, AuthenticationService, UserSessionService) {
  $scope.collectives = UserSessionService.getCollectives();

  $scope.setCollectiveActive = function(uuid) {
    UserSessionService.setCollectiveActive(uuid);
    $location.path('/collective/' + uuid + '/tasks');
  };
  
  $scope.setMyActive = function() {
    UserSessionService.setMyActive();
    $location.path('/my/tasks');
  };

  $scope.logout = function() {
    AuthenticationService.logout().then(function() {
      $location.path('/login');
    });
  };

  $scope.useCollectives = function() {
    return $scope.collectives && Object.keys($scope.collectives).length > 1;
  };
}

MenuController.$inject = ['$location', '$scope', 'AuthenticationService', 'UserSessionService'];
angular.module('em.app').controller('MenuController', MenuController);
