/*global angular */
'use strict';

angular.module('em.directives').directive('datebar', [
  function() {
    return {
      restrict: 'A',
      templateUrl: 'static/partials/templates/tasks/datebar.html'
    };
  }]);

angular.module('em.directives').directive('project', [
  function() {
    return {
      restrict: 'A',
      templateUrl: 'static/partials/templates/tasks/project.html'
    };
  }]);

angular.module('em.directives').directive('tasks', [
  function() {
    return {
      restrict: 'A',
      templateUrl: 'static/partials/my/tasks.html'
    };
  }]);

angular.module('em.directives').directive('today', [
  function() {
    return {
      controller: 'TodayController',
      restrict: 'A',
      templateUrl: 'static/partials/my/tasks/today.html'
    };
  }]);

angular.module('em.directives').directive('filteredTasksList', [
  function() {
    return {
      controller: 'TasksListController',
      scope: {
        tasks: '=filteredTasksList',
        tasksListFilter: '=tasksFilter'
      },
      restrict: 'A',
      templateUrl: 'static/partials/templates/tasks/filteredTasksList.html',
      transclude: true
    };
  }]);

angular.module('em.directives').directive('tasksList', [
  function() {
    return {
      controller: 'TasksListController',
      restrict: 'A',
      scope: {
        tasks: '=tasksList',
        tasksFilter: '=',
        subtask: '='
      },
      templateUrl: 'static/partials/templates/tasks/tasksList.html'
    };
  }]);

angular.module('em.directives').directive('task', [
  function() {
    return {
      restrict: 'A',
      templateUrl: 'static/partials/templates/tasks/task.html'
    };
  }]);

angular.module('em.directives').directive('subTask', [
  function() {
    return {
      restrict: 'A',
      scope: {
        subtask: '=',
        add: '&'
      },
      templateUrl : 'static/partials/templates/tasks/subTask.html'
    };
  }]);

angular.module('em.directives').directive('taskContent', [
  function() {
    return {
      restrict: 'A',
      templateUrl: 'static/partials/templates/tasks/taskContent.html',
      link: function(scope) {
        scope.showTaskContent = false;

        scope.toggleTaskContent = function toggleTaskContent() {
          scope.showTaskContent = !scope.showTaskContent;

          if (scope.showTaskContent) {
            scope.selected = 'em-active-list-item';
          } else {
            scope.selected = '';
          }
        };
      }
    };
  }]);

angular.module('em.directives').directive('projectContent',[
  function() {
    return {
      restrict: 'A',
      templateUrl: 'static/partials/templates/tasks/projectContent.html',
      link: function(scope) {
        scope.showProjectContent = false;

        scope.toggleProjectContent = function toggleProjectContent() {
          scope.showProjectContent = !scope.showProjectContent;
        };
      }
    };
  }]);

angular.module('em.directives').directive('editTask', [
  function() {
    return {
      restrict: 'A',
      templateUrl: 'static/partials/templates/tasks/edit.html',
      link: function(scope) {
        scope.showProjectContent = false;
        
        if (scope.task.due) {
          scope.showDate = 'date';
        }

        scope.focusDate = function() {
          scope.showDate = 'date';
        };
      }
    };
  }]);

angular.module('em.directives').directive('date', [
  function() {
    return {
      restrict: 'A',
      link: function(scope, element) {
        if (!scope.task.due) {
          element[0].focus();
          element[0].value = new Date().toISOString().substring(0, 10);
        }
      }
    };
  }]);
