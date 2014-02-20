'use strict';

function PageNotFoundController($scope, UserSessionService) {
	$scope.ownerPrefix = UserSessionService.getOwnerPrefix();
}

PageNotFoundController['$inject'] = ['$scope', 'UserSessionService'];
angular.module('em.app').controller('PageNotFoundController', PageNotFoundController);
