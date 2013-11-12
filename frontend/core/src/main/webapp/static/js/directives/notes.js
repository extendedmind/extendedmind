/*global angular */
/*jslint white: true */

( function() {'use strict';

  angular.module('em.directives').directive('notes', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/my/notes.html'
      };
    }]);

  angular.module('em.directives').directive('filteredNotesList', [
    function() {
      return {
        controller : 'NotesListController',
        restrict : 'A',
        templateUrl : 'static/partials/templates/notes/filteredNotesList.html',
        transclude : true,
        link : function(scope, element, attrs) {
          var notesFilterAttr = attrs.notesfilter;

          scope.$watch(notesFilterAttr, function(newValue) {
            scope.notesListFilter = newValue;
          });
        }
      };
    }]);

  angular.module('em.directives').directive('notesList', [
    function() {
      return {
        controller : 'NotesListController',
        restrict : 'A',
        templateUrl : 'static/partials/templates/notes/notesList.html',
        transclude : true
      };
    }]);

  angular.module('em.directives').directive('noteContent', ['$location',
    function($location) {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/notes/noteContent.html',
        link : function(scope, element, attrs) {
          scope.showNoteContent = false;

          scope.toggleNoteContent = function toggleNoteContent() {
            scope.showNoteContent = !scope.showNoteContent;

            if (scope.showNoteContent) {
              scope.selected = 'active-list-item';
            } else {
              scope.selected = '';
            }
          };
        }
      };
    }]);

  angular.module('em.directives').directive('editNote', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/notes/edit.html'
      };
    }]);
}());
