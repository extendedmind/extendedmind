/*global angular */
'use strict';

function HomeController($scope, itemsSRequest) {

  $scope.omniBarActive = false;

  $scope.addNewItem = function(item) {
    // FIXME: refactor jQuery into directive!
    // $('#omniItem').focus();
    $scope.newItem = {};
    $scope.focusOmnibar = true;
    itemsRequest.putItem(item);
  };

  $scope.omniBarFocus = function(focus) {
    if (focus) {
      $scope.omniBarActive = true;
    } else {
      if ($scope.newItem == null || $scope.newItem.title == null || $scope.newItem.title.length === 0) {
        $scope.omniBarActive = false;
      }
    }
  };
}

angular.module('em.app').controller('HomeController', HomeController);
HomeController.$inject = ['$scope','itemsRequest'];
