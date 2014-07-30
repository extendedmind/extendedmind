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

describe('HTTPQueueService', function() {

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

  it('should set ', function() {

  });

});
