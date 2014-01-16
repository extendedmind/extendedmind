/*global angular */
'use strict';

function HomeController($scope, $location, itemsRequest) {

  $scope.omniBarActive = false;
  $scope.menuActive = false;

  $scope.toggleMenu = function toggleMenu() {
    $scope.menuActive = !$scope.menuActive;
  };

  $scope.addNewItem = function(omnibarText) {
    if (omnibarText){
      // FIXME: refactor jQuery into directive!
      // $('#omniItem').focus();
      $scope.omnibarText = {};
      $scope.focusOmnibar = true;
      itemsRequest.putItem(omnibarText);
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
HomeController.$inject = ['$scope','$location','itemsRequest'];
