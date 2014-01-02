/*jslint white: true */
'use strict';

function PageNotFoundController($scope, ErrorHandlerService, userPrefix) {

  $scope.errorHandler = ErrorHandlerService;
  $scope.prefix = userPrefix.getPrefix();

}

PageNotFoundController.$inject = ['$scope', 'ErrorHandlerService', 'userPrefix'];
angular.module('em.app').controller('PageNotFoundController', PageNotFoundController);
