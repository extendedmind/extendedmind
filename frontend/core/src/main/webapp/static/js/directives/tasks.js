/*global angular*/

( function() {'use strict';

    angular.module('em.directives').directive('tasks', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/my/tasks.html'
      };
    }]);

    angular.module('em.directives').directive('tasksList', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/tasks/tasksList.html',
        transclude : true,
        link : function(scope, element, attrs) {
          var tasksFilterAttr = attrs.tasksfilter;

          scope.$watch(tasksFilterAttr, function(newValue) {
            scope.tasksListFilter = newValue;
          });
        }
      };
    }]);

    angular.module('em.directives').directive('taskContent', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/tasks/taskContent.html',
        link : function(scope, element, attrs) {
          scope.showTaskContent = false;

          scope.expandTask = function expandTask() {
            scope.showTaskContent = !scope.showTaskContent;
          };
        }
      };
    }]);

    angular.module('em.directives').directive('newTask', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/tasks/newTask.html'
      };
    }]);
  }());
