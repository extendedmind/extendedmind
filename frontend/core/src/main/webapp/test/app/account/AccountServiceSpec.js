'use strict';

describe('AccountService', function() {

  // INJECTS 
  var $httpBackend;
  var AccountService, BackendClientService, HttpClientService;

  // MOCKS
  var accountResponse = getJSONFixture('accountResponse.json');
  var changePasswordResponse = getJSONFixture('passwordResponse.json');

  // SETUP / TEARDOWN
  beforeEach(function() {
    module('em.appTest');

    inject(function (_$httpBackend_, _AccountService_, _BackendClientService_, _HttpClientService_) {
      $httpBackend = _$httpBackend_;
      AccountService = _AccountService_;
      BackendClientService = _BackendClientService_;
      HttpClientService = _HttpClientService_;
    });
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  // TESTS
  it('should get account', function () {
    var email;
    $httpBackend.expectGET('/api/account').respond(200, accountResponse);
    AccountService.getAccount().then(function(authenticateResponse) {
      email = authenticateResponse.email;
    });
    $httpBackend.flush();

    expect(email).toBeDefined();
  });

  it('should change password', function() {
    var email = 'example@example.com';
    var currentPassword = 'currentPassword';
    var newPassword = 'newPassword';
    spyOn(BackendClientService, 'setUsernamePassword');

    AccountService.putChangePassword(email, currentPassword, newPassword);
    $httpBackend.expectPUT('/api/password', {password: newPassword}).respond(200, changePasswordResponse);
    $httpBackend.flush();
  });
});
