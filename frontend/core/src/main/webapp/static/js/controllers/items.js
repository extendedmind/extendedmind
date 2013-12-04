/*jslint white: true */
'use strict';

function ItemsController($location, $scope, $timeout, itemsArray, itemsRequest, notesArray, notesRequest, notesResponse, tasksRequest) {

  function clearCompletedText() {
    $timeout(function() {
      $scope.completed = '';
    }, 2000);
  }

  $scope.deleteItem = function(item) {
    itemsRequest.deleteItem(item);
  };

  $scope.itemToTask = function(item) {
    console.log(item);
    $scope.itemType = 'task';
    tasksRequest.itemToTask(item);
    $scope.task = item;
    $scope.task.relationships = {
      parentTask: '',
      tags: []
    };
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
    tasksRequest.itemToTaskDone(task);
  };
}

ItemsController.$inject = ['$location', '$scope', '$timeout', 'itemsArray', 'itemsRequest', 'notesArray', 'notesRequest', 'notesResponse', 'tasksRequest'];
angular.module('em.app').controller('ItemsController', ItemsController);
