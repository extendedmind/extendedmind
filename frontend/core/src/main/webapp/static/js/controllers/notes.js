/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('NotesController', ['$scope', 'activeItem', 'notesArray', 'tagsArray',
    function($scope, activeItem, notesArray, tagsArray) {

      $scope.notes = notesArray.getNotes();
      $scope.contexts = tagsArray.getTags();

      $scope.notesListFilter = true;

      $scope.setActiveItem = function(item) {
        activeItem.setItem(item);
      };
    }]);
  }());
