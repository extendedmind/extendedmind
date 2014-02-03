'use strict';

function HomeController($scope, $location, ItemsService, UserSessionService, AuthenticationService) {

  $scope.omniBarActive = false;
  $scope.menuActive = false;
  $scope.collectives = UserSessionService.getCollectives();

  $scope.toggleMenu = function toggleMenu() {
    $scope.menuActive = !$scope.menuActive;
  };

  $scope.setCollectiveActive = function(uuid) {
    AuthenticationService.switchActiveUUID(uuid);
    $location.path('/collective/' + uuid + '/tasks');
    $scope.menuActive = false;
  };
  
  $scope.setMyActive = function() {
    AuthenticationService.switchActiveUUID(UserSessionService.getUserUUID());
    $location.path('/my/tasks');
    $scope.menuActive = false;
  };

  $scope.logout = function() {
    AuthenticationService.logout().then(function() {
      $location.path('/login');
    });
  };

  $scope.useCollectives = function () {
    if ($scope.collectives && Object.keys($scope.collectives).length > 1) {
      return true;
    }
  };

  $scope.addNewItem = function(omnibarText) {
    if ($scope.omnibarText && $scope.omnibarText.title) {
      $scope.focusOmnibar = true;
      ItemsService.saveItem(omnibarText).then(function(item) {
        // TODO: Highlight new item
        $scope.omnibarText = {};
      });
    }else{
      $location.path($scope.prefix + '/items/new');
    }
  };

  $scope.omniBarFocus = function(focus) {
    if (focus) {
      $scope.omniBarActive = true;
    } else {
      if ($scope.omnibarText == null || $scope.omnibarText.title == null || $scope.omnibarText.title.length === 0) {
        $scope.omniBarActive = false;
      }
    }
  };
}

angular.module('em.app').controller('HomeController', HomeController);
HomeController.$inject = ['$scope', '$location','ItemsService', 'UserSessionService', 'AuthenticationService'];
