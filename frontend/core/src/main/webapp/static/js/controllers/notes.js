/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('NotesController', ['$scope', 'notesArray',
    function($scope, notesArray) {
      $scope.notesListFilter = true;
      $scope.notes = notesArray.getNotes();
    }]);
  }());
