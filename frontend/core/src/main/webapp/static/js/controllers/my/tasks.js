/*global angular*/

( function() {'use strict';

  function TasksController($location, $rootScope, $scope, Enum, errorHandler,filterService, itemsArray, itemsRequest, location, notesArray, slideIndex, tagsArray, tasksArray, userPrefix) {

    $scope.errorHandler = errorHandler;
    $scope.prefix = userPrefix.getPrefix();
    $scope.filterService=filterService;

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
        if ($location.path() !== '/' + userPrefix.getPrefix()) {
          location.skipReload().path('/' + userPrefix.getPrefix());
        }
        break;
        case Enum.my.tasks:
        if ($location.path() !== '/' + userPrefix.getPrefix() + '/tasks') {
          location.skipReload().path('/' + userPrefix.getPrefix() + '/tasks');
        }
        break;
        default:
        break;
      }
    });

    $scope.addNew = function() {
      $location.path(userPrefix.getPrefix() + '/tasks/new');
    };
  }


  TasksController.$inject = ['$location', '$rootScope', '$scope', 'Enum', 'errorHandler','filterService', 'itemsArray', 'itemsRequest', 'location', 'notesArray', 'slideIndex', 'tagsArray', 'tasksArray', 'userPrefix'];
  angular.module('em.app').controller('TasksController', TasksController);
}());
