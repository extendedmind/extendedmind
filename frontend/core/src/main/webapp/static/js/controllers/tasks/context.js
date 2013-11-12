/*global angular */
/*jslint white: true */

( function() {'use strict';

  function ContextController($location, $scope, $routeParams, errorHandler, tagsArray, tasksArray, userPrefix) {

    $scope.errorHandler = errorHandler;
    $scope.prefix = userPrefix.getPrefix();

    if ($routeParams.uuid) {
      $scope.context = tagsArray.getTagByUUID($routeParams.uuid);
      $scope.tasks = tasksArray.getSubtasksByTagUUID($scope.context.uuid);
    }

    $scope.addNew = function() {
      $location.path(userPrefix.getPrefix() + '/tasks/new/');
    };
  }

  ContextController.$inject = ['$location', '$scope', '$routeParams', 'errorHandler', 'tagsArray', 'tasksArray', 'userPrefix'];
  angular.module('em.app').controller('ContextController', ContextController);
}());
