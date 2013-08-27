/*global angular*/

( function() {'use strict';

    angular.module('em.directives').directive('appVersion', ['version',
    function(version) {
      return function(scope, element, attrs) {
        return element.text(version);
      };
    }]);

    angular.module('em.directives').directive('errorAlertBar', ['$parse',
    function($parse) {
      return {
        restrict : 'A',
        templateUrl : '/static/partials/templates/errorMessage.html',
        link : function(scope, elem, attrs) {
          var alertMessageAttr = attrs.alertmessage;
          scope.errorMessage = null;

          scope.$watch(alertMessageAttr, function(newValue) {
            scope.errorMessage = newValue;
          });

          scope.hideAlert = function() {
            scope.errorMessage = null;
            $parse(alertMessageAttr).assign(scope, null);
          };
        }
      };
    }]);

    angular.module('em.directives').directive('urlList', [
    function() {
      return {
        restrict : 'A',
        templateUrl : '/static/partials/templates/urlListTemplate.html'
      };
    }]);

    angular.module('em.directives').directive('itemsList', [
    function() {
      return {
        restrict : 'A',
        templateUrl : '/static/partials/templates/itemsList.html',
        transclude : true,
        link : function(scope, element, attrs) {
          scope.showMe = false;

          scope.toggleItemsList = function toggleItemsList() {
            scope.showMe = !scope.showMe;
          };

          var itemsFilterAttr = attrs.itemsfilter;
          scope.$watch(itemsFilterAttr, function(newValue) {
            scope.itemsListFilter = newValue;
          });
        }
      };
    }]);

    angular.module('em.directives').directive('tasksList', [
    function() {
      return {
        restrict : 'A',
        templateUrl : '/static/partials/templates/tasksList.html',
        transclude : true,
        link : function(scope, element, attrs) {
          var tasksFilterAttr = attrs.tasksfilter;
          scope.$watch(tasksFilterAttr, function(newValue) {
            scope.tasksListFilter = newValue;
          });
        }
      };
    }]);

    angular.module('em.directives').directive('notesList', [
    function() {
      return {
        restrict : 'A',
        templateUrl : '/static/partials/templates/notesList.html',
        transclude : true,
        link : function(scope, element, attrs) {
          var notesFilterAttr = attrs.notesfilter;
          scope.$watch(notesFilterAttr, function(newValue) {
            scope.notesListFilter = newValue;
          });
        }
      };
    }]);

    angular.module('em.directives').directive('taskEdit', [
    function() {
      return {
        restrict : 'A',
        templateUrl : '/static/partials/templates/newTaskTemplate.html',
        link : function(scope, element, attrs) {
          scope.showNewTask = false;

          scope.toggleNewTask = function toggleNewTask() {
            scope.showNewTask = !scope.showNewTask;
          };
        }
      };
    }]);

    angular.module('em.directives').directive('noteEdit', [
    function() {
      return {
        restrict : 'A',
        templateUrl : '/static/partials/templates/newNoteTemplate.html',
        link : function(scope, element, attrs) {
          scope.showNewNote = false;

          scope.toggleNewNote = function toggleNewNote() {
            scope.showNewNote = !scope.showNewNote;
          };
        }
      };
    }]);
  }());
