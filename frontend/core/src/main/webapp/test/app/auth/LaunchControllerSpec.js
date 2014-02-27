'use strict';

describe('LaunchController', function() {
  var $httpBackend, $location, $scope;
  var BackendClientService, LaunchController, AuthenticationService;
  var mockLocation;

  var inviteRequestResponse = getJSONFixture('inviteRequestResponse.json');

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

      spyOn($location, 'path').andCallFake(function(path) {
        mockLocation = '/' + path;
      });
    });
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    $location.path('');
  });

  it('should redirect user with new invite request to waiting page', function() {
    // SETUP
    $scope.user = {
      email: 'example@example.md'
    };
    $httpBackend.expectPOST('/api/invite/request', {email: $scope.user.email})
    .respond(200, inviteRequestResponse);
    
    // EXECUTE
    $scope.launchUser();
    $httpBackend.flush();
    expect(mockLocation).toEqual('/waiting?uuid=' + inviteRequestResponse.result.uuid);
  });

  it('should redirect user with existing invite request to waiting page', function() {
    // SETUP
    inviteRequestResponse.resultType = 'inviteRequest';
    $scope.user = {
      email: 'example@example.md'
    };
    $httpBackend.expectPOST('/api/invite/request', {email: $scope.user.email})
    .respond(200, inviteRequestResponse);

    // EXECUTE
    $scope.launchUser();
    $httpBackend.flush();
    expect(mockLocation).toBe('/waiting?uuid=e6b27586-996a-4571-ab48-c5a8cd472e65');
  });

  it('should redirect invited user to waiting page', function() {
    // SETUP
    inviteRequestResponse.resultType = 'invite';
    $scope.user = {
      email: 'example@example.md'
    };
    $httpBackend.expectPOST('/api/invite/request', {email: $scope.user.email})
    .respond(200, inviteRequestResponse);

    // EXECUTE
    $scope.launchUser();
    $httpBackend.flush();
    expect(mockLocation).toEqual('/waiting?email=' + $scope.user.email);
  });

  it('should redirect existing user to root page', function() {
    // SETUP
    inviteRequestResponse.resultType = 'user';
    $scope.user = {
      email: 'example@example.md'
    };
    $httpBackend.expectPOST('/api/invite/request', {email: $scope.user.email})
    .respond(200, inviteRequestResponse);

    // EXECUTE
    $scope.launchUser();
    $httpBackend.flush();
    expect(mockLocation).toEqual('/');
  });
});
