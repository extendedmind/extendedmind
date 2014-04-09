'use strict';

function MenuController($location, $scope, AuthenticationService, UserSessionService, AnalyticsService) {
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

  $scope.gotoTasks = function() {
    if (getActiveFeature() !== 'tasks') {
      AnalyticsService.visit('tasks');
      $location.path(UserSessionService.getOwnerPrefix() + '/tasks');
    }
    $scope.toggleMenu();
  };

  $scope.gotoNotes = function() {
    if (getActiveFeature() !== 'notes') {
      AnalyticsService.visit('notes');
      $location.path(UserSessionService.getOwnerPrefix() + '/notes');
    }
    $scope.toggleMenu();
  };

  $scope.gotoInbox = function() {
    if (getActiveFeature() !== 'inbox') {
      AnalyticsService.visit('inbox');
      $location.path(UserSessionService.getOwnerPrefix() + '/inbox');
    }
    $scope.toggleMenu();
  };
  
  $scope.setMyActive = function() {
    UserSessionService.setMyActive();
    $location.path('/my/tasks');
    $scope.toggleMenu();
  };

  $scope.setCollectiveActive = function(uuid) {
    UserSessionService.setCollectiveActive(uuid);
    $location.path('/collective/' + uuid + '/tasks');
    $scope.toggleMenu();
  };

  $scope.gotoAccount = function gotoAccount() {
    $location.path('/my/account');
    $scope.toggleMenu();
  };

  $scope.gotoAbout = function gotoAbout() {
    $location.path('/about');
    $scope.toggleMenu();
  };

  $scope.logout = function() {
    AuthenticationService.logout().then(function() {
      $location.path('/login');
    });
    $scope.toggleMenu();
  };
}

MenuController.$inject = ['$location', '$scope', 'AuthenticationService', 'UserSessionService', 'AnalyticsService'];
angular.module('em.app').controller('MenuController', MenuController);
