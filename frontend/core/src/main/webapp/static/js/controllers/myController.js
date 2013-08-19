'use strict';

emControllers.controller('MyController', ['$scope', 'itemFactory', 'itemsFactory',
function($scope, itemFactory, itemsFactory) {

  $scope.items = itemsFactory.getUserItems();
  $scope.newItems = itemsFactory.getUserNewItems();

  $scope.putItem = function() {
    itemFactory.putItem($scope.item, function() {
    }, function(error) {
    });
  };
}]);
