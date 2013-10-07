/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('TasksController', ['$location', '$rootScope', '$scope', 'activeItem', 'Enum', 'errorHandler', 'itemsArray', 'itemsRequest', 'location', 'slideIndex', 'tagsArray', 'tasksArray', 'tasksRequest', 'tasksResponse',
    function($location, $rootScope, $scope, activeItem, Enum, errorHandler, itemsArray, itemsRequest, location, slideIndex, tagsArray, tasksArray, tasksRequest, tasksResponse) {

      itemsRequest.getItems(function(itemsResponse) {

        itemsArray.setItems(itemsResponse.items);
        tagsArray.setTags(itemsResponse.tags);
        tasksArray.setTasks(itemsResponse.tasks);

        $scope.tasks = tasksArray.getTasks();
        $scope.tags = tagsArray.getTags();
        $scope.projects = tasksArray.getProjects();
        $scope.subtasks = tasksArray.getSubtasks();

      }, function(error) {
      });

      $scope.errorHandler = errorHandler;

      $scope.slide = slideIndex;

      $rootScope.$on('event:slideIndexChanged', function() {
        switch($scope.slide) {
          case Enum.my.my:
            if ($location.path() !== '/my') {
              location.skipReload().path('/my');
            }
            break;
          case Enum.my.tasks:
            if ($location.path() !== '/my/tasks') {
              location.skipReload().path('/my/tasks');
            }
            break;
          default:
            break;
        }
      });

      $scope.tasksListFilter = true;

      $scope.taskChecked = function(index) {

        $scope.task = $scope.tasks[index];
        if ($scope.task.completed) {

          tasksRequest.uncompleteTask($scope.task, function(uncompleteTaskResponse) {
            tasksResponse.deleteTaskProperty($scope.task, 'completed');
          }, function(uncompleteTaskResponse) {
          });

        } else {

          tasksRequest.completeTask($scope.task, function(completeTaskResponse) {
            tasksResponse.putTaskContent($scope.task, completeTaskResponse);
          }, function(completeTaskResponse) {
          });

        }
      };

      $scope.addNew = function() {
        $location.path('/my/tasks/new/');
      };

      $scope.editTask = function(task) {
        $scope.setActiveItem(task);
        $location.path('/my/tasks/edit/' + task.uuid);
      };

      $scope.setActiveItem = function(task) {
        activeItem.setItem(task);
      };
    }]);
  }());
