/*global angular*/

( function() {'use strict';

    function NotesController($location, $rootScope, $scope, activeItem, Enum, errorHandler, itemsArray, itemsRequest, location, notesArray, notesRequest, notesResponse, slideIndex, tagsArray, tasksArray) {

      $scope.errorHandler = errorHandler;

      itemsRequest.getItems().then(function() {

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
            }
            break;
          default:
            break;
        }
      });

      $scope.addNew = function() {
        $location.path('/my/notes/new/');
      };

      $scope.setActiveItem = function(item) {
        activeItem.setItem(item);
      };
    }


    NotesController.$inject = ['$location', '$rootScope', '$scope', 'activeItem', 'Enum', 'errorHandler', 'itemsArray', 'itemsRequest', 'location', 'notesArray', 'notesRequest', 'notesResponse', 'slideIndex', 'tagsArray', 'tasksArray'];
    angular.module('em.app').controller('NotesController', NotesController);
  }());
