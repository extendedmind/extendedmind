'use strict';

emControllers.controller('TasksController', ['$scope', 'itemsFactory',
function($scope, itemsFactory) {
  $scope.filterArgument = 'TASK';

  $scope.items = itemsFactory.getUserItems();
  $scope.newItems = itemsFactory.getUserNewItems();
}]);
