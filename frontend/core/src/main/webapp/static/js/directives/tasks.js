/*global angular*/
/*jslint white: true */

( function() {'use strict';

  angular.module('em.directives').directive('datebar', ['disableCarousel',
    function(disableCarousel) {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/tasks/datebar.html',
        link: function(scope, element, attrs) {

          element.on('touchmove', function(event) {
            disableCarousel.setSwiping(true);
          });

          element.on('touchend', function(event) {
            disableCarousel.setSwiping(false);
          });
        }
      };
    }]);

  angular.module('em.directives').directive('task', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/tasks/task.html'
      };
    }]);

  angular.module('em.directives').directive('project', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/tasks/project.html'
      };
    }]);

  angular.module('em.directives').directive('tasks', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/my/tasks.html'
      };
    }]);

  angular.module('em.directives').directive('today', [
    function() {
      return {
        restrict : 'A',
        controller : 'TodayController',
        templateUrl : 'static/partials/my/tasks/today.html'
      };
    }]);

  angular.module('em.directives').directive('filteredTasksList', [
    function() {
      return {
        controller : 'TasksListController',
        restrict : 'A',
        templateUrl : 'static/partials/templates/tasks/filteredTasksList.html',
        transclude : true,
        link : function(scope, element, attrs) {
          var tasksFilterAttr = attrs.tasksfilter;

          scope.$watch(tasksFilterAttr, function(newValue) {
            scope.tasksListFilter = newValue;
          });
        }
      };
    }]);

  angular.module('em.directives').directive('subTask', [
    function() {
      return {
        controller : 'TasksListController',
        restrict : 'A',
        templateUrl : 'static/partials/templates/tasks/subTask.html'
      };
    }]);

  angular.module('em.directives').directive('tasksList', [
    function() {
      return {
        controller : 'TasksListController',
        restrict : 'A',
        templateUrl : 'static/partials/templates/tasks/tasksList.html',
        transclude : true
      };
    }]);

  angular.module('em.directives').directive('taskContent', ['$location',
    function($location) {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/tasks/taskContent.html',
        link : function(scope, element, attrs) {
          scope.showTaskContent = false;

          scope.toggleTaskContent = function toggleTaskContent() {
            scope.showTaskContent = !scope.showTaskContent;

            if (scope.showTaskContent) {
              scope.selected = 'active-list-item';
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
        link : function(scope, element, attrs) {
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
        restrict : 'A',
        templateUrl : 'static/partials/templates/tasks/edit.html'
      };
    }]);
}());
