'use strict';

describe('LaunchController', function() {
  var $httpBackend, $location, $scope;
  var BackendClientService, LaunchController, UserSessionService;
  var inviteRequestResponse;

  beforeEach(function() {
    module('em.appTest');

    inject(function($controller, _$httpBackend_, _$location_, $rootScope, _BackendClientService_, _UserSessionService_) {
      $scope = $rootScope.$new();
      LaunchController = $controller('LaunchController', {
        $scope: $scope
      });
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      BackendClientService = _BackendClientService_;
      UserSessionService = _UserSessionService_;
    });

    spyOn($location, 'path');
    spyOn($location, 'search');
    spyOn(UserSessionService, 'setEmail');
    inviteRequestResponse = getJSONFixture('inviteRequestResponse.json');
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should redirect user with new invite request to waiting page', function() {
    // SETUP
    inviteRequestResponse.resultType = 'newInviteRequest';
    $scope.user = {
      email: 'example@example.md'
    };
    inviteRequestResponse.queueNumber = 155500;
    $httpBackend.expectPOST('/api/invite/request', {email: $scope.user.email})
    .respond(200, inviteRequestResponse);
    
    // EXECUTE
    $scope.launchUser();
    $httpBackend.flush();

    expect($location.path).toHaveBeenCalledWith('/waiting');
    expect($location.search).toHaveBeenCalledWith({
      uuid: inviteRequestResponse.result.uuid,
      queueNumber: inviteRequestResponse.queueNumber
    });
    expect(UserSessionService.setEmail).toHaveBeenCalledWith($scope.user.email);
  });

  it('should redirect user with existing invite request to waiting page', function() {
    // SETUP
    inviteRequestResponse.resultType = 'inviteRequest';
    inviteRequestResponse.queueNumber = 123;
    $scope.user = {
      email: 'example@example.md'
    };
    $httpBackend.expectPOST('/api/invite/request', {email: $scope.user.email})
    .respond(200, inviteRequestResponse);

    // EXECUTE
    $scope.launchUser();
    $httpBackend.flush();
    
    expect($location.path).toHaveBeenCalledWith('/waiting');
    expect($location.search).toHaveBeenCalledWith({
      uuid: inviteRequestResponse.result.uuid,
      queueNumber: inviteRequestResponse.queueNumber
    });
    expect(UserSessionService.setEmail).toHaveBeenCalledWith($scope.user.email);
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

    expect($location.path).toHaveBeenCalledWith('/waiting');
    expect($location.search).toHaveBeenCalledWith({
      email: $scope.user.email
    });
    expect(UserSessionService.setEmail).toHaveBeenCalledWith($scope.user.email);
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
    expect($location.path).toHaveBeenCalledWith('/');
    expect(UserSessionService.setEmail).toHaveBeenCalledWith($scope.user.email);
  });
});
