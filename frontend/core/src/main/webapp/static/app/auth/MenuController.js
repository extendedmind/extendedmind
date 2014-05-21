'use strict';

function MenuController($location, $scope, AuthenticationService, UISessionService, UserSessionService, AnalyticsService) {
  $scope.collectives = UserSessionService.getCollectives();

  $scope.useCollectives = function useCollectives() {
    return $scope.collectives && Object.keys($scope.collectives).length > 1;
  };

  $scope.isAdmin = function isAdmin() {
    return UserSessionService.getUserType() === 0;
  };

  $scope.getFeatureClass = function getFeatureClass(feature) {
    if (UISessionService.getCurrentFeatureName() === feature) {
      return 'active';
    }
  };

  $scope.getMyClass = function getMyClass() {
    if (UISessionService.getOwnerPrefix() === 'my') {
      return 'active';
    }
  };

  $scope.getCollectiveClass = function getCollectiveClass(uuid) {
    if (UISessionService.getOwnerPrefix() === 'collective/' + uuid) {
      return 'active';
    }
  };

  $scope.setMyActive = function setMyActive() {
    if (!$location.path().startsWith('/my')) {
      UISessionService.setMyActive();
      $location.path('/my');
    }
    $scope.toggleMenu();
  };

  $scope.setCollectiveActive = function setCollectiveActive(uuid) {
    if (!$location.path().startsWith('/collective/' + uuid)) {
      UISessionService.setCollectiveActive(uuid);
      $location.path('/collective/' + uuid);
    }
    $scope.toggleMenu();
  };

  $scope.gotoFeature = function gotoFeature(feature) {
    if (UISessionService.getCurrentFeatureName() !== feature) {
      var state = UISessionService.getFeatureState(feature);
      if (!state && feature === 'notes'){
        state = 'notes/home';
      }
      UISessionService.changeFeature(feature, undefined, state);
      AnalyticsService.visit(feature);
    }
    $scope.toggleMenu();
  };

  $scope.logout = function logout() {
    AuthenticationService.logout().then(function() {
      $location.path('/login');
      UserSessionService.clearUser();
    });
    $scope.toggleMenu();
  };
}

MenuController.$inject = ['$location', '$scope', 'AuthenticationService', 'UISessionService', 'UserSessionService', 'AnalyticsService'];
angular.module('em.app').controller('MenuController', MenuController);
