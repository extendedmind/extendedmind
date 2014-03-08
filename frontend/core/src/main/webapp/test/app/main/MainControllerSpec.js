'use strict';

describe('MainController', function() {
	var $controller, $q, $scope, $timeout;
	var MainController, ItemsService, UserSessionService;
	var testActiveUUID = '5d2f8997-8bdf-4922-b891-6a6127682049';
	var itemsSynchronizedThresholdAndThenSome = 11*1000;

	beforeEach(function() {
		module('em.appTest');

		inject(function(_$controller_, _$q_, $rootScope, _$timeout_, _ItemsService_, _UserSessionService_) {
			$scope = $rootScope.$new();
			$controller = _$controller_;
			$q = _$q_;
			$timeout = _$timeout_;

			ItemsService = _ItemsService_;
			UserSessionService = _UserSessionService_;
		});
	});

	it('should synchronize items', function() {
		spyOn(UserSessionService, 'getActiveUUID').andReturn(testActiveUUID);
		spyOn(UserSessionService, 'isItemsSynchronizing').andReturn(undefined);
		spyOn(UserSessionService, 'getItemsSynchronized').andReturn(undefined);
		spyOn(UserSessionService, 'setItemsSynchronizing');

		var deferred = $q.defer();
		var promise = deferred.promise;
		spyOn(ItemsService, 'synchronize').andReturn(promise);
		deferred.resolve();

		spyOn(UserSessionService, 'setItemsSynchronized');
		
		MainController = $controller('MainController', {
			$scope: $scope
		});

		$scope.$apply();

		expect(UserSessionService.isItemsSynchronizing).toHaveBeenCalledWith(testActiveUUID);
		expect(UserSessionService.getItemsSynchronized).toHaveBeenCalledWith(testActiveUUID);
		expect(UserSessionService.setItemsSynchronizing).toHaveBeenCalledWith(testActiveUUID);
		expect(ItemsService.synchronize).toHaveBeenCalledWith(testActiveUUID);
		expect(UserSessionService.setItemsSynchronized).toHaveBeenCalledWith(testActiveUUID);
	});

it('should synchronize items delayed', function() {
	jasmine.Clock.useMock();
});
});
