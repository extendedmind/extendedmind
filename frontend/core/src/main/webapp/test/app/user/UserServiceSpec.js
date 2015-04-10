/* Copyright 2013-2014 Extended Mind Technologies Oy
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 'use strict';

describe('UserService', function() {

  // INJECTS
  var $httpBackend, $q;
  var BackendClientService, UserService, UserSessionService;

  // MOCKS
  var accountResponse = getJSONFixture('accountResponse.json');
  var logoutResponse = getJSONFixture('logoutResponse.json');

  // SETUP / TEARDOWN
  beforeEach(function() {
    module('em.appTest');

    var sessionStore = {};
    spyOn(sessionStorage, 'getItem').andCallFake(function (key) {
      return sessionStore[key];
    });
    spyOn(sessionStorage, 'setItem').andCallFake(function (key, value) {
      return sessionStore[key] = value + '';
    });
    spyOn(sessionStorage, 'clear').andCallFake(function () {
        sessionStore = {};
    });

    inject(function (_$httpBackend_, _$q_, _BackendClientService_, _UserService_, _UserSessionService_) {
      $httpBackend = _$httpBackend_;
      $q = _$q_;
      BackendClientService = _BackendClientService_;
      UserService = _UserService_;
      UserSessionService = _UserSessionService_;
    });
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  // TESTS
  it('should get account', function () {

    function testRefreshCallback() {
      return $q.when();
    }

    BackendClientService.registerRefreshCredentialsCallback(testRefreshCallback);

    spyOn(UserSessionService, 'setEmail');
    $httpBackend.expectGET('/api/account').respond(200, accountResponse);
    UserService.getAccount().then(function(authenticateResponse) {
      expect(UserSessionService.setEmail).toHaveBeenCalledWith(authenticateResponse.email);
    });
    $httpBackend.flush();
  });

  it('should log out', function() {

    function testRefreshCallback() {
      return $q.when();
    }

    BackendClientService.registerRefreshCredentialsCallback(testRefreshCallback);

    var loggedOut;
    $httpBackend.expectPOST('/api/logout').respond(200, logoutResponse);
    UserService.logout().then(function(response) {
      loggedOut = response;
    });
    expect(loggedOut).toBeUndefined();
    $httpBackend.flush();
    expect(loggedOut).toBeDefined();
  });
});
