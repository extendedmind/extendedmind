/*global angular*/

( function() {'use strict';

    function MyController($scope, activeItem, errorHandler, itemsArray, itemsRequest, itemsResponse, notesArray, tagsArray, tasksArray) {

      $scope.errorHandler = errorHandler;

      itemsRequest.getItems().then(function(itemsResponse) {

        itemsArray.setItems(itemsResponse.items);
        notesArray.setNotes(itemsResponse.notes);
        tagsArray.setTags(itemsResponse.tags);
        tasksArray.setTasks(itemsResponse.tasks);

        $scope.items = itemsArray.getItems();
        $scope.notes = notesArray.getNotes();
        $scope.tasks = tasksArray.getTasks();
        $scope.tags = tagsArray.getTags();
        $scope.projects = tasksArray.getProjects();
        $scope.subtasks = tasksArray.getSubtasks();

      });

      $scope.setActiveItem = function(item) {
        activeItem.setItem(item);
      };
    }


    MyController.$inject = ['$scope', 'activeItem', 'errorHandler', 'itemsArray', 'itemsRequest', 'itemsResponse', 'notesArray', 'tagsArray', 'tasksArray'];
    angular.module('em.app').controller('MyController', MyController);
  }());
