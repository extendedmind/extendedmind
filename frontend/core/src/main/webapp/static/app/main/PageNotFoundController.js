/*jslint white: true */
'use strict';

function PageNotFoundController($scope, ErrorHandlerService, OwnerService) {

  $scope.errorHandler = ErrorHandlerService;
  $scope.prefix = OwnerService.getPrefix();

}

PageNotFoundController.$inject = ['$scope', 'ErrorHandlerService', 'OwnerService'];
angular.module('em.app').controller('PageNotFoundController', PageNotFoundController);
