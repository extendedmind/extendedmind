'use strict';

describe('AuthenticationService', function() {

  // INJECTS 

  var $httpBackend, $location, $q;
  var AuthenticationService, BackendClientService, HttpBasicAuthenticationService, HttpClientService;

  // MOCKS

  var authenticateResponse = getJSONFixture('authenticateResponse.json');
  var logoutResponse = getJSONFixture('logoutResponse.json');
  var inviteResponse = getJSONFixture('inviteResponse.json');
  var signUpResponse = getJSONFixture('signUpResponse.json');

  var MockUserSessionService = {
    authenticated: undefined,
    authenticateValid: undefined,
    authenticateReplaceable: undefined,
    isAuthenticated: function() {
      return this.authenticated;
    },
    isAuthenticateValid: function() {
      return this.authenticateValid;
    },
    isAuthenticateReplaceable: function() {
      return this.authenticateReplaceable;
    },
    isOfflineEnabled: function() {
      return false;
    },
    getCredentials: function () {
      return '123456789';
    },
    getActiveUUID: function () {
      return '6be16f46-7b35-4b2d-b875-e13d19681e77';
    },
    setIsAuthenticated: function(authenticated) {
      this.authenticated = authenticated;
    },
    setIsAuthenticateValid: function(authenticateValid) {
      this.authenticateValid = authenticateValid;
    },
    setIsAuthenticateReplaceable: function(authenticateReplaceable) {
      this.authenticateReplaceable = authenticateReplaceable;
    },
    setCredentials: function (/* user, pass */) {
      return;
    },
    setAuthenticateInformation: function (/*authenticateResponse*/) {
      return;
    },
    setEncodedCredentialsFromLocalStorage: function() {
      return;
    },
    clearUser: function() {
      return;
    }
  };

  var MockItemsService = {
    synchronize: function () {
      return;
    }
  };

  // SETUP / TEARDOWN

  beforeEach(function() {
    module('em.appTest');

    module('em.services', function ($provide){
      $provide.value('UserSessionService', MockUserSessionService);
      $provide.value('ItemsService', MockItemsService);
    });

    inject(function (_$httpBackend_, _$location_, _$q_, _AuthenticationService_, _BackendClientService_, _HttpBasicAuthenticationService_, _HttpClientService_) {
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      $q = _$q_;
      AuthenticationService = _AuthenticationService_;
      BackendClientService = _BackendClientService_;
      HttpBasicAuthenticationService = _HttpBasicAuthenticationService_;
      HttpClientService = _HttpClientService_;
    });

    // Remove refreshing
    BackendClientService.registerRefreshCredentialsCallback(undefined);

  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  // TESTS

  function verifyAndUpdateAuthenticationPromise() {
    var deferred = $q.defer();
    AuthenticationService.verifyAndUpdateAuthentication().then(function() {
      deferred.resolve(true);
    }, function() {
      deferred.resolve(false);
    });
    return deferred.promise;
  }

  it('should authenticate with username and password', function () {
    var returned;
    $httpBackend.expectPOST('/api/authenticate').respond(200, authenticateResponse);
    AuthenticationService.login({username:'timo@ext.md', password: 'timopwd'}).then(function() {
      returned = true;
    });
    $httpBackend.flush();
    expect(returned).toBe(true);
  });

  it('should log out', function() {
    var loggedOut;
    $httpBackend.expectPOST('/api/logout').respond(200, logoutResponse);
    AuthenticationService.logout().then(function(response) {
      loggedOut = response;
    });
    expect(loggedOut).toBeUndefined();
    $httpBackend.flush();
    expect(loggedOut).toBeDefined();
  });

  it('should get invite', function() {
    var inviteResponseCode = '123';
    var email = 'timo@ext.md';
    var invite;
    $httpBackend.expectGET('/api/invite/' + inviteResponseCode + '?email=' + email).respond(200, inviteResponse);
    AuthenticationService.getInvite(inviteResponseCode, email).then(function(response) {
      invite = response;
    });
    expect(invite).toBeUndefined();
    $httpBackend.flush();
    expect(invite).toBeDefined();
  });

  it('should sign up', function() {
    var inviteResponseCode = '123';
    var signUp;
    $httpBackend.expectPOST('/api/invite/' + inviteResponseCode + '/accept').respond(200, signUpResponse);
    AuthenticationService.signUp(inviteResponseCode, {email: 'timo@ext.md', password: 'timopwd'}).then(function(response) {
      signUp = response;
    });
    expect(signUp).toBeUndefined();
    $httpBackend.flush();
    expect(signUp).toBeDefined();
  });

  it('should verify and update authentication with valid authentication', function() {
    MockUserSessionService.setIsAuthenticated(true);
    MockUserSessionService.setIsAuthenticateValid(false);
    MockUserSessionService.setIsAuthenticateValid(true);

    verifyAndUpdateAuthenticationPromise().then(function(promise) {
      expect(promise).toEqual(true);
    });
  });

  it('should verify and update authentication with not valid but expired and replaceable authentication', function() {
    MockUserSessionService.setIsAuthenticated(true);
    MockUserSessionService.setIsAuthenticateValid(false);
    MockUserSessionService.setIsAuthenticateReplaceable(true);

    spyOn(MockUserSessionService, 'setAuthenticateInformation');

    $httpBackend.expectPOST('/api/authenticate').respond(200, authenticateResponse);
    verifyAndUpdateAuthenticationPromise().then(function(promise) {
      expect(promise).toEqual(true);
    });
    $httpBackend.flush();

    expect(MockUserSessionService.setAuthenticateInformation).toHaveBeenCalledWith(authenticateResponse);
  });

  it('should not verify and update authentication with not valid authentication', function() {
    MockUserSessionService.setIsAuthenticated(false);
    MockUserSessionService.setIsAuthenticateValid(false);
    MockUserSessionService.setIsAuthenticateReplaceable(false);

    expect($location.path()).toEqual('/');
    verifyAndUpdateAuthenticationPromise().then(function(promise) {
      expect(promise).toEqual(false);
      expect($location.path()).toEqual('/login');
    });
  });

  it('should not verify and update authentication with valid but expired and unreplaceable authentication', function() {
    MockUserSessionService.setIsAuthenticated(true);
    MockUserSessionService.setIsAuthenticateValid(false);
    MockUserSessionService.setIsAuthenticateReplaceable(false);

    expect($location.path()).toEqual('/');
    verifyAndUpdateAuthenticationPromise().then(function(promise) {
      expect(promise).toEqual(false);
      expect($location.path()).toEqual('/login');
    });
  });
});
