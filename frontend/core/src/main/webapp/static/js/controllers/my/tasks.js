/*global angular*/

( function() {'use strict';

    function TasksController($location, $rootScope, $scope, activeItem, Enum, errorHandler, itemsArray, itemsRequest, location, notesArray, slideIndex, tagsArray, tasksArray) {

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

      $scope.slide = slideIndex;

      $rootScope.$on('event:slideIndexChanged', function() {
        switch($scope.slide) {
          case Enum.my.my:
            if ($location.path() !== '/my') {
              location.skipReload().path('/my');
            }
            break;
          case Enum.my.tasks:
            if ($location.path() !== '/my/tasks') {
              location.skipReload().path('/my/tasks');
            }
            break;
          default:
            break;
        }
      });

      $scope.addNew = function() {
        $location.path('/my/tasks/new/');
      };

      $scope.setActiveItem = function(task) {
        activeItem.setItem(task);
      };
    }


    TasksController.$inject = ['$location', '$rootScope', '$scope', 'activeItem', 'Enum', 'errorHandler', 'itemsArray', 'itemsRequest', 'location', 'notesArray', 'slideIndex', 'tagsArray', 'tasksArray', 'tasksRequest', 'tasksResponse'];
    angular.module('em.app').controller('TasksController', TasksController);
  }());
