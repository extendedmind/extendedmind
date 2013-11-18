/*jslint white: true */
'use strict';

function ItemsController($location, $scope, $timeout, filterService, itemsArray, itemsRequest, notesArray, notesRequest, notesResponse, tasksResponse, tasksRequest) {

  function clearCompletedText() {
    $timeout(function() {
      $scope.completed = '';
    }, 2000);
  }

  $scope.filterService = filterService;

  $scope.deleteItem = function(item) {
    itemsRequest.deleteItem(item);
  };

  $scope.itemToTask = function(item) {
    $scope.itemType = 'task';
    tasksRequest.itemToTask(item);
    $scope.task = item;
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

ItemsController.$inject = ['$location', '$scope', '$timeout', 'filterService', 'itemsArray', 'itemsRequest', 'notesArray', 'notesRequest', 'notesResponse', 'tasksResponse', 'tasksRequest'];
angular.module('em.app').controller('ItemsController', ItemsController);
