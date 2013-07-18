"use strict";

describe('em.controllers', function() {
  beforeEach(module('em.controllers'));

  describe('HomeController', function() {
    var scope, ctrl, $httpBackend;

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      $httpBackend = _$httpBackend_;

      scope = $rootScope.$new();
      ctrl = $controller('HomeController', {
        $scope : scope
      });

      var loggedUser = {};
      var items = getJSONFixture('itemsResponse.json');
      $httpBackend.expectGET('/api/' + loggedUser.token + '/items').respond(items);

      loggedUser.token = 'bba6363c-59ce-46b9-9709-acfd7b4be3f1';
      ctrl.setLoggedUser(loggedUser);

      var putItemResponse = getJSONFixture('putItemResponse.json');
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should return logged user\'s items', function() {
      expect(scope.items).toBe(undefined);
      $httpBackend.flush();
      expect(scope.items.length).toBe(3);
    });

    it('should add new item into user\'s item list', function() {
      var putItemResponse = getJSONFixture('putItemResponse.json');
      $httpBackend.expectPUT('/api/' + ctrl.getLoggedUser().UUID + '/item').respond(function(method, url, data) {
        return [200, putItemResponse];
      });
      scope.item = {
        title : 'Buy more milk'
      };
      scope.putItem();
      expect(scope.items).toBe(undefined);
      $httpBackend.flush();
      expect(scope.items[3].title).toBe('Buy more milk');
    });
  });
});
