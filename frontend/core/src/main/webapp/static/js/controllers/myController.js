"use strict";

emControllers.controller('MyController', ['$scope', 'Item', 'Items',
function($scope, Item, Items) {

  $scope.items = Items.getUserItems();
  $scope.newItems = Items.getUserNewItems();

  $scope.putItem = function() {
    Item.putItem($scope.item, function() {
    }, function(error) {
    });
  };
}]);
