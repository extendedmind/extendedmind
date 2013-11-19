/*jslint white: true */
'use strict';

function NotesController($location, $rootScope, $scope, Enum, errorHandler, filterService, itemsArray, location, notesArray, slide, tagsArray, tasksArray, userPrefix) {

  $scope.slide = slide;

  $scope.notes = notesArray.getNotes();
  $scope.items = itemsArray.getItems();
  $scope.tasks = tasksArray.getTasks();
  $scope.contexts = tagsArray.getTags();

  $scope.filterService = filterService;
  $scope.prefix = userPrefix.getPrefix();
  $scope.errorHandler = errorHandler;

  function changePath() {
    switch($scope.slide) {
      case Enum.my.my:
      if ($location.path() !== '/' + $scope.prefix) {
        location.skipReload().path('/' + $scope.prefix);
      }
      break;
      case Enum.my.notes:
      if ($location.path() !== '/' + $scope.prefix + '/notes') {
        location.skipReload().path('/' + $scope.prefix + '/notes');
      }
      break;
      default:
      break;
    }
  }

  $rootScope.$on('event:slideIndexChanged', function() {
    changePath();
  });

  $scope.addNew = function() {
    $location.path(userPrefix.getPrefix() + '/notes/new');
  };
}


NotesController.$inject = ['$location', '$rootScope', '$scope', 'Enum', 'errorHandler', 'filterService', 'itemsArray', 'location', 'notesArray', 'slide', 'tagsArray', 'tasksArray', 'userPrefix'];
angular.module('em.app').controller('NotesController', NotesController);
