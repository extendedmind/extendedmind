/*global angular */
'use strict';

function HomeController($scope, itemsRequest) {

  $scope.omniBarActive = false;
  $scope.menuActive = false;

  $scope.toggleMenu = function toggleMenu() {
    $scope.menuActive = !$scope.menuActive;
  };

  $scope.addNewItem = function(omnibarText) {
    // FIXME: refactor jQuery into directive!
    // $('#omniItem').focus();
    $scope.omnibarText = {};
    $scope.focusOmnibar = true;
    itemsRequest.putItem(omnibarText);
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
HomeController.$inject = ['$scope','itemsRequest'];
