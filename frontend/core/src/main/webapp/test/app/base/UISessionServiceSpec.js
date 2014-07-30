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

describe('UISessionService', function() {

  var LocalStorageService, SessionStorageService, UISessionService;
  var testCollectiveUUID = '5d2f8997-8bdf-4922-b891-6a6127682049';
  var testUserUUID = '3e38b63d-85c2-4e5d-afb6-eae0e5150c1f';

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


  it('should set my uuid as an active uuid', function() {
    inject(function(_UISessionService_) {
      UISessionService = _UISessionService_;
    });
    spyOn(SessionStorageService, 'getUserUUID').andCallThrough();
    spyOn(SessionStorageService, 'setActiveUUID');

    SessionStorageService.setUserUUID(testUserUUID);
    UISessionService.setMyActive();
    expect(SessionStorageService.getUserUUID).toHaveBeenCalled();
    expect(SessionStorageService.setActiveUUID).toHaveBeenCalledWith(testUserUUID);
  });

  it('should set collective uuid as an active uuid', function() {
    inject(function(_UISessionService_) {
      UISessionService = _UISessionService_;
    });
    spyOn(SessionStorageService, 'setActiveUUID');

    UISessionService.setCollectiveActive(testCollectiveUUID);
    expect(SessionStorageService.setActiveUUID).toHaveBeenCalledWith(testCollectiveUUID);
  });

  it('should set \'my\' as an active prefix', function() {
    inject(function(_UISessionService_) {
      UISessionService = _UISessionService_;
    });
    SessionStorageService.setUserUUID(testUserUUID);
    UISessionService.setMyActive();
    expect(UISessionService.getOwnerPrefix()).toEqual('my');
  });

  it('should set \'collective/[collective uuid]\' as an active prefix', function() {
    inject(function(_UISessionService_) {
      UISessionService = _UISessionService_;
    });

    UISessionService.setCollectiveActive(testCollectiveUUID);
    expect(UISessionService.getOwnerPrefix()).toEqual('collective/' + testCollectiveUUID);
  });

  it('should set active uuid from localStorage', function() {
    inject(function(_UISessionService_) {
      UISessionService = _UISessionService_;
    });
    expect(UISessionService.getActiveUUID()).toBeUndefined();

    spyOn(LocalStorageService, 'getUserUUID').andReturn(testUserUUID);

    expect(UISessionService.getActiveUUID()).toEqual(testUserUUID);
  });

  it('should not override sessionStorage\'s existing active uuid from localStorage', function() {
    inject(function(_UISessionService_) {
      UISessionService = _UISessionService_;
    });
    spyOn(LocalStorageService, 'getUserUUID').andReturn(testUserUUID);

    expect(UISessionService.getActiveUUID()).toEqual(testUserUUID);
    SessionStorageService.setActiveUUID(testCollectiveUUID);
    expect(UISessionService.getActiveUUID()).toEqual(testCollectiveUUID);
  });

  it('should change feature', function() {
    inject(function(_UISessionService_) {
      UISessionService = _UISessionService_;
    });
    spyOn(SessionStorageService, 'getUserUUID').andReturn(testUserUUID);

    var callbackCalled = false;
    function featureChangedCallback(/*newFeature, oldFeature*/){
      callbackCalled = true;
    }
    UISessionService.registerFeatureChangedCallback(featureChangedCallback, 'test');
    UISessionService.setMyActive();

    // 1. Change feature starting from an empty feature history

    UISessionService.changeFeature('tasks');
    expect(callbackCalled).toEqual(true);
    expect(UISessionService.getPreviousFeatureName()).toBeUndefined();

    // 2. Change to edit screen

    var testData = {title: 'test'};
    var testState = 'tasks/lists/123';

    UISessionService.setCurrentFeatureState(testState);
    UISessionService.changeFeature('taskEdit', testData);
    expect(UISessionService.getPreviousFeatureName()).toEqual('tasks');
    expect(UISessionService.getFeatureData('taskEdit')).toEqual(testData);
    expect(UISessionService.getFeatureState('tasks')).toEqual(testState);

    // 3. Change away to notes

    UISessionService.changeFeature('notes');
    expect(UISessionService.getPreviousFeatureName()).toEqual('taskEdit');
    expect(UISessionService.getFeatureData('taskEdit')).toEqual(testData);

  });
});
