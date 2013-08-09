"use strict";

describe('em.controllers', function() {
  beforeEach(module('em.controllers', 'em.userAuthenticate'));

  describe('MyController', function() {
    var $controller, $httpBackend, $scope, items, putItemResponse, user,authenticated;

    beforeEach(inject(function(_$controller_, _$httpBackend_, _$rootScope_, UserSessionStorage) {
      $httpBackend = _$httpBackend_;

      // user = {
      // "userUUID" : 'bba6363c-59ce-46b9-9709-acfd7b4be3f1'
      // };
      user = getJSONFixture('authenticateResponse.json');
      UserSessionStorage.setUserToken(user.token);
      UserSessionStorage.setUserUUID(user.userUUID);

      items = getJSONFixture('itemsResponse.json');
      $httpBackend.expectGET('/api/' + user.userUUID + '/items').respond(items);
      putItemResponse = getJSONFixture('putItemResponse.json');

      $scope = _$rootScope_.$new();
      $controller = _$controller_('MyController', {
        $scope : $scope,
        authenticated:authenticated
      });
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should return logged user\'s items', function() {
      expect($scope.items).toBe(undefined);
      $httpBackend.flush();
      expect($scope.items.length).toBe(3);
    });

    it('should add new item into user\'s item list', function() {
      $scope.item = {
        "title" : 'Buy more milk'
      };
      $httpBackend.expectPUT('/api/' + user.userUUID + '/item').respond(function() {
        return [200, putItemResponse];
      });
      $scope.putItem();
      expect($scope.newItems).toBe(undefined);
      $httpBackend.flush();
      expect($scope.newItems[0].title).toBe('Buy more milk');
    });
  });
});
