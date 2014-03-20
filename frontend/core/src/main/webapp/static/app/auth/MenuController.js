'use strict';

function MenuController($location, $scope, AuthenticationService, UserSessionService) {
  $scope.collectives = UserSessionService.getCollectives();

  function getActiveFeature() {
    if ($location.path().endsWith('inbox')){
      return 'inbox';
    }else if ($location.path().endsWith('tasks')){
      return 'tasks';
    }else if ($location.path().endsWith('notes')){
      return 'notes';
    }
  }

  $scope.setCollectiveActive = function(uuid) {
    UserSessionService.setCollectiveActive(uuid);
    $location.path('/collective/' + uuid + '/tasks');
    $scope.toggleMenu();
  };
  
  $scope.setMyActive = function() {
    UserSessionService.setMyActive();
    $location.path('/my/tasks');
    $scope.toggleMenu();
  };

  $scope.logout = function() {
    AuthenticationService.logout().then(function() {
      $location.path('/login');
    });
  };

  $scope.useCollectives = function() {
    return $scope.collectives && Object.keys($scope.collectives).length > 1;
  };

  $scope.getFeatureClass = function(feature) {
    if ($location.path().endsWith(feature)){
      return 'active';
    }
  };

  $scope.getMyClass = function() {
    if (UserSessionService.getOwnerPrefix() === 'my'){
      return 'active';
    }
  };

  $scope.getCollectiveClass = function(uuid) {
    if (UserSessionService.getOwnerPrefix() == 'collective/' + uuid){
      return 'active';
    }
  };

  $scope.gotoInbox = function() {
    if (getActiveFeature() !== 'inbox') {
      $location.path(UserSessionService.getOwnerPrefix() + '/inbox');
    }
    $scope.toggleMenu();
  };

  $scope.gotoTasks = function() {
    if (getActiveFeature() !== 'tasks') {
      $location.path(UserSessionService.getOwnerPrefix() + '/tasks');
    }
    $scope.toggleMenu();
  };

  $scope.gotoNotes = function() {
    if (getActiveFeature() !== 'notes') {
      $location.path(UserSessionService.getOwnerPrefix() + '/notes');
    }
    $scope.toggleMenu();
  };

}

MenuController.$inject = ['$location', '$scope', 'AuthenticationService', 'UserSessionService'];
angular.module('em.app').controller('MenuController', MenuController);
