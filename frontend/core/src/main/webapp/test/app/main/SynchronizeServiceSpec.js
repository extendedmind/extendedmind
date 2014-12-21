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

 /* global module, describe, inject, beforeEach, afterEach, it, expect, spyOn, getJSONFixture */
'use strict';

describe('SynchronizeService', function() {
  var flag;

  // INJECTS

  var $httpBackend;
  var SynchronizeService, ItemsService, BackendClientService, HttpClientService,
      ListsService, TagsService, TasksService, NotesService, UUIDService, AuthenticationService;

  // MOCKS

  var now = new Date();
  var putNewItemResponse = getJSONFixture('putItemResponse.json');
  putNewItemResponse.created = putNewItemResponse.modified = now.getTime();
  var putExistingItemResponse = getJSONFixture('putExistingItemResponse.json');
  putExistingItemResponse.modified = now.getTime();
  var deleteItemResponse = getJSONFixture('deleteItemResponse.json');
  deleteItemResponse.result.modified = now.getTime();
  var undeleteItemResponse = getJSONFixture('undeleteItemResponse.json');
  undeleteItemResponse.modified = now.getTime();
  var completeTaskResponse = getJSONFixture('completeTaskResponse.json');
  completeTaskResponse.result.modified = now.getTime();
  var uncompleteTaskResponse = getJSONFixture('uncompleteTaskResponse.json');
  uncompleteTaskResponse.modified = now.getTime();
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
    isOfflineEnabled: function () {
      return true;
    },
    isPersistentDataLoaded: function() {
      return this.persistentDataLoaded;
    },
    setPersistentDataLoaded: function(value) {
      this.persistentDataLoaded = value;
    },
    registerNofifyOwnerCallback: function(callback, id){
      this.callbacks[id] = callback;
    }
  };

  // SETUP / TEARDOWN

  beforeEach(function() {
    module('em.appTest');

    module('em.base', function ($provide){
      $provide.value('UserSessionService', MockUserSessionService);
    });

    inject(function (_$httpBackend_, _SynchronizeService_, _ItemsService_, _BackendClientService_,
                     _HttpClientService_, _ListsService_, _TagsService_,
                     _TasksService_, _NotesService_, _UUIDService_, _AuthenticationService_) {
      $httpBackend = _$httpBackend_;
      SynchronizeService = _SynchronizeService_;
      ItemsService = _ItemsService_;
      BackendClientService = _BackendClientService_;
      HttpClientService = _HttpClientService_;
      ListsService = _ListsService_;
      TagsService = _TagsService_;
      TasksService = _TasksService_;
      NotesService = _NotesService_;
      UUIDService = _UUIDService_;
      AuthenticationService = _AuthenticationService_;

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
              'reminder': '10:00',
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
              'link': 'http://ext.md'
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
      $httpBackend.expectGET('/api/' + testOwnerUUID + '/items')
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
    $httpBackend.expectGET('/api/' + testOwnerUUID +
                           '/items?modified=' + MockUserSessionService.latestModified +
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

    $httpBackend.expectGET('/api/' + testOwnerUUID +
                           '/items?modified=' + MockUserSessionService.getLatestModified() +
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
            .trans.context).toBe('1208d45b-3b8c-463e-88f3-f7ef19ce87cd');
  });

  it('should syncronize with empty result', function () {
    MockUserSessionService.setLatestModified(undefined);
    $httpBackend.expectGET('/api/' + testOwnerUUID + '/items')
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
      'title': 'test item'
    };
    var testItem = ItemsService.getNewItem(testItemValues, testOwnerUUID);
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item', testItemValues)
       .respond(404);
    ItemsService.saveItem(testItem, testOwnerUUID);
    $httpBackend.flush();

    // Should go to the end of the array with a fake UUID
    var items = ItemsService.getItems(testOwnerUUID);
    expect(items.length)
      .toBe(4);
    expect(UUIDService.isFakeUUID(items[3].trans.uuid))
      .toBeTruthy();

    // 2. update item

    testItem.trans.description = 'test description';
    // We're expecting to get another try at creating the item
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item',
                           testItemValues)
       .respond(404);
    ItemsService.saveItem(testItem, testOwnerUUID);
    $httpBackend.flush();
    expect(items.length)
      .toBe(4);
    expect(UUIDService.isFakeUUID(items[3].mod.uuid))
      .toBeTruthy();

    // 3. delete item
    // We're still expecting to get another try at creating the first
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item', testItemValues)
       .respond(404);
    ItemsService.deleteItem(testItem, testOwnerUUID);
    $httpBackend.flush();
    expect(items.length)
      .toBe(3);

    // 4. undelete item
    // We're again, still expecting to get another try at creating the first
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item', testItemValues)
       .respond(404);
    ItemsService.undeleteItem(testItem, testOwnerUUID);
    $httpBackend.flush();
    expect(items.length)
      .toBe(4);

    // 5. synchronize items and get back online, we're expecting the delete and undelete to cancel each other

    var latestModified = now.getTime();
    MockUserSessionService.setLatestModified(latestModified);
    $httpBackend.expectGET('/api/' + testOwnerUUID + '/items?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, '{}');
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item', testItemValues)
        .respond(200, putNewItemResponse);
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item/' + putNewItemResponse.uuid,
                           {title: testItem.trans.title,
                            description: testItem.trans.description,
                            modified: putNewItemResponse.modified})
        .respond(200, putExistingItemResponse);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();

    // Verify that everything is right with the created item
    expect(items.length)
      .toBe(4);
    expect(UUIDService.isFakeUUID(items[3].mod.uuid))
      .toBeFalsy();
    expect(items[3].mod.description)
      .toBe('test description');

    // 6. delete online
    $httpBackend.expectDELETE('/api/' + testOwnerUUID + '/item/' +
                              testItem.mod.uuid)
       .respond(200, deleteItemResponse);
    ItemsService.deleteItem(testItem, testOwnerUUID);
    $httpBackend.flush();
    expect(items.length)
      .toBe(3);
    expect(testItem.mod.deleted)
      .toBe(deleteItemResponse.deleted);
    expect(testItem.mod.modified)
      .toBe(deleteItemResponse.result.modified);

    // 7. undelete online
    $httpBackend.expectPOST('/api/' + testOwnerUUID + '/item/' + testItem.mod.uuid +
                            '/undelete')
       .respond(200, undeleteItemResponse);
    ItemsService.undeleteItem(testItem, testOwnerUUID);
    $httpBackend.flush();
    expect(items.length)
      .toBe(4);
    expect(items[3].mod.deleted)
      .toBeUndefined();
    expect(items[3].mod.modified)
      .toBe(undeleteItemResponse.modified);

    // 8. synchronize and get new item as it is back,
    $httpBackend.expectGET('/api/' + testOwnerUUID + '/items?modified=' +
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

    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item/' + yoga.trans.uuid,
                          yogaValues)
       .respond(404);
    ItemsService.saveItem(yoga, testOwnerUUID);
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
    //    offline saved item: the newer is still executed
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
    $httpBackend.expectGET('/api/' + testOwnerUUID + '/items?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, conflictYogaResponse);
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item/' + yoga.trans.uuid,
                           yogaValues)
        .respond(200, putNewItemResponse);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    MockUserSessionService.setLatestModified(newLatestModified);

    // 3. save existing offline again
    yoga.trans.description = 'just do it, or not';
    yogaValues.description = yoga.trans.description;
    yogaValues.modified = yoga.trans.modified;
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item/' + yoga.uuid,
                           yogaValues)
       .respond(404);
    ItemsService.saveItem(yoga, testOwnerUUID);
    $httpBackend.flush();
    expect(items.length)
      .toBe(3);

    // 4. synchronize with conflicting item that is newer, expect PUT to have been deleted
    var veryLatestModified = Date.now() + 1;
    conflictYogaResponse.items[0].modified = veryLatestModified;
    $httpBackend.expectGET('/api/' + testOwnerUUID + '/items?modified=' +
                            newLatestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, conflictYogaResponse);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    expect(items.length)
      .toBe(3);

  });

  it('should handle task offline create, update, delete', function () {

    // 1. save new item
    var testItemValues = {
      'title': 'test task'
    };
    var testItem = ItemsService.getNewItem(testItemValues, testOwnerUUID);
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item', testItemValues)
       .respond(404);
    ItemsService.saveItem(testItem, testOwnerUUID);
    $httpBackend.flush();
    var items = ItemsService.getItems(testOwnerUUID);
    expect(items.length)
      .toBe(4);

    // 2. make item into task
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item', testItemValues)
       .respond(404);
    ItemsService.itemToTask(testItem, testOwnerUUID);
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
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item', testItemValues)
       .respond(404);
    TasksService.saveTask(updatedTestTask, testOwnerUUID);
    $httpBackend.flush();

    expect(tasks.length)
      .toBe(5);

    // 4. delete task
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item', testItemValues)
       .respond(404);
    TasksService.deleteTask(updatedTestTask, testOwnerUUID);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(4);

    // 5. undelete task
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item', testItemValues)
       .respond(404);
    TasksService.undeleteTask(updatedTestTask, testOwnerUUID);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(5);

    // 6. synchronize items and get back online, we're expecting the delete and undelete to cancel each other
    var latestModified = now.getTime();
    MockUserSessionService.setLatestModified(latestModified);
    $httpBackend.expectGET('/api/' + testOwnerUUID + '/items?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, '{}');
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item', testItemValues)
        .respond(200, putNewItemResponse);
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/task/' +
                           putNewItemResponse.uuid,
                           {title: updatedTestTask.trans.title,
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
    expect(UUIDService.isFakeUUID(tasks[4].mod.uuid))
      .toBeFalsy();
    expect(tasks[4].mod.description)
      .toBe('test description');
    expect(tasks[4].description)
      .toBeUndefined();

    // 7. delete online
    $httpBackend.expectDELETE('/api/' + testOwnerUUID + '/task/' + updatedTestTask.mod.uuid)
       .respond(200, deleteItemResponse);
    TasksService.deleteTask(updatedTestTask, testOwnerUUID);
    $httpBackend.flush();

    expect(tasks.length)
      .toBe(4);
    expect(updatedTestTask.mod.deleted)
      .toBe(deleteItemResponse.deleted);
    expect(updatedTestTask.mod.modified)
      .toBe(deleteItemResponse.result.modified);

    // 8. undelete online
    $httpBackend.expectPOST('/api/' + testOwnerUUID + '/task/' + updatedTestTask.mod.uuid + '/undelete')
       .respond(200, undeleteItemResponse);
    TasksService.undeleteTask(updatedTestTask, testOwnerUUID);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(5);
    expect(tasks[4].mod.deleted)
      .toBeUndefined();
    expect(tasks[4].mod.modified)
      .toBe(undeleteItemResponse.modified);

    // 9. synchronize and get new task as it is back,
    $httpBackend.expectGET('/api/' + testOwnerUUID + '/items?modified=' +
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
      'title': 'test task'
    };
    var testTask = TasksService.getNewTask(testTaskValues, testOwnerUUID);
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/task', testTaskValues)
       .respond(404);
    TasksService.saveTask(testTask, testOwnerUUID);
    $httpBackend.flush();
    var tasks = TasksService.getTasks(testOwnerUUID);
    expect(tasks.length)
      .toBe(5);

    // 2. complete it

    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/task', testTaskValues)
       .respond(404);
    TasksService.completeTask(testTask, testOwnerUUID);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(5);
    expect(testTask.mod.completed).toBeDefined();

    // 3. uncomplete it

    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/task', testTaskValues)
       .respond(404);
    TasksService.uncompleteTask(testTask, testOwnerUUID);
    $httpBackend.flush();

    expect(tasks.length)
      .toBe(5);
    expect(testTask.completed).toBeUndefined();

    // 4. complete it again but go online, expect only one complete

    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/task', testTaskValues)
       .respond(200, putNewItemResponse);
    $httpBackend.expectPOST('/api/' + testOwnerUUID + '/task/' + putNewItemResponse.uuid + '/complete')
       .respond(200, completeTaskResponse);
    TasksService.completeTask(testTask, testOwnerUUID);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(5);
    expect(testTask.mod.completed)
      .toBe(completeTaskResponse.completed);
    expect(testTask.mod.modified)
      .toBe(completeTaskResponse.result.modified);

    // 5. uncomplete online

    $httpBackend.expectPOST('/api/' + testOwnerUUID + '/task/' + putNewItemResponse.uuid + '/uncomplete')
       .respond(200, uncompleteTaskResponse);
    TasksService.uncompleteTask(testTask, testOwnerUUID);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(5);
    expect(testTask.mod.modified)
      .toBe(uncompleteTaskResponse.modified);

    // 6. complete offline but get conflicting completed response from the server: expect that double
    //    complete has been removed from queue
    var buyTickets = TasksService.getTaskInfo('1a1ce3aa-f476-43c4-845e-af59a9a33760', testOwnerUUID).task;
    $httpBackend.expectPOST('/api/' + testOwnerUUID + '/task/' + buyTickets.uuid + '/complete')
       .respond(404);
    TasksService.completeTask(buyTickets, testOwnerUUID);
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

    $httpBackend.expectGET('/api/' + testOwnerUUID + '/items?modified=' +
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

    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/task/' + cleanCloset.trans.uuid, cleanClosetTransport)
       .respond(404);
    TasksService.saveTask(cleanCloset, testOwnerUUID);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(4);

    // 2. synchronize items and get back online with conflicting response, that's older than the
    //    offline saved one: the newer is still executed
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
    $httpBackend.expectGET('/api/' + testOwnerUUID + '/items?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, conflictCleanClosetResponse);
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/task/' + cleanCloset.trans.uuid,
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
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/task/' + cleanCloset.trans.uuid,
                           cleanClosetTransport)
       .respond(404);
    TasksService.saveTask(cleanCloset, testOwnerUUID);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(4);

    // 4. synchronize with conflicting task that is newer, expect PUT to have been deleted
    var veryLatestModified = Date.now() + 1;
    conflictCleanClosetResponse.tasks[0].modified = veryLatestModified;
    conflictCleanClosetResponse.tasks[0].title = cleanCloset.trans.title;

    $httpBackend.expectGET('/api/' + testOwnerUUID + '/items?modified=' +
                            newLatestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, conflictCleanClosetResponse);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(4);

    expect(tasks[0].title)
      .toBe('clean my closet');
    expect(tasks[0].modified)
      .toBe(veryLatestModified);
    expect(tasks[0].mod)
      .toBeUndefined();
    expect(tasks[0].trans.modified)
      .toBe(veryLatestModified);
  });

  it('should handle note offline create, update, delete', function () {

    // 1. save new item
    var testItemValues = {
      'title': 'test note'
    };
    var testItem = ItemsService.getNewItem(testItemValues, testOwnerUUID);
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item', testItemValues)
       .respond(404);
    ItemsService.saveItem(testItem, testOwnerUUID);
    $httpBackend.flush();
    var items = ItemsService.getItems(testOwnerUUID);
    expect(items.length)
      .toBe(4);

    // 2. make item into note
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item', testItemValues)
       .respond(404);
    ItemsService.itemToNote(testItem, testOwnerUUID);
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

    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item', testItemValues)
       .respond(404);
    NotesService.saveNote(updatedTestNote, testOwnerUUID);
    $httpBackend.flush();

    expect(notes.length)
      .toBe(5);

    // 4. delete note
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item', testItemValues)
       .respond(404);
    NotesService.deleteNote(updatedTestNote, testOwnerUUID);
    $httpBackend.flush();
    expect(notes.length)
      .toBe(4);

    // 5. undelete note
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item', testItemValues)
       .respond(404);
    NotesService.undeleteNote(updatedTestNote, testOwnerUUID);
    $httpBackend.flush();
    expect(notes.length)
      .toBe(5);

    // 6. synchronize items and get back online, we're expecting the delete and undelete to cancel each other
    var latestModified = now.getTime();
    MockUserSessionService.setLatestModified(latestModified);
    $httpBackend.expectGET('/api/' + testOwnerUUID + '/items?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, '{}');
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item', testItemValues)
        .respond(200, putNewItemResponse);
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/note/' + putNewItemResponse.uuid,
                           {title: updatedTestNote.trans.title,
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
    expect(UUIDService.isFakeUUID(notes[4].uuid))
      .toBeFalsy();
    expect(notes[4].mod.description)
      .toBeDefined();

    // 7. delete online
    $httpBackend.expectDELETE('/api/' + testOwnerUUID + '/note/' + updatedTestNote.mod.uuid)
       .respond(200, deleteItemResponse);
    NotesService.deleteNote(updatedTestNote, testOwnerUUID);
    $httpBackend.flush();
    expect(notes.length)
      .toBe(4);
    expect(updatedTestNote.mod.deleted)
      .toBe(deleteItemResponse.deleted);
    expect(updatedTestNote.mod.modified)
      .toBe(deleteItemResponse.result.modified);

    // 8. undelete online
    $httpBackend.expectPOST('/api/' + testOwnerUUID + '/note/' + updatedTestNote.mod.uuid + '/undelete')
       .respond(200, undeleteItemResponse);
    NotesService.undeleteNote(updatedTestNote, testOwnerUUID);
    $httpBackend.flush();
    expect(notes.length)
      .toBe(5);
    expect(notes[4].mod.deleted)
      .toBeUndefined();
    expect(notes[4].mod.modified)
      .toBe(undeleteItemResponse.modified);

    // 9. synchronize and get new note as it is back
    $httpBackend.expectGET('/api/' + testOwnerUUID + '/items?modified=' +
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
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/note/' + aboutContexts.uuid,
                          { title: aboutContexts.trans.title,
                            content: aboutContexts.trans.content,
                            modified: aboutContexts.trans.modified})
       .respond(404);
    NotesService.saveNote(aboutContexts, testOwnerUUID);
    $httpBackend.flush();
    var notes = NotesService.getNotes(testOwnerUUID);
    expect(notes.length)
      .toBe(4);

    // 2. synchronize items and get back online with conflicting response, that's older than the
    //    offline saved one: the newer is still executed
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
    $httpBackend.expectGET('/api/' + testOwnerUUID + '/items?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, conflictAboutContextsResponse);
    var aboutContextsTransport = {
      title: aboutContexts.trans.title,
      content: aboutContexts.trans.content + '\n\n>>> conflicting changes >>>\n\n' +
               conflictAboutContextsResponse.notes[0].content,
      modified: newLatestModified};
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/note/' + aboutContexts.uuid,
                           aboutContextsTransport)
        .respond(200, {modified: newLatestModified + 1});
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    MockUserSessionService.setLatestModified(newLatestModified);

    var aboutContextsConflictingContent = NotesService.getNoteInfo('a1cd149a-a287-40a0-86d9-0a14462f22d6',
                                                      testOwnerUUID).note;
    expect(aboutContextsConflictingContent.mod.content).toContain('conflicting changes');

    // 3. save existing offline again
    aboutContextsConflictingContent.trans.title = aboutContextsOriginalTitle;
    aboutContextsTransport.title = aboutContextsOriginalTitle;
    aboutContextsTransport.modified = newLatestModified + 1;
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/note/' + aboutContexts.uuid,
                           aboutContextsTransport)
       .respond(404);
    NotesService.saveNote(aboutContextsConflictingContent, testOwnerUUID);
    $httpBackend.flush();
    expect(notes.length)
      .toBe(4);

    // 4. synchronize with conflicting note that is newer but with same content, expect PUT to be deleted
    var veryLatestModified = Date.now() + 1;
    conflictAboutContextsResponse.notes[0].modified = veryLatestModified;
    conflictAboutContextsResponse.notes[0].title = aboutContextsConflictingContent.trans.title;
    conflictAboutContextsResponse.notes[0].content = aboutContextsConflictingContent.trans.content;
    $httpBackend.expectGET('/api/' + testOwnerUUID + '/items?modified=' +
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

  it('should handle list offline create, update', function () {

    // 1. save new item
    var testItemValues = {
      'title': 'test list'
    };
    var testItem = ItemsService.getNewItem(testItemValues, testOwnerUUID);
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item', testItemValues)
       .respond(404);
    ItemsService.saveItem(testItem, testOwnerUUID);
    $httpBackend.flush();
    var items = ItemsService.getItems(testOwnerUUID);
    expect(items.length)
      .toBe(4);

    // 2. make item into list
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item', testItemValues)
       .respond(404);
    ItemsService.itemToList(testItem, testOwnerUUID);
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
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item', testItemValues)
       .respond(404);
    ListsService.saveList(updatedTestList, testOwnerUUID);
    $httpBackend.flush();

    expect(lists.length)
      .toBe(5);

    // 4. synchronize items and get back online
    var latestModified = now.getTime();
    MockUserSessionService.setLatestModified(latestModified);
    $httpBackend.expectGET('/api/' + testOwnerUUID + '/items?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, '{}');
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item', testItemValues)
        .respond(200, putNewItemResponse);
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/list/' +
                           putNewItemResponse.uuid,
                           {title: updatedTestList.trans.title,
                            description: updatedTestList.trans.description,
                            modified: putNewItemResponse.modified})
        .respond(200, putExistingItemResponse);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();

    // Verify that everything is right with the created item
    expect(items.length)
      .toBe(3);
    expect(lists.length)
      .toBe(5);
    expect(UUIDService.isFakeUUID(lists[4].mod.uuid))
      .toBeFalsy();
    expect(lists[4].mod.description)
      .toBe('test description');
    expect(lists[4].description)
      .toBeUndefined();

    // 5. delete online
    $httpBackend.expectDELETE('/api/' + testOwnerUUID + '/list/' + updatedTestList.mod.uuid)
       .respond(200, deleteItemResponse);
    ListsService.deleteList(updatedTestList, testOwnerUUID);
    $httpBackend.flush();

    expect(lists.length)
      .toBe(4);
    expect(updatedTestList.deleted)
      .toBe(deleteItemResponse.deleted);
    expect(updatedTestList.modified)
      .toBe(deleteItemResponse.result.modified);

    // 6. undelete online
    $httpBackend.expectPOST('/api/' + testOwnerUUID + '/list/' + updatedTestList.mod.uuid + '/undelete')
       .respond(200, undeleteItemResponse);
    ListsService.undeleteList(updatedTestList, testOwnerUUID);
    $httpBackend.flush();
    expect(lists.length)
      .toBe(5);
    expect(lists[4].deleted)
      .toBeUndefined();
    expect(lists[4].modified)
      .toBe(undeleteItemResponse.modified);

    // 7. synchronize and get new list as it is back,
    $httpBackend.expectGET('/api/' + testOwnerUUID + '/items?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, {
          lists: [
            {uuid: lists[4].mod.uuid,
             title: lists[4].mod.title,
             description: lists[4].mod.description,
             created: lists[4].mod.created,
             modified: lists[4].mod.modified}]
          });
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    expect(lists.length)
      .toBe(5);
    expect(lists[4].mod)
      .toBeUndefined();
    expect(lists[4].modified)
      .toBe(undeleteItemResponse.modified);
  });

  it('should handle wait for offline update to finish before doing list delete and undelete', function () {

    var lists = ListsService.getLists(testOwnerUUID);

    // 1. Create three items to the offline queue
    var testItemValues = {
      'title': 'test list'
    };
    var testItem = ItemsService.getNewItem(testItemValues, testOwnerUUID);
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item', testItemValues)
       .respond(404);
    ItemsService.saveItem(testItem, testOwnerUUID);
    $httpBackend.flush();

    // 2. make item into list
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item', testItemValues)
       .respond(404);
    ItemsService.itemToList(testItem, testOwnerUUID);
    $httpBackend.flush();

    // 3. update list, this should just replace the previous call because itemToList
    //    is a list update and updating is lastReplaceable
    var updatedTestList = lists[4];
    updatedTestList.trans.description = 'test description';
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item', testItemValues)
       .respond(404);
    ListsService.saveList(updatedTestList, testOwnerUUID);
    $httpBackend.flush();

    // 4. delete online, expect queue to empty
    var latestModified = now.getTime();
    MockUserSessionService.setLatestModified(latestModified);
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item', testItemValues)
        .respond(200, putNewItemResponse);
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/list/' +
                           putNewItemResponse.uuid,
                           {title: updatedTestList.trans.title,
                            description: updatedTestList.trans.description,
                            modified: putNewItemResponse.modified})
        .respond(200, putExistingItemResponse);
    ListsService.deleteList(updatedTestList, testOwnerUUID);
    $httpBackend.flush();

    runs(function() {
      flag = false;
      $httpBackend.expectDELETE('/api/' + testOwnerUUID + '/list/' + updatedTestList.mod.uuid)
         .respond(200, deleteItemResponse);
      setTimeout(function(){
        $httpBackend.flush();
        expect(lists.length)
          .toBe(4);
        expect(updatedTestList.deleted)
          .toBe(deleteItemResponse.deleted);
        expect(updatedTestList.modified)
          .toBe(deleteItemResponse.result.modified);
        flag = true;
      }, 100);
    });
    waitsFor(function(){
      return flag;
    }, 1000);

    runs(function() {
      flag = false;

      // 5. Create item to the offline queue
      var testItemValues2 = {
        'title': 'test item 2'
      };
      var testItem2 = ItemsService.getNewItem(testItemValues2, testOwnerUUID);
      $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item', testItemValues2)
         .respond(404);
      ItemsService.saveItem(testItem2, testOwnerUUID);
      $httpBackend.flush();

      // 6. undelete online, expect queue to empty
      var latestModified = now.getTime();
      MockUserSessionService.setLatestModified(latestModified);
      $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item', testItemValues2)
          .respond(200, putNewItemResponse);
      ListsService.undeleteList(updatedTestList, testOwnerUUID);
      $httpBackend.flush();

      $httpBackend.expectPOST('/api/' + testOwnerUUID + '/list/' + updatedTestList.mod.uuid + '/undelete')
         .respond(200, undeleteItemResponse);
      setTimeout(function(){
        $httpBackend.flush();
        expect(lists.length)
          .toBe(5);
        expect(updatedTestList.deleted)
          .toBeUndefined();
        expect(updatedTestList.modified)
          .toBe(undeleteItemResponse.modified);
        flag = true;
      }, 100);
    });
    waitsFor(function(){
      return flag;
    }, 1000);

  });

  it('should handle tag offline create, update', function () {

    var tags = TagsService.getTags(testOwnerUUID);
    expect(tags.length)
      .toBe(3);

    // 1. create tag
    var testTagValues = {
      title: 'test tag',
      tagType: 'keyword'
    };
    var testTag = TagsService.getNewTag(testTagValues, testOwnerUUID);
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/tag', testTagValues)
       .respond(404);
    TagsService.saveTag(testTag, testOwnerUUID);
    $httpBackend.flush();
    expect(tags.length)
      .toBe(4);
    expect(tags[3].mod.title)
      .toBe(testTagValues.title);
    expect(UUIDService.isFakeUUID(tags[3].mod.uuid))
      .toBeTruthy();

    // 2. update tag
    testTag.trans.description = 'test description';
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/tag', testTagValues)
       .respond(404);
    TagsService.saveTag(testTag, testOwnerUUID);
    $httpBackend.flush();
    expect(tags.length)
      .toBe(4);

    // 3. synchronize items and get back online
    var latestModified = now.getTime();
    MockUserSessionService.setLatestModified(latestModified);
    $httpBackend.expectGET('/api/' + testOwnerUUID + '/items?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, '{}');
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/tag', testTagValues)
        .respond(200, putNewItemResponse);
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/tag/' +
                           putNewItemResponse.uuid,
                           {title: testTag.trans.title,
                            description: testTag.trans.description,
                            tagType: testTag.trans.tagType,
                            modified: putNewItemResponse.modified})
        .respond(200, putExistingItemResponse);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();

    // Verify that everything is right with the created item
    expect(tags.length)
      .toBe(4);
    expect(UUIDService.isFakeUUID(tags[3].mod.uuid))
      .toBeFalsy();
    expect(tags[3].mod.description)
      .toBe('test description');
    expect(tags[3].description)
      .toBeUndefined();

    // 4. delete online
    $httpBackend.expectDELETE('/api/' + testOwnerUUID + '/tag/' + testTag.mod.uuid)
       .respond(200, deleteItemResponse);
    TagsService.deleteTag(testTag, testOwnerUUID);
    $httpBackend.flush();

    expect(tags.length)
      .toBe(3);
    expect(testTag.deleted)
      .toBe(deleteItemResponse.deleted);
    expect(testTag.modified)
      .toBe(deleteItemResponse.result.modified);

    // 5. undelete online
    $httpBackend.expectPOST('/api/' + testOwnerUUID + '/tag/' + testTag.mod.uuid + '/undelete')
       .respond(200, undeleteItemResponse);
    TagsService.undeleteTag(testTag, testOwnerUUID);
    $httpBackend.flush();
    expect(tags.length)
      .toBe(4);
    expect(tags[3].deleted)
      .toBeUndefined();
    expect(tags[3].modified)
      .toBe(undeleteItemResponse.modified);

    // 6. synchronize and get new tag as it is back,
    $httpBackend.expectGET('/api/' + testOwnerUUID + '/items?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, {
          tags: [
            {uuid: tags[3].mod.uuid,
             title: tags[3].mod.title,
             tagType: tags[3].mod.tagType,
             description: tags[3].mod.description,
             created: tags[3].mod.created,
             modified: tags[3].mod.modified}]
          });
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    expect(tags.length)
      .toBe(4);
    expect(tags[3].mod)
      .toBeUndefined();
    expect(tags[3].modified)
      .toBe(undeleteItemResponse.modified);
  });


  it('should handle sync with deleted list and tag that are used in put', function () {

    // 1. save new task with shopping list uuid
    var tasks = TasksService.getTasks(testOwnerUUID);
    var shoppingListUUID = 'cf726d03-8fee-4614-8b68-f9f885938a53';
    var homeUUID = '1208d45b-3b8c-463e-88f3-f7ef19ce87cd';
    var orangesTransport = {
      title: 'buy oranges',
      relationships: {
        parent: shoppingListUUID,
        tags: [homeUUID]
      }
    };
    var oranges = TasksService.getNewTask({title: 'buy oranges', list: shoppingListUUID,
                                           context: homeUUID}, testOwnerUUID);
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/task',
                           orangesTransport)
       .respond(404);
    TasksService.saveTask(oranges, testOwnerUUID);
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
    cleanCloset.trans.list = shoppingListUUID;
    cleanCloset.trans.context = homeUUID;
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/task',
                           orangesTransport)
       .respond(404);
    TasksService.saveTask(cleanCloset, testOwnerUUID);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(5);
    expect(tasks[0].mod.relationships.parent)
      .toBe(shoppingListUUID);

    // 3. sync online with the list deleted, the list should have been removed from tasks

    var latestModified = now.getTime();
    MockUserSessionService.setLatestModified(latestModified);

    var shoppingList = ListsService.getListInfo(shoppingListUUID, testOwnerUUID).list;
    var homeContext = TagsService.getTagInfo(homeUUID, testOwnerUUID).tag;

    delete orangesTransport.relationships;
    $httpBackend.expectGET('/api/' + testOwnerUUID + '/items?modified=' +
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
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/task',
                           orangesTransport)
        .respond(200, putNewItemResponse);
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/task/' +
                           cleanCloset.trans.uuid,
                           {title: cleanCloset.trans.title,
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

    var cleanCloset = TasksService.getTaskInfo('7b53d509-853a-47de-992c-c572a6952629', testOwnerUUID).task;
    cleanCloset.trans.list = shoppingListUUID;
    var cleanClosetTransport = {
      title: cleanCloset.title,
      relationships: {
        parent: shoppingListUUID
      },
      modified: cleanCloset.modified
    }
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/task/' + cleanCloset.uuid,
                           cleanClosetTransport)
       .respond(404);
    TasksService.saveTask(cleanCloset, testOwnerUUID);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(4);
    expect(tasks[0].mod.relationships.parent)
      .toBe(shoppingListUUID);

    // 2. Update the list as well
    var shoppingList = ListsService.getListInfo(shoppingListUUID, testOwnerUUID).list;
    shoppingList.trans.description = 'test description';
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/task/' + cleanCloset.uuid,
       cleanClosetTransport)
       .respond(404);
    ListsService.saveList(shoppingList, testOwnerUUID);
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
    $httpBackend.expectGET('/api/' + testOwnerUUID + '/items?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, {
          notes: [
            {uuid: shoppingList.uuid,
             title: shoppingList.title,
             created: shoppingList.created,
             modified: latestModified}]
           });
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/task/' +
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
    $httpBackend.expectGET('/api/' + testOwnerUUID +
                           '/items?modified=' + latestModified +
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
    $httpBackend.expectGET('/api/' + testOwnerUUID +
                           '/items?modified=' + latestModified +
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
    $httpBackend.expectGET('/api/' + testOwnerUUID +
                           '/items?modified=' + latestModified +
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
    $httpBackend.expectGET('/api/' + testOwnerUUID +
                           '/items?modified=' + latestModified +
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
    $httpBackend.expectGET('/api/' + testOwnerUUID +
                           '/items?modified=' + latestModified +
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
    $httpBackend.expectGET('/api/' + testOwnerUUID +
                           '/items?modified=' + latestModified +
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
    $httpBackend.expectGET('/api/' + testOwnerUUID +
                           '/items?modified=' + latestModified +
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
    $httpBackend.expectGET('/api/' + testOwnerUUID +
                           '/items?modified=' + latestModified +
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
    $httpBackend.expectGET('/api/' + testOwnerUUID +
                           '/items?modified=' + latestModified +
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
      'title': 'test note'
    };
    var testItem = ItemsService.getNewItem(testItemValues, testOwnerUUID);
    $httpBackend.expectPOST('/api/authenticate', {rememberMe: true})
       .respond(200, authenticateResponse);
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item', testItemValues)
        .respond(200, putNewItemResponse);
    ItemsService.saveItem(testItem, testOwnerUUID);
    $httpBackend.flush();
    var items = ItemsService.getItems(testOwnerUUID);
    expect(items.length)
      .toBe(4);
  });

});
