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

          scope.taskEdit = function(task) {
            scope.setActiveItem(task);
            $location.path('/my/tasks/edit/' + task.uuid);
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
