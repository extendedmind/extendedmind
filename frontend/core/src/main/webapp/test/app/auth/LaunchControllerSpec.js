'use strict';

describe('LaunchController', function() {
  var $httpBackend, $location, $scope;
  var BackendClientService, LaunchController, AuthenticationService;
  var testOwnerUUID = '6be16f46-7b35-4b2d-b875-e13d19681e77';

  beforeEach(function() {
    module('em.appTest');

    inject(function($controller, _$httpBackend_, _$location_, $rootScope, _AuthenticationService_, _BackendClientService_) {
      $scope = $rootScope.$new();
      LaunchController = $controller('LaunchController', {
        $scope: $scope
      });
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      AuthenticationService = _AuthenticationService_;
      BackendClientService = _BackendClientService_;
    });
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should redirect queued user to waiting page with uuid', function() {
    // SETUP
    var inviteRequestResponse = {
      inviteRequestUUID: testOwnerUUID
    };
    $scope.user = {};
    expect($scope.user.email).toBeUndefined();

    // INIT
    $scope.user.email = 'jp@extample.md';
    $httpBackend.expectPOST('/api/invite/request', {email: $scope.user.email})
    .respond(200, inviteRequestResponse);
    
    // EXECUTE
    $scope.launchUser();
    $httpBackend.flush();
    expect($location.path()).toEqual('/waiting?uuid=' + testOwnerUUID);
  });

  it('should redirect invited user to waiting page', function() {
    var inviteRequestResponse = {
      inviteUUID: testOwnerUUID
    };
    $scope.user = {
      email: 'jp@next.md'
    };
    $scope.launchUser();
    $httpBackend.expectPOST('/api/invite/request', {email: $scope.user.email})
    .respond(200, inviteRequestResponse);
    $httpBackend.flush();
    expect($location.path()).toEqual('/waiting?email=' + $scope.user.email);
  });

  it('should redirect existing user to root page', function() {
    // SETUP
    var inviteRequestResponse = {
      user: true
    };
    $scope.user = {};
    expect($scope.user.email).toBeUndefined();
    
    // INIT
    $scope.user.email = 'jp@ext.md';
    $httpBackend.expectPOST('/api/invite/request', {email: $scope.user.email})
    .respond(200, inviteRequestResponse);

    // EXECUTE
    $scope.launchUser();
    $httpBackend.flush();
    expect($location.path()).toEqual('/');
  });
});
