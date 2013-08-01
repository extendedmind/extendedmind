"use strict";

emControllers.controller('NotesController', ['$scope', 'Item', 'Items', 'UserSessionStorage',
function($scope, Item, Items, UserSessionStorage) {
  $scope.filterArgument = 'NOTE';

  Item.getItems(UserSessionStorage.getUserUUID(), function() {
    $scope.items = Items.getUserItems();
    $scope.newItems = Items.getUserNewItems();
  }, function(error) {
  });
}]);
