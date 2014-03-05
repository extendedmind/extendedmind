'use strict';

describe('PasswordController', function() {
  var $httpBackend, $location, $routeParams, $scope;
  var PasswordController;
  var AccountService, UserSessionService;

  beforeEach(function() {
    module('em.appTest');

    inject(function(_$httpBackend_, _$location_, $rootScope, _$routeParams_, _AccountService_, _UserSessionService_) {
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      $routeParams = _$routeParams_;
      $scope = $rootScope.$new();
      AccountService = _AccountService_;
      UserSessionService = _UserSessionService_;
    });

    UserSessionService.setEmail('example@example.com');
    spyOn($location, 'path');
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should go back to \'/my/account\'', function() {
    inject(function($controller) {
      PasswordController = $controller('PasswordController', {
        $scope: $scope
      });
    });

    $scope.gotoAccountPage();

    expect($location.path).toHaveBeenCalledWith('/my/account');
  });

  it('should change password', function() {
    var email = 'example@example.com';
    spyOn(UserSessionService, 'getEmail').andReturn(email);
    inject(function($controller) {
      PasswordController = $controller('PasswordController', {
        $scope: $scope
      });
    });
    $scope.user = {
      currentPassword: 'currentPassword',
      newPassword: 'newPassword'
    };
    spyOn(AccountService, 'putChangePassword').andCallThrough();
    $httpBackend.expectPUT('/api/password').respond(200);

    $scope.changePassword();
    $httpBackend.flush();

    expect(AccountService.putChangePassword).toHaveBeenCalledWith(
      email,
      $scope.user.currentPassword,
      $scope.user.newPassword
      );
    expect($location.path).toHaveBeenCalledWith('/login');
  });
});
