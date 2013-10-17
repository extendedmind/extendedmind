/*global angular*/

( function() {'use strict';

    function ContextController($location, $scope, $routeParams, activeItem, errorHandler, itemsArray, itemsRequest, tagsArray, tasksArray) {

      $scope.errorHandler = errorHandler;

      itemsRequest.getItems().then(function() {

        if (activeItem.getItem()) {
          $scope.context = activeItem.getItem();
        } else {
          $scope.context = tagsArray.getTagByUuid($routeParams.uuid);
        }

        $scope.tasks = tasksArray.getSubtasksByTagUuid($scope.context.uuid);
      });

      $scope.setActiveItem = function(item) {
        activeItem.setItem(item);
      };

      $scope.addNew = function() {
        $location.path('/my/tasks/new/');
      };
    }


    ContextController.$inject = ['$location', '$scope', '$routeParams', 'activeItem', 'errorHandler', 'itemsArray', 'itemsRequest', 'tagsArray', 'tasksArray'];
    angular.module('em.app').controller('ContextController', ContextController);
  }());
