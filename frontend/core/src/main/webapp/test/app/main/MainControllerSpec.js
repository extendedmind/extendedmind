'use strict';

describe('MainController', function() {
	var $scope, MainController;

	beforeEach(function() {
		module('em.appTest');

		inject(function($controller, _$rootScope_) {
			$scope = _$rootScope_.new();
			MainController = $controller('MainController', {
				$scope: $scope
			});
		});
	});
});
