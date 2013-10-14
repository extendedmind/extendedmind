/*global angular*/

( function() {'use strict';

    function MyController($location, $rootScope, $scope, activeItem, Enum, errorHandler, itemsArray, itemsRequest, itemsResponse, location, notesArray, slideIndex, tagsArray, tasksArray) {

      $scope.errorHandler = errorHandler;

      $scope.items = [];
      $scope.notes = [];
      $scope.tasks = [];

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
          case Enum.my.notes:
            if ($location.path() !== '/my/notes') {
              location.skipReload().path('/my/notes');
              $scope.newLocation = '/my/notes/new/';
            }
            break;
          case Enum.my.tasks:
            if ($location.path() !== '/my/tasks') {
              location.skipReload().path('/my/tasks');
              $scope.newLocation = '/my/tasks/new/';
            }
            break;
          default:
            break;
        }
      });

      $scope.setActiveItem = function(item) {
        activeItem.setItem(item);
      };
    }


    MyController.$inject = ['$location', '$rootScope', '$scope', 'activeItem', 'Enum', 'errorHandler', 'itemsArray', 'itemsRequest', 'itemsResponse', 'location', 'notesArray', 'slideIndex', 'tagsArray', 'tasksArray'];
    angular.module('em.app').controller('MyController', MyController);
  }());
