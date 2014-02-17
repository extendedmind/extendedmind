'use strict';

describe('MainController', function() {
	var $q, $scope, MainController;
	var UserSessionService;

	var MockItemsService = {
		synchronize: function() {
			var deferred = $q.defer();
			deferred.resolve();
			return deferred.promise;
		},
		getItems: function() {
			return;
		}
	};

	beforeEach(function() {
		module('em.appTest');

		module('em.services', function ($provide){
			$provide.value('ItemsService', MockItemsService);
		});

		inject(function($controller, _$q_, $rootScope, _UserSessionService_) {
			$q = _$q_;
			$scope = $rootScope.$new();
			MainController = $controller('MainController', {
				$scope: $scope
			});
			UserSessionService = _UserSessionService_;
		});
	});

	it('should synchronize items', function() {
	});
});
