"use strict";

emControllers.controller('HomeController', ['$scope', 'Item', 'Items', 'User',
function($scope, Item, Items, User) {

  Item.getItems(User.getUserUUID(), function() {
    $scope.items = Items.getUserItems();
  }, function(error) {
  });

  $scope.putItem = function() {
    Item.putItem(User.getUserUUID(), $scope.item, function() {
    }, function(error) {
    });
  };
}]);
