/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('TasksController', ['$location', '$rootScope', '$scope', 'activeItem', 'errorHandler', 'itemsArray', 'itemsRequest', 'locationHandler', 'tagsArray', 'tasksArray', 'tasksRequest', 'tasksResponse',
    function($location, $rootScope, $scope, activeItem, errorHandler, itemsArray, itemsRequest, locationHandler, tagsArray, tasksArray, tasksRequest, tasksResponse) {

      $scope.errorHandler = errorHandler;
      $rootScope.pageTitle = 'my';
      $rootScope.subtitle = 'tasks';

      locationHandler.setPreviousLocation('/my/notes');
      locationHandler.setNextLocation('/my');

      itemsRequest.getItems(function(itemsResponse) {

        itemsArray.setItems(itemsResponse.items);
        tasksArray.setTasks(itemsResponse.tasks);
        tagsArray.setTags(itemsResponse.tags);

        $scope.tasks = tasksArray.getTasks();
        $scope.tags = tagsArray.getTags();
        $scope.projects = tasksArray.getProjects();
        $scope.subtasks = tasksArray.getSubtasks();
      }, function(error) {
      });

      $scope.tasksListFilter = true;

      $scope.taskChecked = function(index) {
        $scope.task = $scope.tasks[index];

        if ($scope.task.done) {

          tasksRequest.completeTask($scope.task, function(completeTaskResponse) {
            tasksResponse.putTaskContent($scope.task, completeTaskResponse);
          }, function(completeTaskResponse) {
          });

        } else {

          tasksRequest.uncompleteTask($scope.task, function(uncompleteTaskResponse) {
            tasksResponse.deleteTaskProperty($scope.task, 'completed');
          }, function(uncompleteTaskResponse) {

          });
        }
      };

      $scope.setActiveItem = function(item) {
        activeItem.setItem(item);
      };

      $scope.swipeLeft = function() {
        $rootScope.pageAnimation = {
          enter : 'em-animate-enter-right',
          leave : 'em-animate-leave-left'
        };
        $location.path('/my/notes');
      };

      $scope.swipeRight = function() {
        $rootScope.pageAnimation = {
          enter : 'em-animate-enter-left',
          leave : 'em-animate-leave-right'
        };
        $location.path('/my');
      };

      $scope.addNew = function() {
        $location.path('/my/tasks/new/');
      };
    }]);
  }());
