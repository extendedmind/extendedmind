/*global module, beforeEach, inject, describe, afterEach, it, expect */
'use strict';

beforeEach(module('em.app'));

describe('ItemsController', function() {
  beforeEach(module('em.services', 'em.mockHelpers'));

  var $controller, $httpBackend, $scope, mockHttpBackendResponse, slide, userItems;

  beforeEach(inject(function(_$controller_, _$httpBackend_, _$rootScope_, _mockHttpBackendResponse_) {
    $httpBackend = _$httpBackend_;
    mockHttpBackendResponse = _mockHttpBackendResponse_;
    userItems = mockHttpBackendResponse.getItemsResponse();

    $scope = _$rootScope_.$new();
    $controller = _$controller_('ItemsController', {
      $scope : $scope,
      slide : slide
    });
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    mockHttpBackendResponse.clearSessionStorage();
  });

  it('should add new item', inject(function(_HttpBasicAuthenticationService_, _itemsArray_, _SessionStorageService_) {
    var HttpBasicAuthenticationService, itemsArray, SessionStorageService;

    HttpBasicAuthenticationService = _HttpBasicAuthenticationService_;

    itemsArray = _itemsArray_;
    SessionStorageService = _SessionStorageService_;

    $scope.newItem = {
      title : 'Buy more milk'
    };
  }));
});
