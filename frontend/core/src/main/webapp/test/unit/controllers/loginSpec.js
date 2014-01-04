/*global beforeEach, inject, describe, afterEach, it, spyOn */
/*jslint white: true */
'use strict';

beforeEach(module('em.app'));

describe('LoginController', function() {
  beforeEach(module('em.services', 'em.mockHelpers'));

  var $controller, $httpBackend, $rootScope, $scope, mockHttpBackendResponse;

  beforeEach(inject(function(_$controller_, _$httpBackend_, _$rootScope_, _mockHttpBackendResponse_) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectPOST('/api/AuthenticationServiceenticate');

    mockHttpBackendResponse = _mockHttpBackendResponse_;

    $rootScope = _$rootScope_;
    spyOn($rootScope, "$broadcast");

    $scope = _$rootScope_.$new();
    $controller = _$controller_('LoginController', {
      $scope : $scope
    });
  }));

  afterEach(function() {
  });

  it('should broadcast \'event:loginRequired\' on invalid email', inject(function() {
  }));

  it('should broadcast \'event:loginRequired\' on invalid password', inject(function() {
  }));

  it('should broadcast \'event:loginSuccess\' on successful login', inject(function() {
  }));
});
