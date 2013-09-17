/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('NotesController', ['$location', '$rootScope', '$scope', 'activeItem', 'errorHandler', 'itemsRequest', 'notesArray', 'tagsArray',
    function($location, $rootScope, $scope, activeItem, errorHandler, itemsRequest, notesArray, tagsArray) {

      $scope.errorHandler = errorHandler;
      $rootScope.subtitle = 'notes';
      activeItem.setItem(null);

      itemsRequest.getItems(function(itemsResponse) {
        notesArray.setNotes(itemsResponse.notes);
        tagsArray.setTags(itemsResponse.tags);

        $scope.notes = notesArray.getNotes();
      }, function(error) {
      });

      $scope.notesListFilter = true;

      $scope.setActiveItem = function(item) {
        activeItem.setItem(item);
      };
    }]);
  }());
