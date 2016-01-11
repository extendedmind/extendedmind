/* Copyright 2013-2016 Extended Mind Technologies Oy
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

describe('BackendClientService', function() {

  // INJECTS

  var flag;
  var $httpBackend, $location, $q;
  var BackendClientService, HttpClientService;

  // MOCKS

  var MockUserSessionService = {
    getCredentials: function() {
      return '123456789';
    },
    isFakeUser: function() {
      return false;
    }
  };

  // SETUP / TEARDOWN

  beforeEach(function() {
    module('em.appTest');

    module('em.base', function ($provide){
      $provide.value('UserSessionService', MockUserSessionService);
    });

    inject(function (_$httpBackend_, _$location_, _$q_, _BackendClientService_, _HttpClientService_) {
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      $q = _$q_;
      BackendClientService = _BackendClientService_;
      HttpClientService = _HttpClientService_;
    });
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  // TESTS

  it('should reject call to putOnline with correct info', function () {

    runs(function() {
      flag = false;
      var testUrl = '/api/test';
      $httpBackend.expectPUT(testUrl).respond(404, {});
      BackendClientService.putOnline(testUrl, new RegExp(testUrl), {testing: true}).then(
        undefined,
        function(error){
          expect(error.value.status).toBe(404);
          flag = true;
        }
      );
      $httpBackend.flush();
    });
    waitsFor(function(){
      return flag;
    }, 100);
  });

  it('should reject call to putOnline with invalid regexp', function () {
    runs(function() {
      var testUrl = '/api/test';
      BackendClientService.putOnline(testUrl, new RegExp(testUrl + '/jep'), {testing: true}).then(
        undefined,
        function(error){
          flag = true;
          expect(error.type).toBe('regex');
        }
      );
    });
    waitsFor(function(){
      return flag;
    }, 100);
  });

  it('should reject call to putOnline if refresh callback fails', function () {
    function testRefreshCallback(){
      return $q.reject({type: 'refreshFail'});
    }
    BackendClientService.registerRefreshCredentialsCallback(testRefreshCallback);

    runs(function() {
      var testUrl = '/api/test';
      BackendClientService.putOnline(testUrl, new RegExp(testUrl), {testing: true}).then(
        undefined,
        function(error){
          flag = true;
          expect(error.type).toBe('refreshFail');
        }
      );
    });
    waitsFor(function(){
      return flag;
    }, 100);
  });

});
