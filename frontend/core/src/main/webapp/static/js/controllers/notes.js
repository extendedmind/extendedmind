/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('NotesController', ['$scope', 'errorHandler', 'notesArray',
    function($scope, errorHandler, notesArray) {

      $scope.errorHandler = errorHandler;

      $scope.notesListFilter = true;
      $scope.notes = notesArray.getNotes();
    }]);
  }());
