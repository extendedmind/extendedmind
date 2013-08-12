"use strict";

emControllers.controller('NotesController', ['$scope', 'Items',
function($scope, Items) {
  $scope.filterArgument = 'NOTE';

  $scope.items = Items.getUserItems();
  $scope.newItems = Items.getUserNewItems();
}]);
