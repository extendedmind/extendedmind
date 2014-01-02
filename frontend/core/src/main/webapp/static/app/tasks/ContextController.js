/*jslint white: true */
'use strict';

function ContextController($location, $scope, $routeParams, ErrorHandlerService, TagsService, tasksArray, OwnerService) {

  $scope.errorHandler = ErrorHandlerService;
  $scope.prefix = OwnerService.getPrefix();

  if ($routeParams.uuid) {
    $scope.context = TagsService.getTagByUUID($routeParams.uuid);
    $scope.tasks = tasksArray.getSubtasksByTagUUID($scope.context.uuid);
  }
}

ContextController.$inject = ['$location', '$scope', '$routeParams', 'ErrorHandlerService', 'TagsService', 'tasksArray', 'OwnerService'];
angular.module('em.app').controller('ContextController', ContextController);
