/*global beforeEach, getJSONFixture, module, inject, describe, afterEach, it, expect */
'use strict';

describe('AuthenticationService', function() {

  // INJECTS 

  var $httpBackend;
  var AuthenticationService, BackendClientService, HttpBasicAuthenticationService, HttpClientService;

  // MOCKS

  var authenticateResponse = getJSONFixture('authenticateResponse.json');

  var MockUserSessionService = {
      getCredentials: function () {
        return '123456789';
      },
      getActiveUUID: function () {
        return '6be16f46-7b35-4b2d-b875-e13d19681e77';
      },
      setCredentials: function (user, pass) {
        return;
      },
      setAuthenticateInformation: function (authenticateResponse) {
        return;
      }
    };

  var MockItemsService = {
      synchronize: function () {
        return
      }
    };

    

  // SETUP / TEARDOWN

  beforeEach(function() {
    module('em.appTest');

    module('em.services', function ($provide){
      $provide.value('UserSessionService', MockUserSessionService);
      $provide.value('ItemsService', MockItemsService);
    });

    inject(function (_$httpBackend_, _AuthenticationService_, _BackendClientService_, _HttpBasicAuthenticationService_, _HttpClientService_) {
      $httpBackend = _$httpBackend_;
      AuthenticationService = _AuthenticationService_;
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

  it('should authenticate with username and password', function () {
    var returned;
    $httpBackend.expectPOST('/api/authenticate')
       .respond(200, authenticateResponse);
    AuthenticationService.login({username:'timo@ext.md', password: 'timopwd'}).then(function() {
      returned = true;
    });
    $httpBackend.flush();
    expect(returned).toBe(true);
  });

});
