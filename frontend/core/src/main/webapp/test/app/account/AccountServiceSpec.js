'use strict';

describe('AccountService', function() {

  // INJECTS 
  var $httpBackend;
  var AccountService, UserSessionService;

  // MOCKS
  var accountResponse = getJSONFixture('accountResponse.json');

  // SETUP / TEARDOWN
  beforeEach(function() {
    module('em.appTest');

    inject(function (_$httpBackend_, _AccountService_, _UserSessionService_) {
      $httpBackend = _$httpBackend_;
      AccountService = _AccountService_;
      UserSessionService = _UserSessionService_;
    });
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  // TESTS
  it('should get account', function () {
    spyOn(UserSessionService, 'setEmail');
    $httpBackend.expectGET('/api/account').respond(200, accountResponse);
    AccountService.getAccount().then(function(authenticateResponse) {
      expect(UserSessionService.setEmail).toHaveBeenCalledWith(authenticateResponse.email);
    });
    $httpBackend.flush();
  });
});
