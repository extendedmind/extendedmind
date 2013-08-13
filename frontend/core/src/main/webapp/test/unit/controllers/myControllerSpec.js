"use strict";

describe('em.controllers', function() {
  beforeEach(module('em.controllers'));

  describe('MyController', function() {
    var $controller, $httpBackend, $scope;
    var items;
    var putItemResponse, user;

    beforeEach(inject(function(_$controller_, _$httpBackend_, _$rootScope_) {
      $httpBackend = _$httpBackend_;

      items = getJSONFixture('itemsResponse.json');
      putItemResponse = getJSONFixture('putItemResponse.json');
      user = getJSONFixture('authenticateResponse.json');

      $scope = _$rootScope_.$new();
      $controller = _$controller_('MyController', {
        $scope : $scope
      });
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should return logged user\'s items', function() {
      expect($scope.items).toBe(undefined);
      $scope.items = items;
      expect($scope.items.length).toBe(3);
    });

    it('should add new item into user\'s item list', function() {
      $httpBackend.expectPUT('/api/' + user.userUUID + '/item').respond(function() {
        return [200, putItemResponse];
      });

      $scope.item = {
        title : 'Buy more milk'
      };

      $scope.putItem();
      $httpBackend.flush();
      expect($scope.newItems[0].title).toBe('Buy more milk');
    });
  });
});
