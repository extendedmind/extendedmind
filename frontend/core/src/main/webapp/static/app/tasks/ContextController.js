/*jslint white: true */
'use strict';

function ContextController($location, $scope, $routeParams, ErrorHandlerService, tagsArray, tasksArray, userPrefix) {

  $scope.errorHandler = ErrorHandlerService;
  $scope.prefix = userPrefix.getPrefix();

  if ($routeParams.uuid) {
    $scope.context = tagsArray.getTagByUUID($routeParams.uuid);
    $scope.tasks = tasksArray.getSubtasksByTagUUID($scope.context.uuid);
  }
}

ContextController.$inject = ['$location', '$scope', '$routeParams', 'ErrorHandlerService', 'tagsArray', 'tasksArray', 'userPrefix'];
angular.module('em.app').controller('ContextController', ContextController);
