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

describe('AccountService', function() {

  // INJECTS
  var $httpBackend;
  var AccountService, UserSessionService;

  // MOCKS
  var accountResponse = getJSONFixture('accountResponse.json');
  var logoutResponse = getJSONFixture('logoutResponse.json');

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

  it('should log out', function() {
    var loggedOut;
    $httpBackend.expectPOST('/api/logout').respond(200, logoutResponse);
    AccountService.logout().then(function(response) {
      loggedOut = response;
    });
    expect(loggedOut).toBeUndefined();
    $httpBackend.flush();
    expect(loggedOut).toBeDefined();
  });
});
