"use strict";

emControllers.controller('TasksController', ['$scope', 'Item', 'Items', 'UserSessionStorage',
function($scope, Item, Items, UserSessionStorage) {
  $scope.filterArgument = 'TASK';

  Item.getItems(UserSessionStorage.getUserUUID(), function() {
    $scope.items = Items.getUserItems();
    $scope.newItems = Items.getUserNewItems();
  }, function(error) {
  });
}]);
