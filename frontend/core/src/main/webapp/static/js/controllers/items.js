/*global angular */
/*jslint white: true */

( function() {'use strict';

  function ItemsController($scope, $timeout, itemsArray, itemsRequest, notesArray, notesRequest, notesResponse, tasksArray, tasksRequest, tasksResponse) {

    function clearCompletedText() {
      $timeout(function() {
        $scope.completed = '';
      }, 2000);
    }

    $scope.deleteItem = function(item) {
      itemsRequest.deleteItem(item);
    };

    $scope.itemToTask = function(item) {

      $scope.completed = 'task added';
      itemsArray.removeItem(item);

      tasksRequest.putExistingTask(item).then(function(putExistingTaskResponse) {
        tasksResponse.putTaskContent(item, putExistingTaskResponse);
        tasksArray.putNewTask(item);
        clearCompletedText();
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
  }

  ItemsController.$inject = ['$scope', '$timeout', 'itemsArray', 'itemsRequest', 'notesArray', 'notesRequest', 'notesResponse', 'tasksArray', 'tasksRequest', 'tasksResponse'];
  angular.module('em.app').controller('ItemsController', ItemsController);
}());
