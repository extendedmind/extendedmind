"use strict";

emControllers.controller('MyController', ['$scope', 'Item', 'Items', 'User',
function($scope, Item, Items, User) {

  Item.getItems(User.getUserUUID(), function() {
    $scope.items = Items.getUserItems();
    $scope.newItems = Items.getUserNewItems();
  }, function(error) {
  });

  $scope.putItem = function() {
    Item.putItem(User.getUserUUID(), $scope.item, function() {
    }, function(error) {
    });
  };
}]);
