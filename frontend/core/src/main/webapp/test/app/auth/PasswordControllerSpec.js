'use strict';

describe('PasswordController', function() {
  var $controller, $httpBackend, $location, $routeParams, $scope;
  var PasswordController;
  var AuthenticationService, UserSessionService;
  var authenticateResponse = getJSONFixture('authenticateResponse.json');

  beforeEach(function() {
    module('em.appTest');

    inject(function(_$controller_, _$httpBackend_, _$location_, $rootScope, _$routeParams_, _AuthenticationService_, _UserSessionService_) {
      $controller = _$controller_;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      $routeParams = _$routeParams_;
      $scope = $rootScope.$new();
      AuthenticationService = _AuthenticationService_;
      UserSessionService = _UserSessionService_;
    });

    spyOn($location, 'path');
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should go back to \'/my/account\'', function() {
    PasswordController = $controller('PasswordController', {
      $scope: $scope
    });

    $scope.gotoAccountPage();

    expect($location.path).toHaveBeenCalledWith('/my/account');
  });

  it('should change password', function() {
    var email = 'example@example.com';
    spyOn(UserSessionService, 'getEmail').andReturn(email);
    spyOn(UserSessionService, 'setAuthenticateInformation').andReturn();
    PasswordController = $controller('PasswordController', {
      $scope: $scope
    });
    $scope.user = {
      currentPassword: 'currentPassword',
      newPassword: 'newPassword'
    };
    spyOn(AuthenticationService, 'putChangePassword').andCallThrough();
    $httpBackend.expectPUT('/api/password').respond(200);
    spyOn(AuthenticationService, 'login').andCallThrough();
    $httpBackend.expectPOST('/api/authenticate').respond(200, authenticateResponse);

    $scope.changePassword();
    $httpBackend.flush();

    expect(AuthenticationService.putChangePassword).toHaveBeenCalledWith(
      email,
      $scope.user.currentPassword,
      $scope.user.newPassword
      );

    expect(AuthenticationService.login).toHaveBeenCalledWith({
      username: email,
      password: $scope.user.newPassword
    });

    expect(UserSessionService.setAuthenticateInformation).toHaveBeenCalledWith(authenticateResponse, email);

    expect($location.path).toHaveBeenCalledWith('/my/account');
  });
});
