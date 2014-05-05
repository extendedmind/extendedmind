'use strict';

function MenuController($location, $scope, AuthenticationService, UserSessionService, AnalyticsService) {
  $scope.collectives = UserSessionService.getCollectives();

  $scope.useCollectives = function useCollectives() {
    return $scope.collectives && Object.keys($scope.collectives).length > 1;
  };

  $scope.isAdmin = function isAdmin() {
    return UserSessionService.getUserType() === 0;
  };

  $scope.getFeatureClass = function getFeatureClass(feature) {
    if ($scope.isFeatureActive(feature)) {
      return 'active';
    }
  };

  $scope.getMyClass = function getMyClass() {
    if (UserSessionService.getOwnerPrefix() === 'my') {
      return 'active';
    }
  };

  $scope.getCollectiveClass = function getCollectiveClass(uuid) {
    if (UserSessionService.getOwnerPrefix() === 'collective/' + uuid) {
      return 'active';
    }
  };

  $scope.setMyActive = function setMyActive() {
    if (!$location.path().startsWith('/my')) {
      UserSessionService.setMyActive();
      $location.path('/my');
    }
    $scope.toggleMenu();
  };

  $scope.setCollectiveActive = function setCollectiveActive(uuid) {
    if (!$location.path().startsWith('/collective/' + uuid)) {
      UserSessionService.setCollectiveActive(uuid);
      $location.path('/collective/' + uuid);
    }
    $scope.toggleMenu();
  };

  $scope.gotoFeature = function gotoFeature(feature) {
    if (!$scope.isFeatureActive(feature)) {
      $scope.setActiveFeature(feature);
      AnalyticsService.visit(feature);
    }
    $scope.toggleMenu();
  };

  $scope.logout = function logout() {
    AuthenticationService.logout().then(function() {
      $location.path('/login');
    });
    $scope.toggleMenu();
  };
}

MenuController.$inject = ['$location', '$scope', 'AuthenticationService', 'UserSessionService', 'AnalyticsService'];
angular.module('em.app').controller('MenuController', MenuController);
