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

 /* global module, describe, inject, beforeEach, afterEach, it, expect, spyOn, getJSONFixture, runs, waitsFor */
'use strict';

describe('SynchronizeService', function() {
  var flag;

  // INJECTS

  var $httpBackend;
  var SynchronizeService, ItemsService, BackendClientService, HttpClientService,
      ListsService, TagsService, TasksService, NotesService, AuthenticationService,
      ConvertService, PersistentStorageService;

  // MOCKS

  var now = new Date();
  var putNewItemResponse = getJSONFixture('putItemResponse.json');
  putNewItemResponse.created = putNewItemResponse.modified = now.getTime();
  var putNewTaskResponse = getJSONFixture('putTaskResponse.json');
  putNewTaskResponse.created = putNewTaskResponse.modified = now.getTime();
  var putNewNoteResponse = getJSONFixture('putNoteResponse.json');
  putNewNoteResponse.created = putNewNoteResponse.modified = now.getTime();
  var putExistingItemResponse = getJSONFixture('putExistingItemResponse.json');
  putExistingItemResponse.modified = now.getTime();
  var deleteItemResponse = getJSONFixture('deleteItemResponse.json');
  deleteItemResponse.result.modified = now.getTime();
  var undeleteItemResponse = getJSONFixture('undeleteItemResponse.json');
  undeleteItemResponse.modified = now.getTime();
  var completeTaskResponse = getJSONFixture('completeTaskResponse.json');
  completeTaskResponse.result.modified = now.getTime();
  var completeRepeatingTaskResponse = getJSONFixture('completeRepeatingTaskResponse.json');
  completeRepeatingTaskResponse.result.modified = now.getTime();
  var uncompleteTaskResponse = getJSONFixture('uncompleteTaskResponse.json');
  uncompleteTaskResponse.modified = now.getTime();
  var archiveListResponse = getJSONFixture('archiveListResponse.json');
  archiveListResponse.result.modified = now.getTime();

  var authenticateResponse = getJSONFixture('authenticateResponse.json');
  authenticateResponse.authenticated = now.getTime();
  authenticateResponse.expires = now.getTime() + 1000*60*60*12;
  authenticateResponse.replaceable = now.getTime() + 1000*60*60*24*7;

  var testOwnerUUID = '6be16f46-7b35-4b2d-b875-e13d19681e77';

  var MockUserSessionService = {
    authenticated: true,
    authenticateValid: true,
    authenticateReplaceable: true,
    latestModified: undefined,
    persistentDataLoaded: false,
    callbacks: {},
    isAuthenticated: function() {
      return this.authenticated;
    },
    isAuthenticateValid: function() {
      return this.authenticateValid;
    },
    isAuthenticateReplaceable: function() {
      return this.authenticateReplaceable;
    },
    getBackendDelta: function() {
      return 0;
    },
    getCredentials: function () {
      return '123456789';
    },
    getActiveUUID: function () {
      return testOwnerUUID;
    },
    getDeletedBeforeDestroyedDuration: function() {
      return 2592000000;
    },
    isFakeUser: function () {
      return false;
    },
    setAuthenticateInformation: function (/*authenticateResponse*/) {
      return;
    },
    clearUser: function() {
      return;
    },
    getLatestModified: function () {
      return this.latestModified;
    },
    setLatestModified: function (modified) {
      this.latestModified = modified;
    },
    isPersistentStorageEnabled: function(){
      return true;
    },
    isPersistentDataLoaded: function() {
      return this.persistentDataLoaded;
    },
    isCollective: function() {
      return false;
    },
    setPersistentDataLoaded: function(value) {
      this.persistentDataLoaded = value;
    },
    registerNofifyOwnersCallback: function(callback, id){
      this.callbacks[id] = callback;
    }
  };

  var MockUUIDService = {
    mockIndex: 0,
    mockFakeUUIDs: ['00000000-0000-4629-8552-96671b730000',
                    '00000000-0000-4629-8552-96671b730001',
                    '00000000-0000-4629-8552-96671b730002',
                    '00000000-0000-4629-8552-96671b730003'],
    s4: function(){
      return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
    },
    randomUUID: function() {
      return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' +
      this.s4() + '-' + this.s4() + this.s4() + this.s4();
    },
    generateFakeUUID: function() {
      var mockFakeUUID = this.mockFakeUUIDs[this.mockIndex];
      this.mockIndex++;
      return mockFakeUUID;
    },
    isFakeUUID: function(uuid) {
      if (uuid && uuid.startsWith('00000000-0000-'))
        return true;
    },
    getShortIdFromFakeUUID: function(fakeUUID) {
      return fakeUUID.substr(14, 4) + fakeUUID.substr(19, 4) + fakeUUID.substr(24, 12);
    },
  };

  // SETUP / TEARDOWN

  beforeEach(function() {
    module('em.appTest');

    module('em.base', function ($provide){
      $provide.value('UserSessionService', MockUserSessionService);
    });

    module('em.app', function ($provide){
      $provide.constant('enableOffline', true);
    });

    module('common', function($provide){
      $provide.constant('UUIDService', MockUUIDService);
    });

    inject(function (_$httpBackend_, _SynchronizeService_, _ItemsService_, _BackendClientService_,
                     _HttpClientService_, _ListsService_, _TagsService_,
                     _TasksService_, _NotesService_, _AuthenticationService_,
                     _ConvertService_, _PersistentStorageService_) {
      $httpBackend = _$httpBackend_;
      SynchronizeService = _SynchronizeService_;
      ItemsService = _ItemsService_;
      BackendClientService = _BackendClientService_;
      HttpClientService = _HttpClientService_;
      ListsService = _ListsService_;
      TagsService = _TagsService_;
      TasksService = _TasksService_;
      NotesService = _NotesService_;
      AuthenticationService = _AuthenticationService_;
      ConvertService = _ConvertService_;
      PersistentStorageService = _PersistentStorageService_;

      var testItemData = {
          'items': [{
              'uuid': 'f7724771-4469-488c-aabd-9db188672a9b',
              'created': 1391278509634,
              'modified': 1391278509634,
              'title': 'should I start yoga?'
            }, {
              'uuid': 'd1e764e8-3be3-4e3f-8bec-8c3f9e7843e9',
              'created': 1391278509640,
              'modified': 1391278509640,
              'title': 'remember the milk'
            }, {
              'uuid': '9a612ca2-7de0-45ad-a758-d949df37f51e',
              'created': 1391278509745,
              'modified': 1391278509745,
              'title': 'buy new shoes'
            }],
          'tasks': [{
              'uuid': '7a612ca2-7de0-45ad-a758-d949df37f51e',
              'created': 1391278509745,
              'modified': 1391278509745,
              'title': 'write essay body',
              'due': '2014-03-09',
              'relationships': {
                'parent': '07bc96d1-e8b2-49a9-9d35-1eece6263f98'
              }
            }, {
              'uuid': '7b53d509-853a-47de-992c-c572a6952629',
              'created': 1391278509698,
              'modified': 1391278509698,
              'completed': 1391278509917,
              'title': 'clean closet'
            }, {
              'uuid': '9a1ce3aa-f476-43c4-845e-af59a9a33760',
              'created': 1391278509717,
              'modified': 1391278509717,
              'title': 'print tickets',
              'link': 'http://www.finnair.fi',
              'due': '2014-01-02',
              'reminders': [{
                'packaging': 'ios-cordova',
                'notification': 1429255890410,
                'uuid': '51ff61b2-2a07-4b69-b149-d58b0510a1cd',
                'reminderType': 'ln',
                'modified': 1391278509717,
                'id': '12345678901234567',
                'device': 'iPhone6',
                'created': 1391278509717
              }],
              'relationships': {
                'parent': 'bf726d03-8fee-4614-8b68-f9f885938a51',
                'tags': ['1208d45b-3b8c-463e-88f3-f7ef19ce87cd']
              }
            }, {
              'uuid': '1a1ce3aa-f476-43c4-845e-af59a9a33760',
              'created': 1391278509917,
              'modified': 1391278509917,
              'title': 'buy tickets',
              'relationships': {
                'parent': 'bf726d03-8fee-4614-8b68-f9f885938a51'
              }
            }],
          'notes': [{
              'uuid': 'b2cd149a-a287-40a0-86d9-0a14462f22d8',
              'created': 1391627811075,
              'modified': 1391627811075,
              'title': 'booth number A23',
              'relationships': {
                'parent': 'bf726d03-8fee-4614-8b68-f9f885938a51'
              }
            }, {
              'uuid': 'a1cd149a-a287-40a0-86d9-0a14462f22d6',
              'created': 1391627811070,
              'modified': 1391627811070,
              'title': 'contexts could be used to prevent access to data',
              'content': 'might be a good idea'
            },{
              'uuid': 'c2cd149a-a287-40a0-86d9-0a14462f22d6',
              'created': 1391627811050,
              'modified': 1391627811050,
              'title': 'office door code',
              'content': '4321',
              'relationships': {
                'tags': ['c933e120-90e7-488b-9f15-ea2ee2887e67']
              }
            }, {
              'uuid': '848cda60-d725-40cc-b756-0b1e9fa5b7d8',
              'created': 1391627811059,
              'modified': 1391627811059,
              'title': 'notes on productivity',
              'content': '##what I\'ve learned about productivity \n ' +
                         '#focus \n' +
                         'to get things done, you need to have uninterrupted time \n' +
                         '#rhythm \n' +
                         'work in high intensity sprints of 90 minutes, then break for 15 minutes \n' +
                         '#rest \n' +
                         'without ample rest and sleep, your productivity will decline rapidly' +
                         '#tools \n' +
                         'use the best possible tools for your work \n' +
                         '#process \n' +
                         'increasing your productivity doesn\'t happen overnight',
              'relationships': {
                'parent': '0da0bff6-3bd7-4884-adba-f47fab9f270d',
                'tags': ['6350affa-1acf-4969-851a-9bf2b17806d6']
              }
            }],
          'lists': [{
              'uuid': '0da0bff6-3bd7-4884-adba-f47fab9f270d',
              'created': 1390912600957,
              'modified': 1390912600957,
              'title': 'extended mind technologies',
              'link': 'http://extendedmind.org'
            }, {
              'uuid': 'bf726d03-8fee-4614-8b68-f9f885938a51',
              'created': 1390912600947,
              'modified': 1390912600947,
              'title': 'trip to Dublin',
            }, {
              'uuid': 'cf726d03-8fee-4614-8b68-f9f885938a53',
              'created': 1390915600947,
              'modified': 1390915600947,
              'title': 'shopping list',
            }, {
              'uuid': '07bc96d1-e8b2-49a9-9d35-1eece6263f98',
              'created': 1390912600983,
              'modified': 1390912600983,
              'title': 'write essay on cognitive biases'
          }],
          'tags': [{
              'uuid': '1208d45b-3b8c-463e-88f3-f7ef19ce87cd',
              'created': 1391066914167,
              'modified': 1391066914167,
              'title': 'home',
              'tagType': 'context'
            }, {
              'uuid': '81daf688-d34d-4551-9a24-564a5861ace9',
              'created': 1391066914032,
              'modified': 1391066914032,
              'title': 'email',
              'tagType': 'context',
              'parent': 'e1bc540a-97fe-4c9f-9a44-ffcd7a8563e8'
            }, {
              'uuid': 'c933e120-90e7-488b-9f15-ea2ee2887e67',
              'created': 1391066914132,
              'modified': 1391066914132,
              'title': 'secret',
              'tagType': 'keyword'
            }]
        };
      // Clear previous data
      SynchronizeService.clearData();
      for (var id in MockUserSessionService.callbacks){
        MockUserSessionService.callbacks[id](testOwnerUUID);
      }
      // Syncronize with test data
      $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data')
       .respond(200, testItemData);
      SynchronizeService.synchronize(testOwnerUUID);
      $httpBackend.flush();
    });

    // http://stackoverflow.com/a/14381941
    var localStore = {};

    spyOn(localStorage, 'getItem').andCallFake(function(key) {
      return localStore[key];
    });
    spyOn(localStorage, 'setItem').andCallFake(function(key, value) {
      localStore[key] = value + '';
    });
    spyOn(localStorage, 'removeItem').andCallFake(function(key) {
      delete localStore[key];
    });
    spyOn(localStorage, 'clear').andCallFake(function() {
      localStore = {};
    });
  });

  afterEach(function() {
    // User Session Mock
    MockUserSessionService.setLatestModified(undefined);
    MockUserSessionService.authenticated = true;
    MockUserSessionService.authenticateValid = true;
    MockUserSessionService.authenticateReplaceable = true;
    MockUserSessionService.persistentDataLoaded = false;
    MockUserSessionService.callbacks = {};
    MockUUIDService.mockIndex = 0;

    PersistentStorageService.destroyAll();

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  // TESTS

  it('should load persistent data on sync', function () {
    MockUserSessionService.persistentDataLoaded = false;

    // Start from a clean slate
    ItemsService.clearItems();
    TasksService.clearTasks();
    NotesService.clearNotes();
    ListsService.clearLists();
    TagsService.clearTags();
    for (var id in MockUserSessionService.callbacks){
      MockUserSessionService.callbacks[id](testOwnerUUID);
    }

    // Expect to get data from the persistent storage
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID +
                           '/data?modified=' + MockUserSessionService.latestModified +
                           '&deleted=true&archived=true&completed=true').respond(
                           200, {});
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    expect(ItemsService.getItems(testOwnerUUID).length)
      .toBe(3);
    expect(TagsService.getTags(testOwnerUUID).length)
      .toBe(3);
    expect(ListsService.getLists(testOwnerUUID).length)
      .toBe(4);
    expect(TasksService.getTasks(testOwnerUUID).length)
      .toBe(4);
    expect(NotesService.getNotes(testOwnerUUID).length)
      .toBe(4);
  });

  it('should syncronize new item', function () {
    var newLatestModified = now.getTime();
    var modifiedGetItemsResponse = {
      'items': [{
        'uuid': 'e7724771-4469-488c-aabd-9db188672a9b',
        'modified': newLatestModified,
        'title': 'test item'
      }]
    };

    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID +
                           '/data?modified=' + MockUserSessionService.getLatestModified() +
                           '&deleted=true&archived=true&completed=true')
     .respond(200, modifiedGetItemsResponse);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();

    expect(ItemsService.getItems(testOwnerUUID).length)
      .toBe(4);
    expect(TagsService.getTags(testOwnerUUID).length)
      .toBe(3);
    expect(ListsService.getLists(testOwnerUUID).length)
      .toBe(4);
    expect(TasksService.getTasks(testOwnerUUID).length)
      .toBe(4);
    expect(NotesService.getNotes(testOwnerUUID).length)
      .toBe(4);

    expect(MockUserSessionService.getLatestModified())
      .toBe(newLatestModified);

    // Check that task got the right context

    expect(TasksService.getTaskInfo('9a1ce3aa-f476-43c4-845e-af59a9a33760',testOwnerUUID).task
            .trans.context.trans.uuid).toBe('1208d45b-3b8c-463e-88f3-f7ef19ce87cd');
  });

  it('should syncronize with empty result', function () {
    MockUserSessionService.setLatestModified(undefined);
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data')
     .respond(200, '{}');
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();

    expect(ItemsService.getItems(testOwnerUUID).length)
      .toBe(0);
    expect(TagsService.getTags(testOwnerUUID).length)
      .toBe(0);
    expect(ListsService.getLists(testOwnerUUID).length)
      .toBe(0);
    expect(TasksService.getTasks(testOwnerUUID).length)
      .toBe(0);
  });

  it('should handle item offline create, update, delete', function () {

    // 1. save new item

    var testItemValues = {
      'id': MockUUIDService.getShortIdFromFakeUUID(MockUUIDService.mockFakeUUIDs[0]),
      'title': 'test item',
    };
    var testItem = ItemsService.getNewItem(testItemValues, testOwnerUUID);
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items', testItemValues)
       .respond(404);
    ItemsService.saveItem(testItem);
    $httpBackend.flush();

    // Should go to the end of the array with a fake UUID
    var items = ItemsService.getItems(testOwnerUUID);
    expect(items.length)
      .toBe(4);
    expect(MockUUIDService.isFakeUUID(items[3].trans.uuid))
      .toBeTruthy();

    // 2. update item

    testItem.trans.description = 'test description';
    // We're expecting to get another try at creating the item
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items',
                           testItemValues)
       .respond(404);
    ItemsService.saveItem(testItem);
    $httpBackend.flush();
    expect(items.length)
      .toBe(4);
    expect(MockUUIDService.isFakeUUID(items[3].mod.uuid))
      .toBeTruthy();

    // 3. delete item
    // We're still expecting to get another try at creating the first
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items', testItemValues)
       .respond(404);
    ItemsService.deleteItem(testItem);
    $httpBackend.flush();
    expect(items.length)
      .toBe(3);

    // 4. undelete item
    // We're again, still expecting to get another try at creating the first
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items', testItemValues)
       .respond(404);
    ItemsService.undeleteItem(testItem);
    $httpBackend.flush();
    expect(items.length)
      .toBe(4);

    // 5. synchronize items and get back online, we're expecting the delete and undelete to cancel each other

    var latestModified = now.getTime();
    MockUserSessionService.setLatestModified(latestModified);
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, '{}');
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items', testItemValues)
        .respond(200, putNewItemResponse);
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items/' + putNewItemResponse.uuid,
                           {id: testItem.trans.id,
                            title: testItem.trans.title,
                            description: testItem.trans.description,
                            modified: putNewItemResponse.modified})
        .respond(200, putExistingItemResponse);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();

    // Verify that everything is right with the created item
    expect(items.length)
      .toBe(4);
    expect(MockUUIDService.isFakeUUID(items[3].mod.uuid))
      .toBeFalsy();
    expect(items[3].mod.description)
      .toBe('test description');

    // 6. delete online
    $httpBackend.expectDELETE('/api/v2/owners/' + testOwnerUUID + '/data/items/' +
                              testItem.mod.uuid)
       .respond(200, deleteItemResponse);
    ItemsService.deleteItem(testItem);
    $httpBackend.flush();
    expect(items.length)
      .toBe(3);
    expect(testItem.mod.deleted)
      .toBe(deleteItemResponse.deleted);
    expect(testItem.mod.modified)
      .toBe(deleteItemResponse.result.modified);

    // 7. undelete online
    $httpBackend.expectPOST('/api/v2/owners/' + testOwnerUUID + '/data/items/' + testItem.mod.uuid +
                            '/undelete')
       .respond(200, undeleteItemResponse);
    ItemsService.undeleteItem(testItem);
    $httpBackend.flush();
    expect(items.length)
      .toBe(4);
    expect(items[3].mod.deleted)
      .toBeUndefined();
    expect(items[3].mod.modified)
      .toBe(undeleteItemResponse.modified);

    // 8. synchronize and get new item as it is back,
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, {
          items: [
            {uuid: items[3].mod.uuid,
             title: items[3].mod.title,
             description: items[3].mod.description,
             created: items[3].mod.created,
             modified: items[3].mod.modified}]
          });
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    expect(items.length)
      .toBe(4);
    expect(items[3].mod)
      .toBeUndefined();
    expect(items[3].modified)
      .toBe(undeleteItemResponse.modified);

  });

  it('should handle item offline update with conflicting sync from server', function () {

    // 1. save existing item
    var yoga = ItemsService.getItemInfo('f7724771-4469-488c-aabd-9db188672a9b', testOwnerUUID).item;
    yoga.trans.description = 'just do it';
    var yogaValues = {title: yoga.trans.title,
                      description: yoga.trans.description,
                      modified: yoga.modified};

    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items/' + yoga.trans.uuid,
                          yogaValues)
       .respond(404);
    ItemsService.saveItem(yoga);
    $httpBackend.flush();
    var items = ItemsService.getItems(testOwnerUUID);
    expect(items.length)
      .toBe(3);
    expect(items[0].trans.description)
      .toBe('just do it');
    expect(items[0].mod.description)
      .toBe(items[0].trans.description);
    expect(items[0].description)
      .toBeUndefined();

    // 2. synchronize items and get back online with conflicting yoga response, that's older than the
    //    offline saved item: the newer is executed
    var latestModified = now.getTime()-100000;
    MockUserSessionService.setLatestModified(latestModified);

    var newLatestModified = latestModified + 1000;
    var conflictYogaResponse = {
      items: [{
        'uuid': yoga.uuid,
        'created': 1391278509634,
        'modified': newLatestModified,
        'title': 'I will start yoga'
      }]
    };
    yogaValues.modified = newLatestModified;
    yogaValues.title = 'I will start yoga';
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, conflictYogaResponse);
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items/' + yoga.trans.uuid,
                           yogaValues)
        .respond(200, putNewItemResponse);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    MockUserSessionService.setLatestModified(newLatestModified);
    expect(yoga.mod.title).toBe(yogaValues.title);

    // 3. save existing offline again
    yoga.trans.description = 'just do it, or not';
    yogaValues.description = yoga.trans.description;
    yogaValues.modified = yoga.trans.modified;
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items/' + yoga.uuid,
                           yogaValues)
       .respond(404);
    ItemsService.saveItem(yoga);
    $httpBackend.flush();
    expect(items.length)
      .toBe(3);

    // 4. synchronize with conflicting item that is newer, expect PUT to have been merged
    var veryLatestModified = Date.now() + 1;
    conflictYogaResponse.items[0].modified = veryLatestModified;
    yogaValues.modified = veryLatestModified;
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data?modified=' +
                            newLatestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, conflictYogaResponse);
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items/' + yoga.trans.uuid,
                           yogaValues)
        .respond(200, putNewItemResponse);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    expect(items.length)
      .toBe(3);

  });

  it('should handle item offline create with no/empty response from server, and then sync', function () {

    var items = ItemsService.getItems(testOwnerUUID);
    expect(items.length)
      .toBe(3);

    // 1. create item and respond with an empty response
    var testItemValues = {
      id: MockUUIDService.getShortIdFromFakeUUID(MockUUIDService.mockFakeUUIDs[0]),
      title: 'test item'
    };
    var testItem = ItemsService.getNewItem(testItemValues, testOwnerUUID);
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items', testItemValues)
       .respond(200, {testing: true});
    ItemsService.saveItem(testItem);
    $httpBackend.flush();
    expect(items.length)
      .toBe(4);
    expect(items[3].mod.title)
      .toBe(testItemValues.title);
    expect(MockUUIDService.isFakeUUID(items[3].mod.uuid))
      .toBeTruthy();

    // 2. synchronize items with item in the response, even though the response in the original PUT
    //    was invalid
    var latestModified = now.getTime();
    MockUserSessionService.setLatestModified(latestModified);
    var testItemUUID = 'c2724771-4469-488c-aabd-9db188672a00';
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200,
        {
          items: [
          { uuid: testItemUUID,
            id: testItemValues.id,
            title: testItemValues.title,
            created: latestModified-1,
            modified: latestModified-1}
          ]
        });
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();

    // Verify that everything is right with the created item
    expect(items.length)
      .toBe(4);
    expect(items[3].mod)
      .toBeUndefined();
    expect(items[3].uuid)
      .toBe(testItemUUID);
  });

  it('should handle task offline create, update, delete', function () {

    // 1. save new item
    var testItemValues = {
      'id': MockUUIDService.getShortIdFromFakeUUID(MockUUIDService.mockFakeUUIDs[0]),
      'title': 'test task'
    };
    var testItem = ItemsService.getNewItem(testItemValues, testOwnerUUID);
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items', testItemValues)
       .respond(404);
    ItemsService.saveItem(testItem);
    $httpBackend.flush();
    var items = ItemsService.getItems(testOwnerUUID);
    expect(items.length)
      .toBe(4);

    // 2. make item into task
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items', testItemValues)
       .respond(404);
    ItemsService.itemToTask(testItem);
    $httpBackend.flush();
    expect(items.length)
      .toBe(3);
    var tasks = TasksService.getTasks(testOwnerUUID);
    expect(tasks.length)
      .toBe(5);
    expect(tasks[4].trans.title)
      .toBe('test task');

    // 3. update task, this should just replace the previous call because itemToTask
    //    is a task update and updating is lastReplaceable
    var updatedTestTask = tasks[4];
    updatedTestTask.trans.description = 'test description';
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items', testItemValues)
       .respond(404);
    TasksService.saveTask(updatedTestTask);
    $httpBackend.flush();

    expect(tasks.length)
      .toBe(5);

    // 4. delete task
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items', testItemValues)
       .respond(404);
    TasksService.deleteTask(updatedTestTask);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(4);

    // 5. undelete task
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items', testItemValues)
       .respond(404);
    TasksService.undeleteTask(updatedTestTask);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(5);

    // 6. synchronize items and get back online, we're expecting the delete and undelete to cancel each other
    var latestModified = now.getTime();
    MockUserSessionService.setLatestModified(latestModified);
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, '{}');
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items', testItemValues)
        .respond(200, putNewItemResponse);
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' +
                           putNewItemResponse.uuid,
                           {id: updatedTestTask.trans.id,
                            title: updatedTestTask.trans.title,
                            description: updatedTestTask.trans.description,
                            modified: putNewItemResponse.modified})
        .respond(200, putExistingItemResponse);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();

    // Verify that everything is right with the created item
    expect(items.length)
      .toBe(3);
    expect(tasks.length)
      .toBe(5);
    expect(MockUUIDService.isFakeUUID(tasks[4].mod.uuid))
      .toBeFalsy();
    expect(tasks[4].mod.description)
      .toBe('test description');
    expect(tasks[4].description)
      .toBeUndefined();

    // 7. delete online
    $httpBackend.expectDELETE('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' + updatedTestTask.mod.uuid)
       .respond(200, deleteItemResponse);
    TasksService.deleteTask(updatedTestTask);
    $httpBackend.flush();

    expect(tasks.length)
      .toBe(4);
    expect(updatedTestTask.mod.deleted)
      .toBe(deleteItemResponse.deleted);
    expect(updatedTestTask.mod.modified)
      .toBe(deleteItemResponse.result.modified);

    // 8. undelete online
    $httpBackend.expectPOST('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' + updatedTestTask.mod.uuid + '/undelete')
       .respond(200, undeleteItemResponse);
    TasksService.undeleteTask(updatedTestTask);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(5);
    expect(tasks[4].mod.deleted)
      .toBeUndefined();
    expect(tasks[4].mod.modified)
      .toBe(undeleteItemResponse.modified);

    // 9. synchronize and get new task as it is back,
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, {
          tasks: [
            {uuid: tasks[4].mod.uuid,
             title: tasks[4].mod.title,
             description: tasks[4].mod.description,
             created: tasks[4].mod.created,
             modified: tasks[4].mod.modified}]
          });
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(5);
    expect(tasks[4].mod)
      .toBeUndefined();
    expect(tasks[4].modified)
      .toBe(undeleteItemResponse.modified);

  });

  it('should handle task offline complete, uncomplete', function () {

    // 1. save new task
    var testTaskValues = {
      'id': MockUUIDService.getShortIdFromFakeUUID(MockUUIDService.mockFakeUUIDs[0]),
      'title': 'test task'
    };
    var testTask = TasksService.getNewTask(testTaskValues, testOwnerUUID);
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tasks', testTaskValues)
       .respond(404);
    TasksService.saveTask(testTask);
    $httpBackend.flush();
    var tasks = TasksService.getTasks(testOwnerUUID);
    expect(tasks.length)
      .toBe(5);

    // 2. complete it

    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tasks', testTaskValues)
       .respond(404);
    TasksService.completeTask(testTask);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(5);
    expect(testTask.mod.completed).toBeDefined();

    // 3. uncomplete it

    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tasks', testTaskValues)
       .respond(404);
    TasksService.uncompleteTask(testTask);
    $httpBackend.flush();

    expect(tasks.length)
      .toBe(5);
    expect(testTask.completed).toBeUndefined();

    // 4. complete it again but go online, expect only one complete

    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tasks', testTaskValues)
       .respond(200, putNewItemResponse);
    $httpBackend.expectPOST('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' + putNewItemResponse.uuid + '/complete')
       .respond(200, completeTaskResponse);
    TasksService.completeTask(testTask);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(5);
    expect(testTask.mod.completed)
      .toBe(completeTaskResponse.completed);
    expect(testTask.mod.modified)
      .toBe(completeTaskResponse.result.modified);

    // 5. uncomplete online

    $httpBackend.expectPOST('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' + putNewItemResponse.uuid + '/uncomplete')
       .respond(200, uncompleteTaskResponse);
    TasksService.uncompleteTask(testTask);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(5);
    expect(testTask.mod.modified)
      .toBe(uncompleteTaskResponse.modified);

    // 6. complete offline but get conflicting completed response from the server: expect that double
    //    complete has been removed from queue
    var buyTickets = TasksService.getTaskInfo('1a1ce3aa-f476-43c4-845e-af59a9a33760', testOwnerUUID).task;
    $httpBackend.expectPOST('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' + buyTickets.uuid + '/complete')
       .respond(404);
    TasksService.completeTask(buyTickets);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(5);
    expect(buyTickets.mod.completed).toBeDefined();

    var latestModified = now.getTime()-100000;
    MockUserSessionService.setLatestModified(latestModified);

    var conflictModified = now.getTime() + 1;
    var conflictingBuyTickets = {
      'uuid': buyTickets.trans.uuid,
      'created': buyTickets.trans.created,
      'modified': conflictModified,
      'completed': conflictModified + 1,
      'title': buyTickets.trans.title,
      'relationships': buyTickets.relationships
    };

    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, {tasks: [conflictingBuyTickets]});
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();

    expect(tasks.length)
      .toBe(5);

    expect(tasks[3].mod)
      .toBeUndefined();
    expect(tasks[3].completed)
      .toBe(conflictModified+1);
  });

  it('should handle task offline update with conflicting sync from server', function () {

    // 1. save existing task
    var tasks = TasksService.getTasks(testOwnerUUID);
    var cleanCloset = TasksService.getTaskInfo('7b53d509-853a-47de-992c-c572a6952629', testOwnerUUID).task;
    var cleanClosetOriginalModified = cleanCloset.modified;
    cleanCloset.trans.description = 'now';
    var cleanClosetTransport = {title: cleanCloset.trans.title,
                                description: cleanCloset.trans.description,
                                modified: cleanCloset.trans.modified};

    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' + cleanCloset.trans.uuid, cleanClosetTransport)
       .respond(404);
    TasksService.saveTask(cleanCloset);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(4);

    // 2. synchronize items and get back online with conflicting response, that's older than the
    //    offline saved one, the newer is executed with merged values
    var latestModified = now.getTime()-100000;
    MockUserSessionService.setLatestModified(latestModified);

    var newLatestModified = latestModified + 1000;
    var conflictCleanClosetResponse = {
      tasks: [{
        'uuid': cleanCloset.trans.uuid,
        'created': cleanCloset.trans.created,
        'modified': newLatestModified,
        'completed': newLatestModified + 1,
        'title': 'clean closet!'
      }]
    };
    cleanClosetTransport.modified = newLatestModified;
    cleanClosetTransport.title = conflictCleanClosetResponse.tasks[0].title;
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, conflictCleanClosetResponse);
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' + cleanCloset.trans.uuid,
        cleanClosetTransport).respond(200, {modified: newLatestModified});
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    MockUserSessionService.setLatestModified(newLatestModified);

    expect(tasks.length)
      .toBe(4);
    expect(tasks[0].modified)
      .toBe(cleanClosetOriginalModified);
    expect(tasks[0].mod.modified)
      .toBe(newLatestModified);
    expect(tasks[0].trans.modified)
      .toBe(newLatestModified);

    // 3. save existing offline again
    cleanClosetTransport.modified = newLatestModified;
    cleanCloset = TasksService.getTaskInfo(cleanCloset.trans.uuid, testOwnerUUID).task;

    cleanCloset.trans.title = 'clean my closet';
    cleanClosetTransport.title = cleanCloset.trans.title;
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' + cleanCloset.trans.uuid,
                           cleanClosetTransport)
       .respond(404);
    TasksService.saveTask(cleanCloset);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(4);

    // 4. synchronize with conflicting task that is newer, expect PUT to be merged
    var veryLatestModified = Date.now() + 1;
    conflictCleanClosetResponse.tasks[0].modified = veryLatestModified;
    conflictCleanClosetResponse.tasks[0].title = cleanCloset.trans.title;
    cleanClosetTransport.modified = veryLatestModified;
    var lastModified = veryLatestModified+100;
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data?modified=' +
                            newLatestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, conflictCleanClosetResponse);
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' + cleanCloset.trans.uuid,
        cleanClosetTransport).respond(200, {modified: lastModified});
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(4);

    expect(tasks[0].modified)
      .toBe(cleanClosetOriginalModified);
    expect(tasks[0].mod.title)
      .toBe('clean my closet');
    expect(tasks[0].mod.modified)
      .toBe(lastModified);
    expect(tasks[0].trans.modified)
      .toBe(lastModified);
  });



  it('should handle task offline update and complete and update again then sync', function () {

    // 1. save existing task
    var tasks = TasksService.getTasks(testOwnerUUID);
    var cleanCloset = TasksService.getTaskInfo('7b53d509-853a-47de-992c-c572a6952629', testOwnerUUID).task;
    var cleanClosetOriginalModified = cleanCloset.modified;
    cleanCloset.trans.description = 'now';
    var cleanClosetTransport = {title: cleanCloset.trans.title,
                                description: cleanCloset.trans.description,
                                modified: cleanCloset.modified};

    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' + cleanCloset.trans.uuid,
                           cleanClosetTransport)
       .respond(404);
    TasksService.saveTask(cleanCloset);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(4);

    // 2. complete existing task
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' + cleanCloset.trans.uuid,
                           cleanClosetTransport)
       .respond(404);
    TasksService.uncompleteTask(cleanCloset);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(4);
    expect(cleanCloset.trans.completed)
      .toBeFalsy();

    // 3. save existing task again
    cleanCloset.trans.description = 'do it now!';
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' + cleanCloset.trans.uuid,
                           cleanClosetTransport)
       .respond(404);
    TasksService.saveTask(cleanCloset);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(4);

    // 4. synchronize items and get back online with correct value
    var firstSaveModified = now.getTime()+100;
    var uncompletedModified = now.getTime()+200;
    var secondSaveModified = now.getTime()+300;
    var latestModified = now.getTime();
    MockUserSessionService.setLatestModified(latestModified);

    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, {});
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' + cleanCloset.trans.uuid,
        cleanClosetTransport)
        .respond(200, {modified: firstSaveModified});
    $httpBackend.expectPOST('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' + cleanCloset.trans.uuid +
                            '/uncomplete')
        .respond(200, {modified: uncompletedModified});
    var recleanClosetTransport = {
      title: cleanCloset.trans.title,
      description: cleanCloset.trans.description,
      modified: uncompletedModified
    };
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' + cleanCloset.trans.uuid,
        recleanClosetTransport)
        .respond(200, {modified: secondSaveModified});
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();

    expect(tasks.length)
      .toBe(4);
    expect(tasks[0].modified)
      .toBe(cleanClosetOriginalModified);
    expect(tasks[0].mod.modified)
      .toBe(secondSaveModified);
    expect(tasks[0].trans.modified)
      .toBe(secondSaveModified);
  });

  it('should handle task offline update to repeating and complete', function () {

    // 1. save existing task with repeating
    var tasks = TasksService.getTasks(testOwnerUUID);
    var cleanCloset = TasksService.getTaskInfo('7b53d509-853a-47de-992c-c572a6952629', testOwnerUUID).task;
    cleanCloset.trans.due = '2015-01-01';
    cleanCloset.trans.repeating = 'daily';
    var cleanClosetTransport = {title: cleanCloset.trans.title,
                                due: cleanCloset.trans.due,
                                repeating: cleanCloset.trans.repeating,
                                modified: cleanCloset.trans.modified};
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' + cleanCloset.trans.uuid, cleanClosetTransport)
       .respond(404);
    TasksService.saveTask(cleanCloset);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(4);

    // 2. uncomplete task
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' + cleanCloset.trans.uuid, cleanClosetTransport)
       .respond(404);
    TasksService.uncompleteTask(cleanCloset);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(4);
    expect(cleanCloset.mod.completed).toBeUndefined();

    // 3. complete task, expect new task to be created
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' + cleanCloset.trans.uuid, cleanClosetTransport)
       .respond(404);
    TasksService.completeTask(cleanCloset);
    $httpBackend.flush();
    var generatedTask = TasksService.getTaskInfo(cleanCloset.hist.generatedUUID, testOwnerUUID).task;
    expect(tasks.length)
      .toBe(5);
    expect(cleanCloset.mod.completed).toBeDefined();
    expect(cleanCloset.hist.generatedUUID).toBeDefined();
    expect(MockUUIDService.isFakeUUID(cleanCloset.hist.generatedUUID)).toBeTruthy();

    expect(generatedTask).toBeDefined();
    expect(generatedTask.trans.due)
      .toBe('2015-01-02');

    // 4. uncomplete and get back online
    var latestModified = now.getTime()-100000;
    completeRepeatingTaskResponse.generated = {
      uuid: MockUUIDService.randomUUID(),
      title: generatedTask.trans.title,
      due: generatedTask.trans.due,
      repeating: generatedTask.trans.repeating,
      modified: latestModified + 100,
      created: latestModified + 100
    };

    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' + cleanCloset.trans.uuid, cleanClosetTransport)
       .respond(200, putExistingItemResponse);
    $httpBackend.expectPOST('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' + cleanCloset.trans.uuid + '/uncomplete')
       .respond(200, uncompleteTaskResponse);
    $httpBackend.expectPOST('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' + cleanCloset.trans.uuid + '/complete')
       .respond(200, completeRepeatingTaskResponse);
    $httpBackend.expectPOST('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' + cleanCloset.trans.uuid + '/uncomplete')
       .respond(200, uncompleteTaskResponse);
    TasksService.uncompleteTask(cleanCloset);
    $httpBackend.flush();
    expect(cleanCloset.mod.modified).toBe(uncompleteTaskResponse.modified);
    expect(cleanCloset.hist.generatedUUID).toBe(completeRepeatingTaskResponse.generated.uuid);
    expect(generatedTask.mod.uuid).toBe(completeRepeatingTaskResponse.generated.uuid);
    expect(generatedTask.mod.modified).toBe(completeRepeatingTaskResponse.generated.modified);

    // 5. synchronize with generated task
    MockUserSessionService.setLatestModified(latestModified);
    var backendTaskResponse = {
      tasks: [{
        'uuid': cleanCloset.trans.uuid,
        'created': cleanCloset.trans.created,
        'modified': uncompleteTaskResponse.modified,
        'due': cleanCloset.trans.due,
        'repeating': cleanCloset.trans.repeating,
        'title': cleanCloset.trans.title
      }, completeRepeatingTaskResponse.generated]
    };
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, backendTaskResponse);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(5);
    expect(cleanCloset.mod).toBeUndefined();
    expect(generatedTask.mod).toBeUndefined();
    expect(generatedTask.uuid).toBe(completeRepeatingTaskResponse.generated.uuid);
  });

  it('should handle repeating complete both online and offline and then sync', function () {

    // 1. save existing task with repeating (and remove parent)
    var tasks = TasksService.getTasks(testOwnerUUID);
    var buyTickets = TasksService.getTaskInfo('1a1ce3aa-f476-43c4-845e-af59a9a33760', testOwnerUUID).task;
    buyTickets.trans.due = '2015-01-01';
    buyTickets.trans.repeating = 'daily';
    buyTickets.trans.list = undefined;
    var buyTicketsTransport = {title: buyTickets.trans.title,
                                due: buyTickets.trans.due,
                                repeating: buyTickets.trans.repeating,
                                modified: buyTickets.trans.modified};
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' + buyTickets.trans.uuid, buyTicketsTransport)
       .respond(200, putExistingItemResponse);
    TasksService.saveTask(buyTickets);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(4);

    var latestModified = putExistingItemResponse.modified - 1;

    // 2. synchronize with generated task
    MockUserSessionService.setLatestModified(latestModified);
    var backendTaskResponse = {
      tasks: [{
        'uuid': buyTickets.trans.uuid,
        'created': buyTickets.trans.created,
        'modified': putExistingItemResponse.modified,
        'due': buyTickets.trans.due,
        'repeating': buyTickets.trans.repeating,
        'title': buyTickets.trans.title
      }]
    };
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, backendTaskResponse);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(4);
    expect(buyTickets.mod).toBeUndefined();

    // 3. complete task offline, expect new task to be created
    $httpBackend.expectPOST('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' + buyTickets.trans.uuid + '/complete')
       .respond(404);
    TasksService.completeTask(buyTickets);
    $httpBackend.flush();
    var generatedTask = TasksService.getTaskInfo(buyTickets.hist.generatedUUID, testOwnerUUID).task;
    expect(tasks.length)
      .toBe(5);
    expect(buyTickets.mod.completed).toBeDefined();
    var generatedFakeUUID = buyTickets.hist.generatedUUID;
    expect(generatedFakeUUID).toBeDefined();
    expect(MockUUIDService.isFakeUUID(buyTickets.hist.generatedUUID)).toBeTruthy();

    expect(generatedTask).toBeDefined();
    expect(generatedTask.trans.due)
      .toBe('2015-01-02');


    // 4. complete the generated task offline again, expect another task to be created
    $httpBackend.expectPOST('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' + buyTickets.trans.uuid + '/complete')
       .respond(404);
    TasksService.completeTask(generatedTask);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(6);

    // 5. Get sync with online generated task from first task,
    //    expect both offline generated tasks to be destroyed
    latestModified += 1;
    MockUserSessionService.setLatestModified(latestModified);
    backendTaskResponse = {
      tasks: [{
        'uuid': buyTickets.trans.uuid,
        'created': buyTickets.trans.created,
        'modified': latestModified+1,
        'completed': latestModified+1,
        'due': buyTickets.trans.due,
        'repeating': buyTickets.trans.repeating,
        'title': buyTickets.trans.title
      },{
        'uuid': '2a1ce3aa-f476-43c4-845e-af59a9a33760',
        'created': latestModified+2,
        'modified': latestModified+2,
        'due': '2015-01-02',
        'repeating': buyTickets.trans.repeating,
        'title': buyTickets.trans.title,
        'relationships': {
          'origin': buyTickets.trans.uuid
        }
      }]
    };
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, backendTaskResponse);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(5);
    expect(buyTickets.hist).toBeUndefined();
    expect(buyTickets.mod).toBeUndefined();
    expect(TasksService.getTaskInfo(generatedFakeUUID, testOwnerUUID)).toBeUndefined();
  });

  it('should handle task offline create with no/empty response from server, and then sync', function () {

    var tasks = TasksService.getTasks(testOwnerUUID);
    expect(tasks.length)
      .toBe(4);

    // 1. create task and respond with an empty response
    var testTaskValues = {
      id: MockUUIDService.getShortIdFromFakeUUID(MockUUIDService.mockFakeUUIDs[0]),
      title: 'test task'
    };
    var testTask = TasksService.getNewTask(testTaskValues, testOwnerUUID);
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tasks', testTaskValues)
       .respond(200, {testing: true});
    TasksService.saveTask(testTask);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(5);
    expect(tasks[4].mod.title)
      .toBe(testTaskValues.title);
    expect(MockUUIDService.isFakeUUID(tasks[4].mod.uuid))
      .toBeTruthy();

    // 2. synchronize items with task in the response, even though the response in the original PUT
    //    was invalid
    var latestModified = now.getTime();
    MockUserSessionService.setLatestModified(latestModified);
    var testTaskUUID = 'b2724771-4469-488c-aabd-9db188672a00';
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200,
        {
          tasks: [
          { uuid: testTaskUUID,
            id: testTaskValues.id,
            title: testTaskValues.title,
            created: latestModified-1,
            modified: latestModified-1}
          ]
        });
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();

    // Verify that everything is right with the created task
    expect(tasks.length)
      .toBe(5);
    expect(tasks[4].mod)
      .toBeUndefined();
    expect(tasks[4].uuid)
      .toBe(testTaskUUID);
  });

  it('should handle note offline create, update, delete', function () {

    // 1. save new item
    var testItemValues = {
      'id': MockUUIDService.getShortIdFromFakeUUID(MockUUIDService.mockFakeUUIDs[0]),
      'title': 'test note'
    };
    var testItem = ItemsService.getNewItem(testItemValues, testOwnerUUID);
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items', testItemValues)
       .respond(404);
    ItemsService.saveItem(testItem);
    $httpBackend.flush();
    var items = ItemsService.getItems(testOwnerUUID);
    expect(items.length)
      .toBe(4);

    // 2. make item into note
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items', testItemValues)
       .respond(404);
    ItemsService.itemToNote(testItem);
    $httpBackend.flush();
    expect(items.length)
      .toBe(3);
    var notes = NotesService.getNotes(testOwnerUUID);
    expect(notes.length)
      .toBe(5);
    expect(notes[4].trans.title)
      .toBe('test note');

    // 3. update note
    var updatedTestNote = notes[4];
    updatedTestNote.trans.description = 'test description';

    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items', testItemValues)
       .respond(404);
    NotesService.saveNote(updatedTestNote);
    $httpBackend.flush();

    expect(notes.length)
      .toBe(5);

    // 4. delete note
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items', testItemValues)
       .respond(404);
    NotesService.deleteNote(updatedTestNote);
    $httpBackend.flush();
    expect(notes.length)
      .toBe(4);

    // 5. undelete note
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items', testItemValues)
       .respond(404);
    NotesService.undeleteNote(updatedTestNote);
    $httpBackend.flush();
    expect(notes.length)
      .toBe(5);

    // 6. synchronize items and get back online, we're expecting the delete and undelete to cancel each other
    var latestModified = now.getTime();
    MockUserSessionService.setLatestModified(latestModified);
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, '{}');
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items', testItemValues)
        .respond(200, putNewItemResponse);
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/notes/' + putNewItemResponse.uuid,
                           {id: updatedTestNote.trans.id,
                            title: updatedTestNote.trans.title,
                            description: updatedTestNote.trans.description,
                            modified: putNewItemResponse.modified})
        .respond(200, putExistingItemResponse);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();

    // Verify that everything is right with the created note
    expect(items.length)
      .toBe(3);
    expect(notes.length)
      .toBe(5);
    expect(MockUUIDService.isFakeUUID(notes[4].uuid))
      .toBeFalsy();
    expect(notes[4].mod.description)
      .toBeDefined();

    // 7. delete online
    $httpBackend.expectDELETE('/api/v2/owners/' + testOwnerUUID + '/data/notes/' + updatedTestNote.mod.uuid)
       .respond(200, deleteItemResponse);
    NotesService.deleteNote(updatedTestNote);
    $httpBackend.flush();
    expect(notes.length)
      .toBe(4);
    expect(updatedTestNote.mod.deleted)
      .toBe(deleteItemResponse.deleted);
    expect(updatedTestNote.mod.modified)
      .toBe(deleteItemResponse.result.modified);

    // 8. undelete online
    $httpBackend.expectPOST('/api/v2/owners/' + testOwnerUUID + '/data/notes/' + updatedTestNote.mod.uuid + '/undelete')
       .respond(200, undeleteItemResponse);
    NotesService.undeleteNote(updatedTestNote);
    $httpBackend.flush();
    expect(notes.length)
      .toBe(5);
    expect(notes[4].mod.deleted)
      .toBeUndefined();
    expect(notes[4].mod.modified)
      .toBe(undeleteItemResponse.modified);

    // 9. synchronize and get new note as it is back
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, {
          notes: [
            {uuid: notes[4].mod.uuid,
             title: notes[4].mod.title,
             description: notes[4].mod.description,
             created: notes[4].mod.created,
             modified: notes[4].mod.modified}]
          });
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    expect(notes.length)
      .toBe(5);
    expect(notes[4].mod)
      .toBeUndefined();
    expect(notes[4].modified)
      .toBe(undeleteItemResponse.modified);
  });


  it('should handle note offline update with conflicting sync from server', function () {

    // 1. save existing note
    var aboutContexts = NotesService.getNoteInfo('a1cd149a-a287-40a0-86d9-0a14462f22d6', testOwnerUUID).note;
    var aboutContextsOriginalTitle = aboutContexts.trans.title;
    aboutContexts.trans.title = 'contexts might be used to prevent access to data';
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/notes/' + aboutContexts.uuid,
                          { title: aboutContexts.trans.title,
                            content: aboutContexts.trans.content,
                            modified: aboutContexts.trans.modified})
       .respond(404);
    NotesService.saveNote(aboutContexts);
    $httpBackend.flush();
    var notes = NotesService.getNotes(testOwnerUUID);
    expect(notes.length)
      .toBe(4);

    // 2. synchronize items and get back online with conflicting response, that's older than the
    //    offline saved one: the newer is executed with merged values
    var latestModified = now.getTime()-100000;
    MockUserSessionService.setLatestModified(latestModified);

    var newLatestModified = latestModified + 1000;
    var conflictAboutContextsResponse = {
      notes: [{
        'uuid': 'a1cd149a-a287-40a0-86d9-0a14462f22d6',
        'created': 1391627811070,
        'modified': newLatestModified,
        'title': 'contexts should be used to prevent access to data',
        'content': 'might be a good idea, maybe'
      }]
    };
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, conflictAboutContextsResponse);
    var aboutContextsTransport = {
      title: aboutContexts.trans.title,
      content: conflictAboutContextsResponse.notes[0].content,
      modified: newLatestModified};
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/notes/' + aboutContexts.uuid,
                           aboutContextsTransport)
        .respond(200, {modified: newLatestModified + 1});
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    MockUserSessionService.setLatestModified(newLatestModified);

    var aboutContextsConflictingContent = NotesService.getNoteInfo('a1cd149a-a287-40a0-86d9-0a14462f22d6',
                                                      testOwnerUUID).note;
    expect(aboutContextsConflictingContent.mod.content).toBe(conflictAboutContextsResponse.notes[0].content);

    // 3. save existing offline again
    aboutContextsConflictingContent.trans.title = aboutContextsOriginalTitle;
    aboutContextsTransport.title = aboutContextsOriginalTitle;
    aboutContextsTransport.modified = newLatestModified + 1;
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/notes/' + aboutContexts.uuid,
                           aboutContextsTransport)
       .respond(404);
    NotesService.saveNote(aboutContextsConflictingContent);
    $httpBackend.flush();
    expect(notes.length)
      .toBe(4);

    // 4. synchronize with conflicting note that is newer but with same content, expect PUT to be deleted
    var veryLatestModified = Date.now() + 1;
    conflictAboutContextsResponse.notes[0].modified = veryLatestModified;
    conflictAboutContextsResponse.notes[0].title = aboutContextsConflictingContent.trans.title;
    conflictAboutContextsResponse.notes[0].content = aboutContextsConflictingContent.trans.content;
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data?modified=' +
                            newLatestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, conflictAboutContextsResponse);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    expect(notes.length)
      .toBe(4);

    expect(notes[2].title)
      .toBe(conflictAboutContextsResponse.notes[0].title);
    expect(notes[2].mod)
      .toBeUndefined();
    expect(notes[2].modified)
      .toBe(veryLatestModified);
  });

  it('should handle note offline create with no/empty response from server, and then sync', function () {

    var notes = NotesService.getNotes(testOwnerUUID);
    expect(notes.length)
      .toBe(4);

    // 1. create note and respond with an empty response
    var testNoteValues = {
      id: MockUUIDService.getShortIdFromFakeUUID(MockUUIDService.mockFakeUUIDs[0]),
      title: 'test note'
    };
    var testNote = NotesService.getNewNote(testNoteValues, testOwnerUUID);
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/notes', testNoteValues)
       .respond(200, {testing: true});
    NotesService.saveNote(testNote);
    $httpBackend.flush();
    expect(notes.length)
      .toBe(5);
    expect(notes[4].mod.title)
      .toBe(testNoteValues.title);
    expect(MockUUIDService.isFakeUUID(notes[4].mod.uuid))
      .toBeTruthy();

    // 2. synchronize items with note in the response, even though the response in the original PUT
    //    was invalid
    var latestModified = now.getTime();
    MockUserSessionService.setLatestModified(latestModified);
    var testNoteUUID = 'd2724771-4469-488c-aabd-9db188672a00';
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200,
        {
          notes: [
          { uuid: testNoteUUID,
            id: testNoteValues.id,
            title: testNoteValues.title,
            created: latestModified-1,
            modified: latestModified-1}
          ]
        });
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();

    // Verify that everything is right with the created note
    expect(notes.length)
      .toBe(5);
    expect(notes[4].mod)
      .toBeUndefined();
    expect(notes[4].uuid)
      .toBe(testNoteUUID);
  });

  it('should handle list offline create, update, delete, undelete', function () {

    // 1. save new item
    var testItemValues = {
      'id': MockUUIDService.getShortIdFromFakeUUID(MockUUIDService.mockFakeUUIDs[0]),
      'title': 'test list'
    };
    var testItem = ItemsService.getNewItem(testItemValues, testOwnerUUID);
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items', testItemValues)
       .respond(404);
    ItemsService.saveItem(testItem);
    $httpBackend.flush();
    var items = ItemsService.getItems(testOwnerUUID);
    expect(items.length)
      .toBe(4);

    // 2. make item into list
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items', testItemValues)
       .respond(404);
    ItemsService.itemToList(testItem);
    $httpBackend.flush();
    expect(items.length)
      .toBe(3);
    var lists = ListsService.getLists(testOwnerUUID);
    expect(lists.length)
      .toBe(5);
    expect(lists[4].trans.title)
      .toBe('test list');

    // 3. update list, this should just replace the previous call because itemToList
    //    is a list update and updating is lastReplaceable
    var updatedTestList = lists[4];
    updatedTestList.trans.description = 'test description';
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items', testItemValues)
       .respond(404);
    ListsService.saveList(updatedTestList);
    $httpBackend.flush();

    expect(lists.length)
      .toBe(5);

    // 4. add new task to the list
    var testTaskValues = {
      id: MockUUIDService.getShortIdFromFakeUUID(MockUUIDService.mockFakeUUIDs[1]),
      title: 'test task',
      relationships: {
        parent: lists[4].trans.uuid
      }
    };
    var testTask = TasksService.getNewTask({title: testTaskValues.title, list: lists[4]}, testOwnerUUID);
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items', testItemValues)
       .respond(404);
    TasksService.saveTask(testTask);
    $httpBackend.flush();

    // 5. delete list offline
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items', testItemValues)
       .respond(404);
    ListsService.deleteList(updatedTestList);
    $httpBackend.flush();

    expect(lists.length)
      .toBe(4);
    expect(updatedTestList.mod.deleted)
      .toBeDefined();
    expect(updatedTestList.mod.modified)
      .toBeUndefined();
    expect(testTask.hist.deletedList)
      .toBe(updatedTestList.trans.uuid);
    expect(testTask.mod.relationships.parent)
      .toBeUndefined();

    // 6. undelete list offline
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items', testItemValues)
       .respond(404);
    ListsService.undeleteList(updatedTestList);
    $httpBackend.flush();
    expect(lists.length)
      .toBe(5);
    expect(lists[4].mod.deleted)
      .toBeUndefined();
    expect(lists[4].mod.modified)
      .toBeUndefined();
    expect(testTask.hist)
      .toBeUndefined();
    expect(testTask.mod.relationships.parent)
      .toBe(updatedTestList.trans.uuid);

    // 7. synchronize items and get back online
    var latestModified = now.getTime();
    MockUserSessionService.setLatestModified(latestModified);
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, '{}');
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items', testItemValues)
        .respond(200, putNewItemResponse);
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/lists/' +
                           putNewItemResponse.uuid,
                           {id: updatedTestList.trans.id,
                            title: updatedTestList.trans.title,
                            description: updatedTestList.trans.description,
                            modified: putNewItemResponse.modified})
        .respond(200, putExistingItemResponse);
    testTaskValues.relationships.parent = putNewItemResponse.uuid;
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tasks',
                           testTaskValues)
        .respond(200, putNewTaskResponse);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();

    // Verify that everything is right with the created item
    expect(items.length)
      .toBe(3);
    expect(lists.length)
      .toBe(5);
    expect(MockUUIDService.isFakeUUID(lists[4].mod.uuid))
      .toBeFalsy();
    expect(lists[4].mod.description)
      .toBe('test description');
    expect(lists[4].description)
      .toBeUndefined();
    expect(testTask.mod.relationships.parent)
      .toBe(lists[4].mod.uuid);

    // 8. delete online
    $httpBackend.expectDELETE('/api/v2/owners/' + testOwnerUUID + '/data/lists/' + updatedTestList.mod.uuid)
       .respond(200, deleteItemResponse);
    ListsService.deleteList(updatedTestList);
    $httpBackend.flush();

    expect(lists.length)
      .toBe(4);
    expect(updatedTestList.mod.deleted)
      .toBe(deleteItemResponse.deleted);
    expect(updatedTestList.mod.modified)
      .toBe(deleteItemResponse.result.modified);

    // 9. undelete online
    $httpBackend.expectPOST('/api/v2/owners/' + testOwnerUUID + '/data/lists/' + updatedTestList.mod.uuid + '/undelete')
       .respond(200, undeleteItemResponse);
    ListsService.undeleteList(updatedTestList);
    $httpBackend.flush();
    expect(lists.length)
      .toBe(5);
    expect(lists[4].mod.deleted)
      .toBeUndefined();
    expect(lists[4].mod.modified)
      .toBe(undeleteItemResponse.modified);

    // 10. synchronize and get new list as it is back,
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, {
          lists: [
            {uuid: lists[4].mod.uuid,
             title: lists[4].mod.title,
             description: lists[4].mod.description,
             created: lists[4].mod.created,
             modified: lists[4].mod.modified}],
          tasks: [
            {uuid: testTask.mod.uuid,
             title: testTask.mod.title,
             relationships: {
              parent: lists[4].mod.uuid,
             },
             created: testTask.mod.created,
             modified: testTask.mod.modified}]
            });
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    expect(lists.length)
      .toBe(5);
    expect(lists[4].mod)
      .toBeUndefined();
    expect(lists[4].modified)
      .toBe(undeleteItemResponse.modified);
    expect(testTask.mod)
      .toBeUndefined();
    expect(testTask.relationships.parent)
      .toBe(lists[4].uuid);
  });

  it('should handle list offline create with no/empty response from server, and then sync', function () {

    var lists = ListsService.getLists(testOwnerUUID);
    expect(lists.length)
      .toBe(4);

    // 1. create list and respond with an empty response
    var testListValues = {
      id: MockUUIDService.getShortIdFromFakeUUID(MockUUIDService.mockFakeUUIDs[0]),
      title: 'test list'
    };
    var testList = ListsService.getNewList(testListValues, testOwnerUUID);
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/lists', testListValues)
       .respond(200, {testing: true});
    ListsService.saveList(testList);
    $httpBackend.flush();
    expect(lists.length)
      .toBe(5);
    expect(lists[4].mod.title)
      .toBe(testListValues.title);
    expect(MockUUIDService.isFakeUUID(lists[4].mod.uuid))
      .toBeTruthy();

    // 2. synchronize items with list in the response, even though the response in the original PUT
    //    was invalid
    var latestModified = now.getTime();
    MockUserSessionService.setLatestModified(latestModified);
    var testNoteUUID = 'd2724771-4469-488c-aabd-9db188672a00';
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200,
        {
          lists: [
          { uuid: testNoteUUID,
            id: testListValues.id,
            title: testListValues.title,
            created: latestModified-1,
            modified: latestModified-1}
          ]
        });
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();

    // Verify that everything is right with the created list
    expect(lists.length)
      .toBe(5);
    expect(lists[4].mod)
      .toBeUndefined();
    expect(lists[4].uuid)
      .toBe(testNoteUUID);
  });

  it('should handle wait for offline update to finish before doing list archive', function () {

    var lists = ListsService.getLists(testOwnerUUID);

    // 1. Create three items to the offline queue
    var testItemValues = {
      'id': MockUUIDService.getShortIdFromFakeUUID(MockUUIDService.mockFakeUUIDs[0]),
      'title': 'test list'
    };
    var testItem = ItemsService.getNewItem(testItemValues, testOwnerUUID);
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items', testItemValues)
       .respond(404);
    ItemsService.saveItem(testItem);
    $httpBackend.flush();

    // 2. make item into list
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items', testItemValues)
       .respond(404);
    ItemsService.itemToList(testItem);
    $httpBackend.flush();

    // 3. update list, this should just replace the previous call because itemToList
    //    is a list update and updating is lastReplaceable
    var updatedTestList = lists[4];
    updatedTestList.trans.description = 'test description';
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items', testItemValues)
       .respond(404);
    ListsService.saveList(updatedTestList);
    $httpBackend.flush();

    // 4. delete online, expect queue to empty
    var latestModified = now.getTime();
    MockUserSessionService.setLatestModified(latestModified);
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items', testItemValues)
        .respond(200, putNewItemResponse);
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/lists/' +
                           putNewItemResponse.uuid,
                           {id: updatedTestList.trans.id,
                            title: updatedTestList.trans.title,
                            description: updatedTestList.trans.description,
                            modified: putNewItemResponse.modified})
        .respond(200, putExistingItemResponse);
    ListsService.archiveList(updatedTestList);
    $httpBackend.flush();

    runs(function() {
      flag = false;
      $httpBackend.expectPOST('/api/v2/owners/' + testOwnerUUID + '/data/lists/' + updatedTestList.mod.uuid  + '/archive')
         .respond(200, archiveListResponse);
      setTimeout(function(){
        $httpBackend.flush();
        expect(lists.length)
          .toBe(4);
        expect(updatedTestList.mod.archived)
          .toBe(archiveListResponse.archived);
        expect(updatedTestList.mod.modified)
          .toBe(archiveListResponse.result.modified);
        flag = true;
      }, 100);
    });
    waitsFor(function(){
      return flag;
    }, 1000);

  });

  it('should handle tag offline create, update, delete, undelete', function () {

    var tags = TagsService.getTags(testOwnerUUID);
    expect(tags.length)
      .toBe(3);

    // 1. create tag
    var testTagValues = {
      id: MockUUIDService.getShortIdFromFakeUUID(MockUUIDService.mockFakeUUIDs[0]),
      title: 'test tag',
      tagType: 'keyword'
    };
    var testTag = TagsService.getNewTag(testTagValues, testOwnerUUID);
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tags', testTagValues)
       .respond(404);
    TagsService.saveTag(testTag);
    $httpBackend.flush();
    expect(tags.length)
      .toBe(4);
    expect(tags[3].mod.title)
      .toBe(testTagValues.title);
    expect(MockUUIDService.isFakeUUID(tags[3].mod.uuid))
      .toBeTruthy();

    // 2. update tag
    testTag.trans.description = 'test description';
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tags', testTagValues)
       .respond(404);
    TagsService.saveTag(testTag);
    $httpBackend.flush();
    expect(tags.length)
      .toBe(4);

    // 3. create note using tag
    var testNoteValues = {
      id: MockUUIDService.getShortIdFromFakeUUID(MockUUIDService.mockFakeUUIDs[1]),
      title: 'test note',
      relationships: {
        tags: [testTag.trans.uuid]
      }
    };
    var testNote = NotesService.getNewNote({title: testNoteValues.title, keywords: [testTag]}, testOwnerUUID);
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tags', testTagValues)
       .respond(404);
    NotesService.saveNote(testNote);
    $httpBackend.flush();

    // 4. delete offline
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tags', testTagValues)
       .respond(404);
    TagsService.deleteTag(testTag);
    $httpBackend.flush();

    expect(tags.length)
      .toBe(3);
    expect(testTag.mod.deleted)
      .toBeDefined();
    expect(testTag.mod.modified)
      .toBeUndefined();
    expect(testNote.hist.deletedTags[0])
      .toBe(testTag.mod.uuid);
    expect(testNote.mod.relationships.tags)
      .toBeUndefined();

    // 5. undelete offline
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tags', testTagValues)
       .respond(404);
    TagsService.undeleteTag(testTag);
    $httpBackend.flush();
    expect(tags.length)
      .toBe(4);
    expect(tags[3].mod.deleted)
      .toBeUndefined();
    expect(tags[3].mod.modified)
      .toBeUndefined();
    expect(testNote.hist)
      .toBeUndefined();
    expect(testNote.mod.relationships.tags[0])
      .toBe(testTag.mod.uuid);

    // 6. synchronize items and get back online
    var latestModified = now.getTime();
    MockUserSessionService.setLatestModified(latestModified);
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, '{}');
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tags', testTagValues)
        .respond(200, putNewItemResponse);
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tags/' +
                           putNewItemResponse.uuid,
                           {id: testTag.trans.id,
                            title: testTag.trans.title,
                            description: testTag.trans.description,
                            tagType: testTag.trans.tagType,
                            modified: putNewItemResponse.modified})
        .respond(200, putExistingItemResponse);
    testNoteValues.relationships.tags[0] = putNewItemResponse.uuid;
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/notes',
                           testNoteValues)
        .respond(200, putNewNoteResponse);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();

    // Verify that everything is right with the created item
    expect(tags.length)
      .toBe(4);
    expect(MockUUIDService.isFakeUUID(tags[3].mod.uuid))
      .toBeFalsy();
    expect(tags[3].mod.description)
      .toBe('test description');
    expect(tags[3].description)
      .toBeUndefined();

    // 5. delete online
    $httpBackend.expectDELETE('/api/v2/owners/' + testOwnerUUID + '/data/tags/' + testTag.mod.uuid)
       .respond(200, deleteItemResponse);
    TagsService.deleteTag(testTag);
    $httpBackend.flush();

    expect(tags.length)
      .toBe(3);
    expect(testTag.mod.deleted)
      .toBe(deleteItemResponse.deleted);
    expect(testTag.mod.modified)
      .toBe(deleteItemResponse.result.modified);

    // 6. undelete online
    $httpBackend.expectPOST('/api/v2/owners/' + testOwnerUUID + '/data/tags/' + testTag.mod.uuid + '/undelete')
       .respond(200, undeleteItemResponse);
    TagsService.undeleteTag(testTag);
    $httpBackend.flush();
    expect(tags[3].mod.deleted)
      .toBeUndefined();
    expect(tags[3].mod.modified)
      .toBe(undeleteItemResponse.modified);

    // 7. synchronize and get new tag as it is back,
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, {
          tags: [
            {uuid: tags[3].mod.uuid,
             title: tags[3].mod.title,
             tagType: tags[3].mod.tagType,
             description: tags[3].mod.description,
             created: tags[3].mod.created,
             modified: tags[3].mod.modified}],
          notes: [{
              uuid: testNote.mod.uuid,
              title: testNote.mod.title,
              relationships: {
                tags: [tags[3].mod.uuid]
              },
              created: testNote.mod.created,
              modified: testNote.mod.modified}]
            });
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    expect(tags.length)
      .toBe(4);
    expect(tags[3].mod)
      .toBeUndefined();
    expect(tags[3].modified)
      .toBe(undeleteItemResponse.modified);
    expect(testNote.mod)
      .toBeUndefined();
    expect(testNote.hist)
      .toBeUndefined();

  });

  it('should handle tag offline create with no/empty response from server, and then sync', function () {

    var tags = TagsService.getTags(testOwnerUUID);
    expect(tags.length)
      .toBe(3);

    // 1. create tag and respond with an empty response
    var testTagValues = {
      id: MockUUIDService.getShortIdFromFakeUUID(MockUUIDService.mockFakeUUIDs[0]),
      title: 'test tag',
      tagType: 'keyword'
    };
    var testTag = TagsService.getNewTag(testTagValues, testOwnerUUID);
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tags', testTagValues)
       .respond(200, {});
    TagsService.saveTag(testTag);
    $httpBackend.flush();
    expect(tags.length)
      .toBe(4);
    expect(tags[3].mod.title)
      .toBe(testTagValues.title);
    expect(MockUUIDService.isFakeUUID(tags[3].mod.uuid))
      .toBeTruthy();

    // 2. create note using tag
    var testNoteValues = {
      id: MockUUIDService.getShortIdFromFakeUUID(MockUUIDService.mockFakeUUIDs[1]),
      title: 'test note',
      relationships: {
        tags: [testTag.trans.uuid]
      }
    };
    var testNote = NotesService.getNewNote({title: testNoteValues.title, keywords: [testTag]}, testOwnerUUID);
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/notes', testNoteValues)
       .respond(404);
    NotesService.saveNote(testNote);
    $httpBackend.flush();

    // 3. synchronize items with tag in the response, even though the response in the original PUT
    //    was invalid
    var latestModified = now.getTime();
    MockUserSessionService.setLatestModified(latestModified);
    var testTagUUID = 'a2724771-4469-488c-aabd-9db188672a00';
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200,
        {
          tags: [
          { uuid: testTagUUID,
            id: testTagValues.id,
            title: testTagValues.title,
            tagType: testTagValues.tagType,
            created: latestModified-1,
            modified: latestModified-1}
          ]
        });
    testNoteValues.relationships.tags[0] = testTagUUID;
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/notes',
                           testNoteValues)
        .respond(200, putNewNoteResponse);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();

    // Verify that everything is right with the created tag
    expect(tags.length)
      .toBe(4);
    expect(tags[3].mod)
      .toBeUndefined();
    expect(tags[3].description)
      .toBeUndefined();
  });

  it('should handle sync with deleted list and tag that are used in put', function () {

    // 1. save new task with shopping list uuid
    var tasks = TasksService.getTasks(testOwnerUUID);
    var shoppingListUUID = 'cf726d03-8fee-4614-8b68-f9f885938a53';
    var homeUUID = '1208d45b-3b8c-463e-88f3-f7ef19ce87cd';
    var shoppingList = ListsService.getListInfo(shoppingListUUID, testOwnerUUID).list;
    var homeContext = TagsService.getTagInfo(homeUUID, testOwnerUUID).tag;
    var orangesTransport = {
      id: MockUUIDService.getShortIdFromFakeUUID(MockUUIDService.mockFakeUUIDs[0]),
      title: 'buy oranges',
      relationships: {
        parent: shoppingListUUID,
        tags: [homeUUID]
      }
    };
    var oranges = TasksService.getNewTask(
                    {title: 'buy oranges',
                     list: shoppingList,
                     context: homeContext}, testOwnerUUID);
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tasks',
                           orangesTransport)
       .respond(404);
    TasksService.saveTask(oranges);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(5);
    expect(tasks[4].uuid)
      .toBeUndefined();
    expect(tasks[4].modified)
      .toBeUndefined();
    expect(tasks[4].mod.relationships.parent)
      .toBe(shoppingListUUID);

    // 2. save existing task with shopping list uuid
    var cleanCloset = TasksService.getTaskInfo('7b53d509-853a-47de-992c-c572a6952629', testOwnerUUID).task;
    cleanCloset.trans.list = shoppingList;
    cleanCloset.trans.context = homeContext;
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tasks',
                           orangesTransport)
       .respond(404);
    TasksService.saveTask(cleanCloset);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(5);
    expect(tasks[0].mod.relationships.parent)
      .toBe(shoppingListUUID);

    // 3. sync online with the list deleted, the list should have been removed from tasks

    var latestModified = now.getTime();
    MockUserSessionService.setLatestModified(latestModified);

    delete orangesTransport.relationships;
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, {
          lists: [
            {uuid: shoppingList.uuid,
             title: shoppingList.title,
             created: shoppingList.created,
             deleted: latestModified,
             modified: latestModified}],
          tags: [
            {uuid: homeContext.uuid,
             title: homeContext.title,
             tagType: homeContext.tagType,
             created: shoppingList.created,
             deleted: latestModified,
             modified: latestModified
            }
          ]});
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tasks',
                           orangesTransport)
        .respond(200, putNewItemResponse);
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' +
                           cleanCloset.trans.uuid,
                           {id: cleanCloset.trans.id,
                            title: cleanCloset.trans.title,
                            modified: cleanCloset.modified})
        .respond(200, putExistingItemResponse);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();

    shoppingList = ListsService.getListInfo(shoppingListUUID, testOwnerUUID).list;
    expect(shoppingList.mod)
      .toBeUndefined();
    expect(shoppingList.deleted)
      .toBe(latestModified);
    expect(cleanCloset.mod.relationships)
      .toBeUndefined();
    expect(oranges.mod.relatiohships)
      .toBeUndefined();
  });


  it('should handle sync with converted list that is used in put', function () {

    // 1. save existing task with shopping list uuid
    var tasks = TasksService.getTasks(testOwnerUUID);
    var lists = ListsService.getLists(testOwnerUUID);
    var shoppingListUUID = 'cf726d03-8fee-4614-8b68-f9f885938a53';
    var shoppingList = ListsService.getListInfo(shoppingListUUID, testOwnerUUID).list;

    var cleanCloset = TasksService.getTaskInfo('7b53d509-853a-47de-992c-c572a6952629', testOwnerUUID).task;
    cleanCloset.trans.list = shoppingList;
    var cleanClosetTransport = {
      title: cleanCloset.title,
      relationships: {
        parent: shoppingListUUID
      },
      modified: cleanCloset.modified
    };
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' + cleanCloset.uuid,
                           cleanClosetTransport)
       .respond(404);
    TasksService.saveTask(cleanCloset);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(4);
    expect(tasks[0].mod.relationships.parent)
      .toBe(shoppingListUUID);

    // 2. Update the list as well
    shoppingList = ListsService.getListInfo(shoppingListUUID, testOwnerUUID).list;
    shoppingList.trans.description = 'test description';
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' + cleanCloset.uuid,
       cleanClosetTransport)
       .respond(404);
    ListsService.saveList(shoppingList);
    $httpBackend.flush();
    expect(lists.length)
      .toBe(4);
    expect(lists[3].mod.description)
      .toBe('test description');

    // 3. sync online with the list converted, the list should have been removed from the task and
    //    the put should have been deleted
    var latestModified = now.getTime();
    MockUserSessionService.setLatestModified(latestModified);

    delete cleanClosetTransport.relationships;
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID + '/data?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, {
          notes: [
            {uuid: shoppingList.uuid,
             title: shoppingList.title,
             created: shoppingList.created,
             modified: latestModified}]
           });
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' +
                           cleanCloset.trans.uuid,
                           cleanClosetTransport)
        .respond(200, putExistingItemResponse);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();

    shoppingList = NotesService.getNoteInfo(shoppingListUUID, testOwnerUUID).note;
    expect(shoppingList.modified)
      .toBe(latestModified);
    expect(cleanCloset.mod.relationships)
      .toBeUndefined();
    expect(ListsService.getListInfo(shoppingListUUID, testOwnerUUID))
      .toBeUndefined();
  });

  it('should handle item, note and list converted to task in different client', function () {
    var latestModified = Date.now() - 10000;
    MockUserSessionService.latestModified = latestModified;

    // 1. process an update response for one of the items

    var itemsResponseWithItemToTask = {
      tasks: [
        {'uuid': 'f7724771-4469-488c-aabd-9db188672a9b',
         'created': 1391278509634,
         'modified': latestModified + 1000,
         'title': 'should I start yoga?'
        }
      ]
    };
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID +
                           '/data?modified=' + latestModified +
                           '&deleted=true&archived=true&completed=true').respond(
                           200, itemsResponseWithItemToTask);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    latestModified = itemsResponseWithItemToTask.tasks[0].modified;

    expect(ItemsService.getItems(testOwnerUUID).length)
      .toBe(2);
    expect(TasksService.getTasks(testOwnerUUID).length)
      .toBe(5);


    var itemsResponseWithNoteToTask = {
      tasks: [
        {
          'uuid': 'b2cd149a-a287-40a0-86d9-0a14462f22d8',
          'created': 1391627811075,
          'modified': latestModified + 1000,
          'title': 'booth number A23',
          'relationships': {
            'parent': 'bf726d03-8fee-4614-8b68-f9f885938a51'
          }
        }
      ]
    };
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID +
                           '/data?modified=' + latestModified +
                           '&deleted=true&archived=true&completed=true').respond(
                           200, itemsResponseWithNoteToTask);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    latestModified = itemsResponseWithNoteToTask.tasks[0].modified;
    expect(NotesService.getNotes(testOwnerUUID).length)
      .toBe(3);
    expect(TasksService.getTasks(testOwnerUUID).length)
      .toBe(6);

    var itemsResponseWithListToTask = {
      tasks: [
        {
          'uuid': 'cf726d03-8fee-4614-8b68-f9f885938a53',
          'created': 1390915600947,
          'modified': 1390915600947,
          'title': 'shopping list',
        }
      ]
    };
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID +
                           '/data?modified=' + latestModified +
                           '&deleted=true&archived=true&completed=true').respond(
                           200, itemsResponseWithListToTask);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();

    expect(ListsService.getLists(testOwnerUUID).length)
      .toBe(3);
    expect(TasksService.getTasks(testOwnerUUID).length)
      .toBe(7);

  });

  it('should handle item, task and list converted to note in different client', function () {

    var latestModified = Date.now() - 10000;
    MockUserSessionService.latestModified = latestModified;

    // 1. process an update response for one of the items

    var itemsResponseWithItemToNote = {
      notes: [
        {'uuid': 'f7724771-4469-488c-aabd-9db188672a9b',
         'created': 1391278509634,
         'modified': latestModified + 1000,
         'title': 'should I start yoga?'
        }
      ]
    };
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID +
                           '/data?modified=' + latestModified +
                           '&deleted=true&archived=true&completed=true').respond(
                           200, itemsResponseWithItemToNote);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    latestModified = itemsResponseWithItemToNote.notes[0].modified;

    expect(ItemsService.getItems(testOwnerUUID).length)
      .toBe(2);
    expect(NotesService.getNotes(testOwnerUUID).length)
      .toBe(5);

    var itemsResponseWithTaskToNote = {
      notes: [
        {
          'uuid': '7b53d509-853a-47de-992c-c572a6952629',
          'created': 1391278509698,
          'modified': 1391278509698,
          'completed': 1391278509917,
          'title': 'clean closet'
        }
      ]
    };
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID +
                           '/data?modified=' + latestModified +
                           '&deleted=true&archived=true&completed=true').respond(
                           200, itemsResponseWithTaskToNote);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    latestModified = itemsResponseWithTaskToNote.notes[0].modified;
    expect(TasksService.getTasks(testOwnerUUID).length)
      .toBe(3);
    expect(NotesService.getNotes(testOwnerUUID).length)
      .toBe(6);

    var itemsResponseWithListToNote = {
      notes: [
        {
          'uuid': 'cf726d03-8fee-4614-8b68-f9f885938a53',
          'created': 1390915600947,
          'modified': 1390915600947,
          'title': 'shopping list',
        }
      ]
    };
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID +
                           '/data?modified=' + latestModified +
                           '&deleted=true&archived=true&completed=true').respond(
                           200, itemsResponseWithListToNote);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    expect(ListsService.getLists(testOwnerUUID).length)
      .toBe(3);
    expect(NotesService.getNotes(testOwnerUUID).length)
      .toBe(7);
  });

  it('should handle item, task and note converted to list in different client', function () {

    var latestModified = Date.now() - 10000;
    MockUserSessionService.latestModified = latestModified;

    // 1. process an update response for one of the items

    var itemsResponseWithItemToList = {
      lists: [
        {'uuid': 'f7724771-4469-488c-aabd-9db188672a9b',
         'created': 1391278509634,
         'modified': latestModified + 1000,
         'title': 'should I start yoga?'
        }
      ]
    };
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID +
                           '/data?modified=' + latestModified +
                           '&deleted=true&archived=true&completed=true').respond(
                           200, itemsResponseWithItemToList);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    latestModified = itemsResponseWithItemToList.lists[0].modified;
    expect(ItemsService.getItems(testOwnerUUID).length)
      .toBe(2);
    expect(ListsService.getLists(testOwnerUUID).length)
      .toBe(5);

    var itemsResponseWithTaskToList = {
      lists: [
        {
          'uuid': '7b53d509-853a-47de-992c-c572a6952629',
          'created': 1391278509698,
          'modified': 1391278509698,
          'title': 'clean closet'
        }
      ]
    };
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID +
                           '/data?modified=' + latestModified +
                           '&deleted=true&archived=true&completed=true').respond(
                           200, itemsResponseWithTaskToList);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    latestModified = itemsResponseWithTaskToList.lists[0].modified;
    expect(TasksService.getTasks(testOwnerUUID).length)
      .toBe(3);
    expect(ListsService.getLists(testOwnerUUID).length)
      .toBe(6);

    var itemsResponseWithNoteToList = {
      lists: [
        {
          'uuid': 'b2cd149a-a287-40a0-86d9-0a14462f22d8',
          'created': 1391627811075,
          'modified': latestModified + 1000,
          'title': 'booth number A23',
          'relationships': {
            'parent': 'bf726d03-8fee-4614-8b68-f9f885938a51'
          }
        }
      ]
    };
    $httpBackend.expectGET('/api/v2/owners/' + testOwnerUUID +
                           '/data?modified=' + latestModified +
                           '&deleted=true&archived=true&completed=true').respond(
                           200, itemsResponseWithNoteToList);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    latestModified = itemsResponseWithNoteToList.lists[0].modified;
    expect(NotesService.getNotes(testOwnerUUID).length)
      .toBe(3);
    expect(ListsService.getLists(testOwnerUUID).length)
      .toBe(7);
  });

  it('should handle swap token when offline', function () {
    MockUserSessionService.authenticated = true;
    MockUserSessionService.authenticateValid = false;
    MockUserSessionService.authenticateReplaceable = true;

    // Mock authenticate callback
    var authenticateCallback = function(){
      MockUserSessionService.authenticateValid = true;
    };
    BackendClientService.registerPrimaryPostResultCallback(authenticateCallback);

    var testItemValues = {
      'id': MockUUIDService.getShortIdFromFakeUUID(MockUUIDService.mockFakeUUIDs[0]),
      'title': 'test note'
    };
    var testItem = ItemsService.getNewItem(testItemValues, testOwnerUUID);
    $httpBackend.expectPOST('/api/v2/users/authenticate', {rememberMe: true})
       .respond(200, authenticateResponse);
    $httpBackend.expectPUT('/api/v2/owners/' + testOwnerUUID + '/data/items', testItemValues)
        .respond(200, putNewItemResponse);
    ItemsService.saveItem(testItem);
    $httpBackend.flush();
    var items = ItemsService.getItems(testOwnerUUID);
    expect(items.length)
      .toBe(4);
  });

  it('should convert task, note and list offline to each other', function () {
    var tasks = TasksService.getTasks(testOwnerUUID);
    var notes = NotesService.getNotes(testOwnerUUID);
    var lists = ListsService.getLists(testOwnerUUID);

    var cleanClosetUUID = '7b53d509-853a-47de-992c-c572a6952629';
    var cleanCloset = TasksService.getTaskInfo(cleanClosetUUID, testOwnerUUID).task;
    var cleanClosetTransport = {title: cleanCloset.trans.title,
                                modified: cleanCloset.trans.modified};
    $httpBackend.expectPOST('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' +
                             cleanCloset.trans.uuid + '/convert_to_note',
                            cleanClosetTransport)
       .respond(404);
    ConvertService.finishTaskToNoteConvert(cleanCloset, testOwnerUUID);
    $httpBackend.flush();
    cleanCloset = NotesService.getNoteInfo(cleanClosetUUID, testOwnerUUID).note;
    expect(tasks.length)
      .toBe(3);
    expect(notes.length)
      .toBe(5);
    expect(lists.length)
      .toBe(4);
    expect(cleanCloset.hist.convert.task.completed)
      .toBeDefined();

    $httpBackend.expectPOST('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' +
                            cleanCloset.trans.uuid + '/convert_to_note',
                            cleanClosetTransport)
       .respond(404);
    ConvertService.finishNoteToListConvert(cleanCloset, testOwnerUUID);
    $httpBackend.flush();
    cleanCloset = ListsService.getListInfo(cleanClosetUUID, testOwnerUUID).list;
    expect(tasks.length)
      .toBe(3);
    expect(notes.length)
      .toBe(4);
    expect(lists.length)
      .toBe(5);
    expect(cleanCloset.hist.convert.task.completed)
      .toBeDefined();

    $httpBackend.expectPOST('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' +
                            cleanCloset.trans.uuid + '/convert_to_note',
                            cleanClosetTransport)
       .respond(404);
    ConvertService.finishListToTaskConvert(cleanCloset, testOwnerUUID);
    $httpBackend.flush();
    cleanCloset = TasksService.getTaskInfo(cleanClosetUUID, testOwnerUUID).task;
    expect(tasks.length)
      .toBe(4);
    expect(notes.length)
      .toBe(4);
    expect(lists.length)
      .toBe(4);
    expect(cleanCloset.hist)
      .toBeUndefined();

    $httpBackend.expectPOST('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' +
                            cleanCloset.trans.uuid + '/convert_to_note',
                            cleanClosetTransport)
       .respond(404);
    ConvertService.finishTaskToListConvert(cleanCloset, testOwnerUUID);
    $httpBackend.flush();
    cleanCloset = ListsService.getListInfo(cleanClosetUUID, testOwnerUUID).list;
    expect(tasks.length)
      .toBe(3);
    expect(notes.length)
      .toBe(4);
    expect(lists.length)
      .toBe(5);
    expect(cleanCloset.hist.convert.task.completed)
      .toBeDefined();

    $httpBackend.expectPOST('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' +
                            cleanCloset.trans.uuid + '/convert_to_note',
                            cleanClosetTransport)
       .respond(404);
    ConvertService.finishListToNoteConvert(cleanCloset, testOwnerUUID);
    $httpBackend.flush();
    cleanCloset = NotesService.getNoteInfo(cleanClosetUUID, testOwnerUUID).note;
    expect(tasks.length)
      .toBe(3);
    expect(notes.length)
      .toBe(5);
    expect(lists.length)
      .toBe(4);
    expect(cleanCloset.hist.convert.task.completed)
      .toBeDefined();

    $httpBackend.expectPOST('/api/v2/owners/' + testOwnerUUID + '/data/tasks/' +
                            cleanCloset.trans.uuid + '/convert_to_note',
                            cleanClosetTransport)
       .respond(404);
    ConvertService.finishNoteToTaskConvert(cleanCloset, testOwnerUUID);
    $httpBackend.flush();
    cleanCloset = TasksService.getTaskInfo(cleanClosetUUID, testOwnerUUID).task;
    expect(tasks.length)
      .toBe(4);
    expect(notes.length)
      .toBe(4);
    expect(lists.length)
      .toBe(4);

    expect(cleanCloset.mod)
      .toBeDefined();
    expect(cleanCloset.hist)
      .toBeUndefined();
  });

});
