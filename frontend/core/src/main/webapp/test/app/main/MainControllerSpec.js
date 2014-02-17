'use strict';

describe('MainController', function() {
	var $scope, MainController;

	beforeEach(function() {
		module('em.appTest');

		inject(function($controller, $rootScope) {
			$scope = $rootScope.$new();
			MainController = $controller('MainController', {
				$scope: $scope
			});
		});
	});
});
