/*global angular */
'use strict';

function projects(emSwiper, Enum) {
  return {
    restrict: 'A',
    templateUrl: 'static/partials/my/tasks/projects.html',
    link: function() {
      emSwiper.setVerticalSwiper(Enum.PROJECTS);
    }
  };
}
angular.module('em.directives').directive('projects', projects);
projects.$inject = ['emSwiper', 'Enum'];

function projectTitle(emSwiper, Enum) {
  return {
    restrict: 'A',
    scope: true,
    templateUrl: 'static/partials/templates/tasks/projectTitle.html',
    link: function(scope) {
      scope.goToProject = function(index) {
        emSwiper.setSlideIndex(Enum.PROJECTS, index);
      };
    }
  };
}
angular.module('em.directives').directive('projectTitle', projectTitle);
projectTitle.$inject = ['emSwiper', 'Enum'];

function projectSlide() {
  return {
    controller: 'ProjectController',
    scope: true,
    restrict: 'A',
    templateUrl: 'static/partials/templates/tasks/projectSlide.html',
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

function projectContent() {
  return {
    scope: true,
    restrict: 'A',
    templateUrl: 'static/partials/templates/tasks/projectContent.html'
  };
}
angular.module('em.directives').directive('projectContent', projectContent);

function dates(emSwiper, Enum) {
  return {
    restrict: 'A',
    templateUrl: 'static/partials/my/tasks/dates.html',
    link: function() {
      emSwiper.setVerticalSwiper(Enum.DATES);
    }
  };
}
angular.module('em.directives').directive('dates', dates);
dates.$inject = ['emSwiper', 'Enum'];

function dateSlide() {
  return {
    restrict: 'A',
    templateUrl: 'static/partials/templates/tasks/dateSlide.html',
    scope: {
      tasks: '=dateTasks',
      date: '=dateSlide'
    },
    link: function(scope) {
      scope.subtaskWithDate = {};
      scope.subtaskWithDate.due = scope.date.yyyymmdd;
      scope.filter = {};
      scope.filter.name = 'tasksByDate';
      scope.filter.filterBy = scope.date.yyyymmdd;
    }
  };
}
angular.module('em.directives').directive('dateSlide', dateSlide);

function datebar(emSwiper, Enum) {
  return {
    restrict: 'A',
    templateUrl: 'static/partials/templates/tasks/datebar.html',
    link: function(scope) {
      scope.dateClicked = function(index) {
        emSwiper.setSlideIndex(Enum.DATES, index);
      };
    }
  };
}
angular.module('em.directives').directive('datebar', datebar);
datebar.$inject = ['emSwiper', 'Enum'];

function lists() {
  return {
    restrict: 'A',
    templateUrl: 'static/partials/my/tasks/lists.html'
  };
}
angular.module('em.directives').directive('lists', lists);

function filteredTasksList() {
  return {
    controller: 'TasksListController',
    scope: {
      tasks: '=filteredTasksList',
      tasksListFilter: '=tasksFilter'
    },
    restrict: 'A',
    templateUrl: 'static/partials/templates/tasks/filteredTasksList.html'
  };
}
angular.module('em.directives').directive('filteredTasksList', filteredTasksList);

function tasksList() {
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
}
angular.module('em.directives').directive('tasksList', tasksList);

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
