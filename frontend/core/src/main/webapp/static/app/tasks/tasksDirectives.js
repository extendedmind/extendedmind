/*global angular */
'use strict';

function projectSlide() {
  return {
    controller: 'ProjectController',
    scope: true,
    restrict: 'A',
    templateUrl: 'static/app/tasks/projectSlide.html',
    link: function(scope) {
      scope.filter = {};
      scope.filter.name = 'byProjectUUID';
      scope.filter.filterBy = scope.project.uuid;

      scope.subtask = {};
      scope.subtask.relationships = {};
      scope.subtask.relationships.parentTask = scope.project.uuid;

      scope.showProjectContent = false;

      scope.toggleProjectContent = function toggleProjectContent() {
        scope.showProjectContent = !scope.showProjectContent;
      };
    }
  };
}
angular.module('em.directives').directive('projectSlide', projectSlide);

function dateSlide() {
  return {
    restrict: 'A',
    templateUrl: 'static/app/tasks/dateSlide.html',
    link: function(scope) {
      scope.subtaskWithDate = {
        due: scope.date.yyyymmdd
      };
      scope.filter = {
        name:'tasksByDate',
        filterBy: scope.date.yyyymmdd
      };
    }
  };
}
angular.module('em.directives').directive('dateSlide', dateSlide);

function tasksList() {
  return {
    controller: 'TasksListController',
    restrict: 'A',
    scope: {
      tasks: '=tasksList',
      tasksFilter: '=',
      subtask: '='
    },
    templateUrl: 'static/app/tasks/tasksList.html'
  };
}
angular.module('em.directives').directive('tasksList', tasksList);

angular.module('em.directives').directive('task', [
  function() {
    return {
      restrict: 'A',
      templateUrl: 'static/app/tasks/task.html'
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
      templateUrl : 'static/app/tasks/subTask.html'
    };
  }]);

angular.module('em.directives').directive('taskContent', [
  function() {
    return {
      restrict: 'A',
      templateUrl: 'static/app/tasks/taskContent.html',
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

angular.module('em.directives').directive('editTask', [
  function() {
    return {
      restrict: 'A',
      templateUrl: 'static/app/tasks/editTaskContent.html',
      link: function(scope) {
        scope.showProjectContent = false;
        
        if (scope.task && scope.task.due) {
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
