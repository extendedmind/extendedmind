/*global angular*/

( function() {'use strict';

    function NewTaskController($location, $routeParams, $scope, activeItem, errorHandler, itemsArray, itemsRequest, tagsArray, tasksArray, tasksRequest, tasksResponse) {

      $scope.errorHandler = errorHandler;

      $scope.editTask = function() {

        if ($scope.parentTask) {
          $scope.task.relationships = {};
          $scope.task.relationships.parentTask = $scope.parentTask.uuid;
        }

        tasksRequest.putTask($scope.task).then(function(putTaskResponse) {

          tasksResponse.putTaskContent($scope.task, putTaskResponse);
          tasksArray.putNewTask($scope.task);
          $scope.task = {};

          window.history.back();
        });
      };

      $scope.cancelEdit = function() {
        window.history.back();
      };
    }


    NewTaskController.$inject = ['$location', '$routeParams', '$scope', 'activeItem', 'errorHandler', 'itemsArray', 'itemsRequest', 'tagsArray', 'tasksArray', 'tasksRequest', 'tasksResponse'];
    angular.module('em.app').controller('NewTaskController', NewTaskController);
  }());
