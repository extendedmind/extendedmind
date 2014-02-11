'use strict';

function PageNotFoundController($scope, ErrorHandlerService, OwnerService) {
	$scope.errorHandler = ErrorHandlerService;
	$scope.prefix = OwnerService.getOwnerPrefix();
}
PageNotFoundController['$inject'] = ['$scope', 'ErrorHandlerService', 'OwnerService'];
angular.module('em.app').controller('PageNotFoundController', PageNotFoundController);
