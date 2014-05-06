'use strict';

describe('UserSessionService', function() {

  var LocalStorageService, SessionStorageService, UserSessionService;
  var testOwnerUUID = '6be16f46-7b35-4b2d-b875-e13d19681e77';
  var swapTokenBufferTimeAndThenSome = 11*60*1000;
  var authenticateResponse = getJSONFixture('authenticateResponse.json');

  beforeEach(function() {
    module('em.appTest');

    inject(function(_LocalStorageService_, _SessionStorageService_) {
      LocalStorageService = _LocalStorageService_;
      SessionStorageService = _SessionStorageService_;
    });

    // http://stackoverflow.com/a/14381941
    var sessionStore = {};
    var localStore = {};

    spyOn(sessionStorage, 'getItem').andCallFake(function(key) {
      return sessionStore[key];
    });
    spyOn(sessionStorage, 'setItem').andCallFake(function(key, value) {
      sessionStore[key] = value + '';
    });
    spyOn(sessionStorage, 'clear').andCallFake(function () {
      sessionStore = {};
    });

    spyOn(localStorage, 'getItem').andCallFake(function(key) {
      if (!localStore[key]) return null;
      return localStore[key];
    });
    spyOn(localStorage, 'setItem').andCallFake(function(key, value) {
      localStore[key] = value + '';
    });
    spyOn(localStorage, 'clear').andCallFake(function() {
      localStore = {};
    });
  });

  afterEach(function() {
    localStorage.clear();
    sessionStorage.clear();
    delete window.useOfflineBuffer;
  });

  it('should be authenticated with expires in web storage', function() {
    inject(function(_UserSessionService_) {
      UserSessionService = _UserSessionService_;
    });
    // Session Storage
    SessionStorageService.setExpires(12345);
    expect(UserSessionService.isAuthenticated()).toBeTruthy();

    // Local Storage
    sessionStorage.clear();
    LocalStorageService.setExpires(12345);
    expect(UserSessionService.isAuthenticated()).toBeTruthy();
  });

  it('should return valid authentication with non expired authentication', function() {
    inject(function(_UserSessionService_) {
      UserSessionService = _UserSessionService_;
    });
    // Session Storage
    SessionStorageService.setUserUUID(testOwnerUUID);
    SessionStorageService.setExpires(Date.now() + swapTokenBufferTimeAndThenSome);
    expect(UserSessionService.isAuthenticateValid()).toBe(true);

    // Local Storage
    sessionStorage.clear();
    LocalStorageService.setUserUUID(testOwnerUUID);
    LocalStorageService.setExpires(Date.now() + swapTokenBufferTimeAndThenSome);
    expect(UserSessionService.isAuthenticateValid()).toBe(true);
  });

  it('should not return valid authentication with expired authentication', function() {
    inject(function(_UserSessionService_) {
      UserSessionService = _UserSessionService_;
    });
    // Session Storage
    SessionStorageService.setUserUUID(testOwnerUUID);
    SessionStorageService.setExpires(Date.now() - 1);
    expect(UserSessionService.isAuthenticateValid()).toBeUndefined();

    // Local Storage
    LocalStorageService.setUserUUID(testOwnerUUID);
    LocalStorageService.setExpires(Date.now() - 1);
    expect(UserSessionService.isAuthenticateValid()).toBeUndefined();
  });

  it('should return true with replaceable authentication', function() {
    inject(function(_UserSessionService_) {
      UserSessionService = _UserSessionService_;
    });
    LocalStorageService.setReplaceable(Date.now() + swapTokenBufferTimeAndThenSome);
    expect(UserSessionService.isAuthenticateReplaceable()).toBe(true);
  });

  it('should return undefined with unreplaceable authentication', function() {
    inject(function(_UserSessionService_) {
      UserSessionService = _UserSessionService_;
    });
    LocalStorageService.setReplaceable(Date.now() - 1);
    expect(UserSessionService.isAuthenticateReplaceable()).toBeUndefined();
  });

  it('should set and get items synchronized timestamp', function() {
    inject(function(_UserSessionService_) {
      UserSessionService = _UserSessionService_;
    });
    UserSessionService.setItemsSynchronized(testOwnerUUID);
    var itemsSynchronized = UserSessionService.getItemsSynchronized(testOwnerUUID);
    expect(isNaN(itemsSynchronized)).toBe(false);
  });

  it('should sync email in Web Storages and return email from sessionStorage', function() {
    inject(function(_UserSessionService_) {
      UserSessionService = _UserSessionService_;
    });
    LocalStorageService.setEmail('example@example.com');
    UserSessionService.getEmail();
    expect(UserSessionService.getEmail()).toEqual('example@example.com');
  });

  it('should set email to sessionStorage when authenticate information is set and user is not remembered', function() {
    inject(function(_UserSessionService_) {
      UserSessionService = _UserSessionService_;
    });
    var email = 'example@example.com';
    spyOn(SessionStorageService, 'setEmail');
    spyOn(LocalStorageService, 'setEmail');
    delete authenticateResponse.replaceable;
    UserSessionService.setAuthenticateInformation(authenticateResponse, email);
    expect(LocalStorageService.setEmail).not.toHaveBeenCalled();
    expect(SessionStorageService.setEmail).toHaveBeenCalledWith('example@example.com');
  });

  it('should set email to Web Storage when authenticate information is set and user is remembered', function() {
    inject(function(_UserSessionService_) {
      UserSessionService = _UserSessionService_;
    });
    var email = 'example@example.com';
    var authResponse = authenticateResponse;
    authResponse.replaceable = Date.now() + swapTokenBufferTimeAndThenSome;
    spyOn(SessionStorageService, 'setEmail');
    spyOn(LocalStorageService, 'setEmail');
    UserSessionService.setAuthenticateInformation(authResponse, email);
    expect(LocalStorageService.setEmail).toHaveBeenCalledWith('example@example.com');
    expect(SessionStorageService.setEmail).toHaveBeenCalledWith('example@example.com');
  });

  it('should set email to Web Storage when authenticate information is set and user is remembered by default', function() {
    window.useOfflineBuffer = true;
    inject(function(_UserSessionService_) {
      UserSessionService = _UserSessionService_;
    });
    var email = 'example@example.com';
    spyOn(SessionStorageService, 'setEmail');
    spyOn(LocalStorageService, 'setEmail');
    UserSessionService.setAuthenticateInformation(authenticateResponse, email);
    expect(SessionStorageService.setEmail).toHaveBeenCalledWith('example@example.com');
    expect(LocalStorageService.setEmail).toHaveBeenCalledWith('example@example.com');
  });

  it('should set email to sessionStorage if user is not remembered', function() {
    inject(function(_UserSessionService_) {
      UserSessionService = _UserSessionService_;
    });
    spyOn(SessionStorageService, 'setEmail');
    spyOn(LocalStorageService, 'setEmail');
    UserSessionService.setEmail('example@example.com');
    expect(LocalStorageService.setEmail).not.toHaveBeenCalled();
    expect(SessionStorageService.setEmail).toHaveBeenCalledWith('example@example.com');
  });

  it('should set email to Web Storage if user is remembered by default', function() {
    window.useOfflineBuffer = true;
    inject(function(_UserSessionService_) {
      UserSessionService = _UserSessionService_;
    });
    spyOn(SessionStorageService, 'setEmail');
    spyOn(LocalStorageService, 'setEmail');
    UserSessionService.setEmail('example@example.com');
    expect(LocalStorageService.setEmail).toHaveBeenCalledWith('example@example.com');
    expect(SessionStorageService.setEmail).toHaveBeenCalledWith('example@example.com');
  });

});
