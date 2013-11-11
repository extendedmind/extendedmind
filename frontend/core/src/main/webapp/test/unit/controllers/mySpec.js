/*global module, beforeEach, inject, describe, afterEach, it, expect*/
/*jslint nomen: true, white: true */

( function() {'use strict';
    beforeEach(module('em.app'));

    describe('MyController', function() {
      beforeEach(module('em.services', 'em.mockHelpers'));

      var $controller, $httpBackend, $scope, mockHttpBackendResponse, slideIndex, userItems;

      beforeEach(inject(function(_$controller_, _$httpBackend_, _$rootScope_, _mockHttpBackendResponse_) {
        $httpBackend = _$httpBackend_;
        mockHttpBackendResponse = _mockHttpBackendResponse_;
        userItems = mockHttpBackendResponse.getItemsResponse();

        $scope = _$rootScope_.$new();
        $controller = _$controller_('MyController', {
          $scope : $scope,
          slideIndex : slideIndex
        });
      }));

      afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        mockHttpBackendResponse.clearSessionStorage();
      });

      it('should return logged user\'s items', inject(function() {
        expect($scope.items).toBeUndefined();
        $scope.items = userItems.items;
        $httpBackend.flush();
        expect($scope.items.length).toBe(2);
      }));

      it('should return logged user\'s notes', inject(function() {
        $scope.notes = userItems.notes;
        $httpBackend.flush();
        expect($scope.notes.length).toBe(3);
      }));

      it('should return logged user\'s tasks', inject(function() {
        $scope.tasks = userItems.tasks;
        $httpBackend.flush();
        expect($scope.tasks.length).toBe(4);
      }));

      it('should add new item', inject(function(_httpBasicAuth_, _itemsArray_, _userSessionStorage_) {
        var httpBasicAuth, itemsArray, userSessionStorage;

        httpBasicAuth = _httpBasicAuth_;

        itemsArray = _itemsArray_;
        $httpBackend.flush();
        userSessionStorage = _userSessionStorage_;

        $scope.newItem = {
          title : 'Buy more milk'
        };
      }));
    });
  }());
