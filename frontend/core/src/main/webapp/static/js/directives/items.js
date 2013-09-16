/*global angular*/

( function() {'use strict';

    angular.module('em.directives').directive('expander', function() {
      return {
        restrict : 'EA',
        replace : true,
        transclude : true,
        scope : {
          title : '=expanderTitle'
        },
        templateUrl : 'static/partials/templates/expandedContent.html',
        link : function(scope, element, attrs) {
          scope.showMe = false;
          scope.toggle = function toggle() {
            scope.showMe = !scope.showMe;
          };
        }
      };
    });

    angular.module('em.directives').directive('newTag', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/newTag.html',
        link : function(scope, element, attrs) {
          scope.showEditNewTag = false;

          scope.editNewTag = function editNewTag() {
            scope.showEditNewTag = true;
          };
        }
      };
    }]);

    angular.module('em.directives').directive('newTask', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/newTask.html'
      };
    }]);

    angular.module('em.directives').directive('itemsList', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/itemsList.html',
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

    angular.module('em.directives').directive('contextsList', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/contextsList.html'
      };
    }]);

    angular.module('em.directives').directive('projectsList', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/projectsList.html'
      };
    }]);

    angular.module('em.directives').directive('tasksList', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/tasksList.html',
        transclude : true,
        link : function(scope, element, attrs) {
          var tasksFilterAttr = attrs.tasksfilter;

          scope.$watch(tasksFilterAttr, function(newValue) {
            scope.tasksListFilter = newValue;
          });
        }
      };
    }]);

    angular.module('em.directives').directive('noteContent', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/noteContent.html'
      };
    }]);

    angular.module('em.directives').directive('taskContent', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/taskContent.html',
        link : function(scope, element, attrs) {
          scope.showMe = false;

          scope.expandTask = function expandTask() {
            scope.showMe = !scope.showMe;
          };
        }
      };
    }]);

    angular.module('em.directives').directive('notesList', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/notesList.html',
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
