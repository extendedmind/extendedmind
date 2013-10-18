/*global angular*/

( function() {'use strict';

    function TasksListController($location, $routeParams, $scope, activeItem, tagsArray, tasksArray, tasksRequest, tasksResponse) {

      $scope.taskEdit = function(task) {
        $location.path('/my/tasks/edit/' + task.uuid);
      };

      $scope.taskChecked = function(index) {

        $scope.task = $scope.tasks[index];
        if ($scope.task.completed) {

          tasksArray.deleteTaskProperty($scope.task, 'completed');

          tasksRequest.uncompleteTask($scope.task).then(function(uncompleteTaskResponse) {
            tasksResponse.putTaskContent($scope.task, uncompleteTaskResponse);
          });

        } else {

          tasksRequest.completeTask($scope.task).then(function(completeTaskResponse) {
            tasksResponse.putTaskContent($scope.task, completeTaskResponse);
          });

        }
      };

      $scope.taskToProject = function(task) {

        // task.project = true;
// 
        // tasksArray.removeTask(task);
        // tasksArray.setProject(task);


        activeItem.setItem(task);        
        $location.path('/my/tasks/new');

        // tasksRequest.putExistingTask(task).then(function(putExistingTaskResponse) {
          // tasksResponse.putTaskContent(task, putExistingTaskResponse);
        // });
      };

      $scope.deleteTask = function(task) {

        tasksArray.removeTask(task);

        tasksRequest.deleteTask(task).then(function(deleteTaskResponse) {
          tasksResponse.putTaskContent(task, deleteTaskResponse);
        });
      };

      $scope.addSubtask = function() {

        if ($routeParams.uuid) {
          $scope.task.relationships = {};

          if (tasksArray.getProjectByUuid($routeParams.uuid)) {

            $scope.task.relationships.parentTask = $routeParams.uuid;
            tasksArray.setSubtask($scope.task);
            $scope.tasks.push($scope.task);

          } else if (tagsArray.getTagByUuid($routeParams.uuid)) {

            $scope.task.relationships.tags = [];
            $scope.task.relationships.tags[0] = $routeParams.uuid;
            $scope.tasks.push($scope.task);
          }
        }

        tasksArray.putNewTask($scope.task);

        tasksRequest.putTask($scope.task).then(function(putTaskResponse) {

          tasksResponse.putTaskContent($scope.task, putTaskResponse);
          $scope.task = {};

        });
      };
    }


    TasksListController.$inject = ['$location', '$routeParams', '$scope', 'activeItem', 'tagsArray', 'tasksArray', 'tasksRequest', 'tasksResponse'];
    angular.module('em.app').controller('TasksListController', TasksListController);
  }());
