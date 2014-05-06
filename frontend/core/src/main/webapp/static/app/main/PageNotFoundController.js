'use strict';

function PageNotFoundController($scope, UISessionService) {
	$scope.ownerPrefix = UISessionService.getOwnerPrefix();
}

PageNotFoundController['$inject'] = ['$scope', 'UISessionService'];
angular.module('em.app').controller('PageNotFoundController', PageNotFoundController);
