"use strict";

emControllers.controller('NotesController', ['$scope', 'Item', 'Items', 'User',
function($scope, Item, Items, User) {
  $scope.filterArgument = 'NOTE';

  Item.getItems(User.getUserUUID(), function() {
    $scope.items = Items.getUserItems();
    $scope.newItems = Items.getUserNewItems();
  }, function(error) {
  });
}]);
