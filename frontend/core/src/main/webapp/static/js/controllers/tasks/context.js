/*global angular*/

( function() {'use strict';

    function ContextController($location, $scope, $routeParams, errorHandler, itemsRequest, tagsArray, tasksArray) {

      $scope.errorHandler = errorHandler;

      itemsRequest.getItems().then(function() {

        if ($routeParams.uuid) {
          $scope.context = tagsArray.getTagByUuid($routeParams.uuid);
          $scope.tasks = tasksArray.getSubtasksByTagUuid($scope.context.uuid);
        }
      });

      $scope.addNew = function() {
        $location.path('/my/tasks/new/');
      };
    }


    ContextController.$inject = ['$location', '$scope', '$routeParams', 'errorHandler', 'itemsRequest', 'tagsArray', 'tasksArray'];
    angular.module('em.app').controller('ContextController', ContextController);
  }());
