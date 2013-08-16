'use strict';

emControllers.controller('TasksController', ['$scope', 'Items',
function($scope, Items) {
  $scope.filterArgument = 'TASK';

  $scope.items = Items.getUserItems();
  $scope.newItems = Items.getUserNewItems();
}]);
