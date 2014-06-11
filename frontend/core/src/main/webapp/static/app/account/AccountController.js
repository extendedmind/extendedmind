'use strict';

function AccountController($rootScope, $location, $scope, AccountService, AnalyticsService, UserSessionService, UISessionService) {

  $scope.isUserVerified = false;
  AnalyticsService.visit('account');

  AccountService.getAccount().then(function(accountResponse) {
    $scope.isUserVerified = accountResponse.emailVerified ? true : false;
    $scope.email = accountResponse.email;
  });

  $scope.gotoChangePassword = function gotoChangePassword() {
    $location.path('/my/account/password');
  };

  $scope.gotoAdmin = function gotoAdmin() {
    $location.path('/admin');
  };

  $scope.useCollectives = function useCollectives() {
    return $scope.collectives && Object.keys($scope.collectives).length > 1;
  };

  $scope.setMyActive = function setMyActive() {
    if (!$location.path().startsWith('/my')) {
      UISessionService.setMyActive();
      UISessionService.changeFeature('tasks');
      $location.path('/my');
    }else{
      $scope.toggleMenu();
    }
  };

  $scope.setCollectiveActive = function setCollectiveActive(uuid) {
    if (!$location.path().startsWith('/collective/' + uuid)) {
      UISessionService.setCollectiveActive(uuid);
      UISessionService.changeFeature('tasks');
      $location.path('/collective/' + uuid);
    }
  };

  $scope.gotoCollectiveInbox = function gotoCollectiveInbox(uuid){
    $scope.setCollectiveActive(uuid);
    UISessionService.changeFeature('inbox');
  }

  $scope.gotoCollectiveTasks = function gotoCollectiveTasks(uuid){
    $scope.setCollectiveActive(uuid);
    UISessionService.changeFeature('tasks');
  }

  $scope.gotoCollectiveNotes = function gotoCollectiveNotes(uuid){
    $scope.setCollectiveActive(uuid);
    UISessionService.changeFeature('notes');
  }

  $scope.gotoCollectiveArchive = function gotoCollectiveArchive(uuid){
    $scope.setCollectiveActive(uuid);
    UISessionService.changeFeature('archive');
  }

  $scope.getMyClass = function getMyClass() {
    if (UISessionService.getOwnerPrefix() === 'my') {
      return 'active';
    }else{
      return 'highlighted-link';
    }
  };

  $scope.getCollectiveClass = function getCollectiveClass(uuid) {
    if (UISessionService.getOwnerPrefix() === 'collective/' + uuid) {
      return 'active';
    }else{
      return 'highlighted-link';
    }
  };

  // LOGOUT
  $scope.logout = function logout() {
    AccountService.logout().then(function() {
      $location.path('/login');
      UserSessionService.clearUser();
    });
  };
}

AccountController['$inject'] = ['$rootScope', '$location', '$scope', 'AccountService', 'AnalyticsService', 'UserSessionService', 'UISessionService'];
angular.module('em.app').controller('AccountController', AccountController);
