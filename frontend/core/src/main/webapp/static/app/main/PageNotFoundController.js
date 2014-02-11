'use strict';

function PageNotFoundController($scope, ErrorHandlerService, UserSessionService) {
	$scope.errorHandler = ErrorHandlerService;
	$scope.ownerPrefix = UserSessionService.getOwnerPrefix();
}

PageNotFoundController['$inject'] = ['$scope', 'ErrorHandlerService', 'UserSessionService'];
angular.module('em.app').controller('PageNotFoundController', PageNotFoundController);
