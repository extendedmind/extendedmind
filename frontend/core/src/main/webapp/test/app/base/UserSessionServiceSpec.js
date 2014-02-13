'use strict';

describe('UserSessionService', function() {

  var LocalStorageService, SessionStorageService, UserSessionService;
  var testOwnerUUID = '6be16f46-7b35-4b2d-b875-e13d19681e77';

  beforeEach(function() {
    module('em.appTest');

    inject(function(_LocalStorageService_, _SessionStorageService_, _UserSessionService_) {
      LocalStorageService = _LocalStorageService_;
      SessionStorageService = _SessionStorageService_;
      UserSessionService = _UserSessionService_;
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
});

it('should be authenticated with uuid in web storage', function() {
    // Session Storage
    SessionStorageService.setUserUUID(testOwnerUUID);
    expect(UserSessionService.isAuthenticated()).toBeTruthy();

    // Local Storage
    sessionStorage.clear();
    LocalStorageService.setUserUUID(testOwnerUUID);
    expect(UserSessionService.isAuthenticated()).toBeTruthy();
  });

it('should return valid authentication with non expired authentication', function() {
    // Session Storage
    SessionStorageService.setUserUUID(testOwnerUUID);
    SessionStorageService.setExpires(Date.now());
    expect(UserSessionService.isAuthenticateValid()).toBe(true);

    // Local Storage
    sessionStorage.clear();
    LocalStorageService.setUserUUID(testOwnerUUID);
    LocalStorageService.setExpires(Date.now());
    expect(UserSessionService.isAuthenticateValid()).toBe(true);
  });

it('should not return valid authentication with expired authentication', function() {
  var swapTokenBufferTimeReached = 10*60*1000 + 1;

    // Session Storage
    SessionStorageService.setUserUUID(testOwnerUUID);
    SessionStorageService.setExpires(Date.now() - swapTokenBufferTimeReached);
    expect(UserSessionService.isAuthenticateValid()).toBeUndefined();

    // Local Storage
    LocalStorageService.setUserUUID(testOwnerUUID);
    LocalStorageService.setExpires(Date.now() - swapTokenBufferTimeReached);
    expect(UserSessionService.isAuthenticateValid()).toBeUndefined();
  });

it('should return true with replaceable authentication', function() {
  LocalStorageService.setReplaceable(Date.now());
  expect(UserSessionService.isAuthenticateReplaceable()).toBe(true);
});

it('should return undefined with unreplaceable authentication', function() {
  var swapTokenBufferTimeReached = 10*60*1000 + 1;
  LocalStorageService.setReplaceable(Date.now() - swapTokenBufferTimeReached);
  expect(UserSessionService.isAuthenticateReplaceable()).toBeUndefined();
});

it('should set and get items synchronized timestamp', function() {
  UserSessionService.setItemsSynchronized(testOwnerUUID);
  var itemsSynchronized = UserSessionService.getItemsSynchronized(testOwnerUUID);
  expect(isNaN(itemsSynchronized)).toBe(false);
});
});
