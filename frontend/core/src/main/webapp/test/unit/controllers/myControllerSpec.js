'use strict';

describe('em.controllers', function() {
  beforeEach(module('em.controllers'));

  describe('MyController', function() {
    beforeEach(module('em.services', 'em.mockHelpers'));

    var $controller, $httpBackend, $scope;
    var mockHttpBackendResponse;

    beforeEach(inject(function(_$controller_, _$httpBackend_, _$rootScope_, _mockHttpBackendResponse_) {
      $httpBackend = _$httpBackend_;
      mockHttpBackendResponse = _mockHttpBackendResponse_;

      $scope = _$rootScope_.$new();
      $controller = _$controller_('MyController', {
        $scope : $scope
      });
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
      mockHttpBackendResponse.clearSessionStorage();
    });

    it('should return logged user\'s items', inject(function() {
      expect($scope.items).toBe(undefined);
      $scope.items = mockHttpBackendResponse.getItemsResponse();
      expect($scope.items.length).toBe(3);
    }));

    it('should add new item', inject(function(_httpBasicAuth_, _itemsFactory_, _userSessionStorage_) {
      var httpBasicAuth = _httpBasicAuth_;
      httpBasicAuth.setCredentials('timo@ext.md', 'timopwd');

      var itemsFactory = _itemsFactory_;
      var userSessionStorage = _userSessionStorage_;

      userSessionStorage.setUserUUID(mockHttpBackendResponse.getAuthenticateResponse().userUUID);
      $scope.newItems = itemsFactory.getUserNewItems();
      expect($scope.newItems.length).toBe(0);

      $scope.item = {
        title : 'Buy more milk'
      };

      $httpBackend.expectPUT('/api/' + mockHttpBackendResponse.getAuthenticateResponse().userUUID + '/item');

      $scope.putItem();
      $httpBackend.flush();
      expect($scope.newItems[0].title).toBe('Buy more milk');
    }));
  });
});
