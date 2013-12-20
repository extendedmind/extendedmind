/*global angular */
'use strict';

function ItemsController($location, $scope, $timeout, itemsArray, itemsRequest, notesArray, notesRequest, notesResponse, tasksRequest, tagsArray, tasksArray, userPrefix, filterService) {
  
  $scope.items = itemsArray.getItems();
  $scope.tasks = tasksArray.getTasks();
  $scope.contexts = tagsArray.getTags();
  $scope.notes = notesArray.getNotes();
  $scope.prefix = userPrefix.getPrefix();
  $scope.filterService = filterService;

  function clearCompletedText() {
    $timeout(function() {
      $scope.completed = '';
    }, 2000);
  }

  $scope.deleteItem = function(item) {
    itemsRequest.deleteItem(item);
  };

  $scope.itemToTask = function(item) {
    $scope.itemType = 'task';
    tasksRequest.itemToTask(item).then(function() {
      $scope.task = item;
    });
  };

  $scope.itemToNote = function(item) {
    $scope.completed = 'note added';
    itemsArray.removeItem(item);

    notesRequest.putExistingNote(item).then(function(putExistingNoteResponse) {
      notesResponse.putNoteContent(item, putExistingNoteResponse);
      notesArray.putNewNote(item);
      clearCompletedText();
    });
  };

  $scope.taskEditMore = function(task) {
    $location.path($scope.prefix + '/tasks/edit/' + task.uuid);
  };

  $scope.taskEditDone = function(task) {
    cleanContext(task);
    tasksRequest.itemToTaskDone(task);
  };

  var cleanContext = function(task) {
    if (task.relationships && task.relationships.context){
      task.relationships.tags = [task.relationships.context];
      delete task.relationships.context;
    }
  }

}

ItemsController.$inject = ['$location', '$scope', '$timeout', 'itemsArray', 'itemsRequest', 'notesArray', 'notesRequest', 'notesResponse', 'tasksRequest', 'tagsArray', 'tasksArray', 'userPrefix', 'filterService'];
angular.module('em.app').controller('ItemsController', ItemsController);
