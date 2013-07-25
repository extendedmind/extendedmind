"use strict";

emControllers.controller('TasksController', ['$scope', 'Item', 'Items', 'User',
function($scope, Item, Items, User) {
  $scope.filterArgument = 'TASK';

  Item.getItems(User.getUserUUID(), function() {
    $scope.items = Items.getUserItems();
    $scope.newItems = Items.getUserNewItems();
  }, function(error) {
  });
}]);
