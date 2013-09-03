/*global angular*/

( function() {'use strict';

    angular.module('em.directives').directive('newTask', [
    function() {
      return {
        restrict : 'A',
        templateUrl : '/static/partials/templates/newTask.html',
        link : function(scope, element, attrs) {
          scope.showEditNewTask = false;

          scope.cancelNewTask = function cancelNewTask() {
            scope.showEditNewTask = false;
          };

          scope.editNewTask = function addNewTask() {
            scope.showEditNewTask = true;
          };
        }
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
  }());
