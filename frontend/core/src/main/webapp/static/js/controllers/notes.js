/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('NotesController', ['$scope', 'errorHandler', 'itemsRequest', 'notesArray',
    function($scope, errorHandler, itemsRequest, notesArray) {

      $scope.errorHandler = errorHandler;

      itemsRequest.getItems(function(itemsResponse) {
        notesArray.setNotes(itemsResponse.notes);

        $scope.notes = notesArray.getNotes();
      }, function(error) {
      });

      $scope.notesListFilter = true;
    }]);
  }());
