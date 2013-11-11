/*global angular */
/*jslint white: true */

( function() {'use strict';

  function MyController($scope, errorHandler, itemsArray, itemsRequest, itemsResponse, notesArray, tagsArray, tasksArray, userPrefix) {

    $scope.errorHandler = errorHandler;
    $scope.prefix = userPrefix.getPrefix();

    itemsRequest.getItems().then(function() {

      $scope.items = itemsArray.getItems();
      $scope.notes = notesArray.getNotes();
      $scope.tasks = tasksArray.getTasks();
      $scope.tags = tagsArray.getTags();
      $scope.projects = tasksArray.getProjects();
      $scope.subtasks = tasksArray.getSubtasks();

    });
  }

  MyController.$inject = ['$scope', 'errorHandler', 'itemsArray', 'itemsRequest', 'itemsResponse', 'notesArray', 'tagsArray', 'tasksArray', 'userPrefix'];
  angular.module('em.app').controller('MyController', MyController);
}());
