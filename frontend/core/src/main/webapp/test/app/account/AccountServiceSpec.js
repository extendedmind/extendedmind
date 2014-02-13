'use strict';

describe('AccountService', function() {

  // INJECTS 

  var $httpBackend;
  var AccountService, BackendClientService, HttpBasicAuthenticationService, HttpClientService;

  // MOCKS

  var accountResponse = getJSONFixture('accountResponse.json');

  // SETUP / TEARDOWN

  beforeEach(function() {
    module('em.appTest');

    inject(function (_$httpBackend_, _AccountService_, _BackendClientService_, _HttpBasicAuthenticationService_, _HttpClientService_) {
      $httpBackend = _$httpBackend_;
      AccountService = _AccountService_;
      BackendClientService = _BackendClientService_;
      HttpBasicAuthenticationService = _HttpBasicAuthenticationService_;
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

});
