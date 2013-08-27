/*global module, beforeEach, inject, describe, afterEach, it, expect*/
/*jslint nomen: true */

( function() {'use strict';
    beforeEach(module('em.app'));

    describe('MyController', function() {
      beforeEach(module('em.services', 'em.mockHelpers'));

      var $controller, $httpBackend, $scope, mockHttpBackendResponse, userItems;

      beforeEach(inject(function(_$controller_, _$httpBackend_, _$rootScope_, _mockHttpBackendResponse_) {
        $httpBackend = _$httpBackend_;
        mockHttpBackendResponse = _mockHttpBackendResponse_;
        userItems = mockHttpBackendResponse.getItemsResponse();

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
        $scope.items = userItems.items;
        $httpBackend.flush();
        expect($scope.items.length).toBe(2);
      }));

      it('should return logged user\'s notes', inject(function() {
        expect($scope.notes).toBe(undefined);
        $scope.notes = userItems.notes;
        $httpBackend.flush();
        expect($scope.notes.length).toBe(3);
      }));

      it('should return logged user\'s tasks', inject(function() {
        expect($scope.tasks).toBe(undefined);
        $scope.tasks = userItems.tasks;
        $httpBackend.flush();
        expect($scope.tasks.length).toBe(3);
      }));

      it('should add new item', inject(function(_httpBasicAuth_, _itemsFactory_, _userSessionStorage_) {
        var httpBasicAuth, itemsFactory, userSessionStorage;

        httpBasicAuth = _httpBasicAuth_;
        httpBasicAuth.setCredentials('timo@ext.md', 'timopwd');

        itemsFactory = _itemsFactory_;
        userSessionStorage = _userSessionStorage_;

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
  }());
