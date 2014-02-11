'use strict';

function PageNotFoundController($scope, ErrorHandlerService, UserSessionService) {
	$scope.errorHandler = ErrorHandlerService;
	$scope.prefix = UserSessionService.getOwnerPrefix();
}

PageNotFoundController['$inject'] = ['$scope', 'ErrorHandlerService', 'UserSessionService'];
angular.module('em.app').controller('PageNotFoundController', PageNotFoundController);
