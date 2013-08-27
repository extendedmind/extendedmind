/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('NotesController', ['$scope', 'itemsFactory',
    function($scope, itemsFactory) {
      $scope.notesListFilter = true;
      $scope.notes = itemsFactory.getUserNotes();
    }]);
  }());
