'use strict';

function listSlide() {
  return {
    restrict: 'A',
    templateUrl: 'static/app/tasks/listSlide.html',
    link: function(scope) {
      scope.filter = {};
      scope.filter.name = 'byListUUID';
      scope.filter.filterBy = scope.list.uuid;

      scope.subtask = {};
      scope.subtask.relationships = {};
      scope.subtask.relationships.parent = scope.list.uuid;

      scope.showProjectContent = false;

      scope.toggleListContent = function() {
        scope.showListContent = !scope.showListContent;
      };
    }
  };
}
angular.module('em.directives').directive('listSlide', listSlide);

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
    controller: 'TasksController',
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

function subTask() {
  return {
    restrict: 'A',
    scope: {
      subtask: '=',
      add: '&'
    },
    templateUrl : 'static/app/tasks/subTask.html'
  };
}
angular.module('em.directives').directive('subTask', subTask);

function editTask() {
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
}
angular.module('em.directives').directive('editTask', editTask);

function date() {
  return {
    restrict: 'A',
    link: function(scope, element) {
      if (!scope.task.due) {
        element[0].focus();
        element[0].value = new Date().toISOString().substring(0, 10);
      }
    }
  };
}
angular.module('em.directives').directive('date', date);
