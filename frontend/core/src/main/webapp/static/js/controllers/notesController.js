'use strict';

emControllers.controller('NotesController', ['$scope', 'itemsFactory',
function($scope, itemsFactory) {
  $scope.filterArgument = 'NOTE';

  $scope.items = itemsFactory.getUserItems();
  $scope.newItems = itemsFactory.getUserNewItems();
}]);
