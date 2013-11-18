/*jslint white: true */
'use strict';

function InboxController($scope, errorHandler, itemsArray, tagsArray, tasksArray, userPrefix) {
  $scope.items = itemsArray.getItems();
  $scope.tasks = tasksArray.getTasks();
  $scope.contexts = tagsArray.getTags();

  $scope.prefix = userPrefix.getPrefix();
  $scope.errorHandler = errorHandler;
}

InboxController.$inject = ['$scope', 'errorHandler', 'itemsArray', 'tagsArray', 'tasksArray', 'userPrefix'];
angular.module('em.app').controller('InboxController', InboxController);
