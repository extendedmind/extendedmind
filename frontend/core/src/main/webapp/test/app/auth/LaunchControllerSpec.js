'use strict';

describe('LaunchController', function() {
/*  var $httpBackend, $scope;
  var BackendClientService, LaunchController, AuthenticationService;
  var testOwnerUUID = '6be16f46-7b35-4b2d-b875-e13d19681e77';

  beforeEach(function() {
    module('em.appTest');

    inject(function($controller, _$httpBackend_, $rootScope, _AuthenticationService_, _BackendClientService_) {
      $scope = $rootScope.$new();
      LaunchController = $controller('LaunchController', {
        $scope: $scope
      });
      $httpBackend = _$httpBackend_;
      AuthenticationService = _AuthenticationService_;
      BackendClientService = _BackendClientService_;
    });
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should show queued user\'s queue', function() {
    // SETUP
    var inviteRequestResponse = {
      inviteRequestUUID: testOwnerUUID
    };
    $scope.user = {};
    expect($scope.user.email).toBeUndefined();
    spyOn(LaunchController, 'redirectTo');

    // INIT
    $scope.user.email = 'jp@extample.md';
    $httpBackend.expectPOST('/api/invite/request', {email: $scope.user.email})
    .respond(200, inviteRequestResponse);
    
    // EXECUTE
    $scope.launchUser();
    $httpBackend.flush();
    expect(LaunchController.redirectTo).toHaveBeenCalledWith('waiting/' + testOwnerUUID);
  });

  it('should invite new user', function() {
    var inviteRequestResponse = {
      inviteUUID: testOwnerUUID
    };
    var getInviteResponse = {
      uuid: testOwnerUUID
    };
    $scope.user = {
      email: 'jp@next.md'
    };
    spyOn(LaunchController, 'redirectTo');
    $scope.launchUser();
    $httpBackend.expectPOST('/api/invite/request', {email: $scope.user.email})
    .respond(200, inviteRequestResponse);
    $httpBackend.flush();
    expect(LaunchController.redirectTo).toHaveBeenCalledWith('waiting');
  });

  it('should redirect to login page with user', function() {
    // SETUP
    var inviteRequestResponse = {
      user: true
    };
    $scope.user = {};
    expect($scope.user.email).toBeUndefined();
    spyOn(LaunchController, 'redirectTo');
    
    // INIT
    $scope.user.email = 'jp@ext.md';
    $httpBackend.expectPOST('/api/invite/request', {email: $scope.user.email})
    .respond(200, inviteRequestResponse);

    // EXECUTE
    $scope.launchUser();
    $httpBackend.flush();
    expect(LaunchController.redirectTo).toHaveBeenCalledWith('');
  });
*/
});
