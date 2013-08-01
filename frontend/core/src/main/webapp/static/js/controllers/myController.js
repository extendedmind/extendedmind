"use strict";

emControllers.controller('MyController', ['$scope', 'Item', 'Items', 'UserSessionStorage',
function($scope, Item, Items, UserSessionStorage) {

  Item.getItems(UserSessionStorage.getUserUUID(), function() {
    $scope.items = Items.getUserItems();
    $scope.newItems = Items.getUserNewItems();
  }, function(error) {
  });

  $scope.putItem = function() {
    Item.putItem(UserSessionStorage.getUserUUID(), $scope.item, function() {
    }, function(error) {
    });
  };
}]);
