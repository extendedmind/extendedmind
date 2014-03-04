'use strict';

describe('AuthenticationService', function() {

  // INJECTS 

  var $httpBackend, $location, $q;
  var AuthenticationService, BackendClientService, HttpClientService;

  // MOCKS

  var authenticateResponse = getJSONFixture('authenticateResponse.json');
  var logoutResponse = getJSONFixture('logoutResponse.json');
  var inviteResponse = getJSONFixture('inviteResponse.json');
  var signUpResponse = getJSONFixture('signUpResponse.json');
  var inviteRequestResponse;
  var testOwnerUUID = '6be16f46-7b35-4b2d-b875-e13d19681e77';

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
    getActiveUUID: function() {
      return testOwnerUUID;
    },
    getCredentials: function() {
      return '123456789';
    },
    getEmail: function() {
      return;
    },
    getUserUUID: function() {
      return;
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
    setAuthenticateInformation: function(authenticateResponse, email) {
      if (email) {
        this.setEmail(email);
      }
      return;
    },
    setEmail: function(/*email*/) {
      return;
    },
    clearUser: function() {
      return;
    }
  };

  var MockItemsService = {
    synchronize: function() {
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

    inject(function (_$httpBackend_, _$location_, _$q_, _AuthenticationService_, _BackendClientService_, _HttpClientService_) {
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      $q = _$q_;
      AuthenticationService = _AuthenticationService_;
      BackendClientService = _BackendClientService_;
      HttpClientService = _HttpClientService_;
    });

    spyOn($location, 'path');
    spyOn($location, 'search');
    inviteRequestResponse = getJSONFixture('inviteRequestResponse.json');
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

  it('should set email to Web Storage after successful authentication', function() {
    var user = {
      username: 'example@example.com',
      password: 'example'
    };
    spyOn(MockUserSessionService, 'setEmail');
    $httpBackend.expectPOST('/api/authenticate').respond(200, authenticateResponse);
    AuthenticationService.login(user);
    $httpBackend.flush();
    expect(MockUserSessionService.setEmail).toHaveBeenCalledWith(user.username);
  });

  it('should post invite request', function() {
    spyOn(BackendClientService, 'postOnline').andCallFake(function() {
      var deferred = $q.defer();
      deferred.resolve();
      return deferred.promise.then(function() {
        return;
      });
    });
    AuthenticationService.postInviteRequest();
    expect(BackendClientService.postOnline).toHaveBeenCalled();
  });

  it('should resolve authenticated user and redirect from \'/\' to \'/my/tasks\'', function() {
    spyOn(MockUserSessionService, 'getUserUUID').andReturn(testOwnerUUID);
    AuthenticationService.checkAndRedirectUser();
    expect($location.path).toHaveBeenCalledWith('/my/tasks');
  });

  it('should resolve user with new invite request and redirect from \'/\' to \'/waiting\'', function() {
    // SETUP
    inviteRequestResponse.resultType = 'newInviteRequest';
    spyOn(MockUserSessionService, 'getEmail').andReturn('example@example.com');
    spyOn(MockUserSessionService, 'getUserUUID').andReturn();
    var email = MockUserSessionService.getEmail();
    $httpBackend.expectPOST('/api/invite/request', {email: email}).
    respond(200, inviteRequestResponse);

    // EXECUTE
    AuthenticationService.checkAndRedirectUser();
    $httpBackend.flush();

    expect($location.path).toHaveBeenCalledWith('/waiting');
    expect($location.search).toHaveBeenCalledWith({
      uuid: inviteRequestResponse.result.uuid,
      queueNumber: inviteRequestResponse.queueNumber
    });
  });

  it('should resolve user with existing invite request and redirect from \'/\' to \'/waiting\'', function() {
    // SETUP
    inviteRequestResponse.resultType = 'inviteRequest';
    spyOn(MockUserSessionService, 'getEmail').andReturn('example@example.com');
    spyOn(MockUserSessionService, 'getUserUUID').andReturn();
    var email = MockUserSessionService.getEmail();
    $httpBackend.expectPOST('/api/invite/request', {email: email}).
    respond(200, inviteRequestResponse);

    // EXECUTE
    AuthenticationService.checkAndRedirectUser();
    $httpBackend.flush();

    expect($location.path).toHaveBeenCalledWith('/waiting');
    expect($location.search).toHaveBeenCalledWith({
      uuid: inviteRequestResponse.result.uuid,
      queueNumber: inviteRequestResponse.queueNumber
    });
  });

  it('should resolve invited user and redirect from \'/\' to \'/waiting\'', function() {
    // SETUP
    inviteRequestResponse.resultType = 'invite';
    spyOn(MockUserSessionService, 'getEmail').andReturn('example@example.com');
    spyOn(MockUserSessionService, 'getUserUUID').andReturn();
    var email = MockUserSessionService.getEmail();
    $httpBackend.expectPOST('/api/invite/request', {email: email}).
    respond(200, inviteRequestResponse);

    // EXECUTE
    AuthenticationService.checkAndRedirectUser();
    $httpBackend.flush();

    expect($location.path).toHaveBeenCalledWith('/waiting');
    expect($location.search).toHaveBeenCalledWith({
      email: email
    });
  });

  it('should resolve existing not authenticated user and redirect from \'/\' to \'login\'', function() {
    // SETUP
    inviteRequestResponse.resultType = 'user';
    spyOn(MockUserSessionService, 'getEmail').andReturn('example@example.com');
    spyOn(MockUserSessionService, 'getUserUUID').andReturn();
    var email = MockUserSessionService.getEmail();
    $httpBackend.expectPOST('/api/invite/request', {email: email}).
    respond(200, inviteRequestResponse);

    // EXECUTE
    AuthenticationService.checkAndRedirectUser();
    $httpBackend.flush();

    expect($location.path).toHaveBeenCalledWith('/login');
  });

  it('should resolve fresh session and redirect from \'/\' to \'launch\'', function() {
    spyOn(MockUserSessionService, 'getEmail').andReturn();
    spyOn(MockUserSessionService, 'getUserUUID').andReturn();
    AuthenticationService.checkAndRedirectUser();
    expect($location.path).toHaveBeenCalledWith('/launch');
  });

  it('should set email to Web Storage after invite request', function() {
    var email = 'example@example.com';
    spyOn(MockUserSessionService, 'setEmail');
    $httpBackend.expectPOST('/api/invite/request').respond(200);
    AuthenticationService.postInviteRequest(email);
    $httpBackend.flush();
    expect(MockUserSessionService.setEmail).toHaveBeenCalledWith(email);
  });

  it('should log out', function() {
    MockUserSessionService.setIsAuthenticated(true);
    MockUserSessionService.setIsAuthenticateValid(true);
    MockUserSessionService.setIsAuthenticateReplaceable(false);
    
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
    var inviteResponseCode = '6ee80fc23d4b0fee';
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

  it('should verify and update authentication with valid, non-replaceable authentication', function() {
    MockUserSessionService.setIsAuthenticated(true);
    MockUserSessionService.setIsAuthenticateValid(true);
    MockUserSessionService.setIsAuthenticateReplaceable(false);

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

    verifyAndUpdateAuthenticationPromise().then(function(promise) {
      expect(promise).toEqual(false);
      expect($location.path).toHaveBeenCalledWith('/login');
    });
  });

  it('should not verify and update authentication with valid but expired and unreplaceable authentication', function() {
    MockUserSessionService.setIsAuthenticated(true);
    MockUserSessionService.setIsAuthenticateValid(false);
    MockUserSessionService.setIsAuthenticateReplaceable(false);

    verifyAndUpdateAuthenticationPromise().then(function(promise) {
      expect(promise).toEqual(false);
      expect($location.path).toHaveBeenCalledWith('/login');
    });
  });
});
