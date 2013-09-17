/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('NotesController', ['$location', '$rootScope', '$scope', 'activeItem', 'errorHandler', 'itemsRequest', 'notesArray', 'tagsArray',
    function($location, $rootScope, $scope, activeItem, errorHandler, itemsRequest, notesArray, tagsArray) {

      activeItem.setItem(null);

      $scope.notes = notesArray.getNotes();

      $scope.notesListFilter = true;

      $scope.setActiveItem = function(item) {
        activeItem.setItem(item);
      };
    }]);
  }());
