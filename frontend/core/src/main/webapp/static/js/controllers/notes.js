/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('NotesController', ['$scope', 'activeItem', 'errorHandler', 'itemsRequest', 'notesArray',
    function($scope, activeItem, errorHandler, itemsRequest, notesArray) {

      $scope.errorHandler = errorHandler;

      itemsRequest.getItems(function(itemsResponse) {
        notesArray.setNotes(itemsResponse.notes);

        $scope.notes = notesArray.getNotes();
      }, function(error) {
      });

      $scope.notesListFilter = true;

      $scope.setActiveItem = function(item) {
        activeItem.setItem(item);
      };
    }]);
  }());
