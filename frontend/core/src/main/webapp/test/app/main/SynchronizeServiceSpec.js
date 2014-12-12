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
    offlineEnabled: false,
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
      return '6be16f46-7b35-4b2d-b875-e13d19681e77';
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
      return this.offlineEnabled;
    }
  };

  // SETUP / TEARDOWN

  beforeEach(function() {
    module('em.appTest');

    module('em.base', function ($provide){
      $provide.value('UserSessionService', MockUserSessionService);
    });

    inject(function (_$httpBackend_, _SynchronizeService_, _ItemsService_, _BackendClientService_, _HttpClientService_,
                    _ListsService_, _TagsService_, _TasksService_, _NotesService_, _UUIDService_, _AuthenticationService_) {
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
              'uuid': '7a612ca2-7de0-45ad-a758-d949df37f51e',
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

      // Syncronize with test data
      $httpBackend.expectGET('/api/' + MockUserSessionService.getActiveUUID() + '/items')
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
    MockUserSessionService.offlineEnabled = false;
    MockUserSessionService.authenticated = true;
    MockUserSessionService.authenticateValid = true;
    MockUserSessionService.authenticateReplaceable = true;

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  // TESTS

  it('should syncronize new item', function () {
    var newLatestModified = now.getTime();
    var modifiedGetItemsResponse = {
      'items': [{
        'uuid': 'e7724771-4469-488c-aabd-9db188672a9b',
        'modified': newLatestModified,
        'title': 'test item'
      }]
    };

    $httpBackend.expectGET('/api/' + MockUserSessionService.getActiveUUID() +
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
    $httpBackend.expectGET('/api/' + MockUserSessionService.getActiveUUID() + '/items')
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
    MockUserSessionService.offlineEnabled = true;

    // 1. save new item

    var testItemValues = {
      'title': 'test item'
    }
    var testItem = ItemsService.getNewItem(testItemValues, testOwnerUUID);
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/item', testItemValues)
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

    var updatedTestItemValues = {
      'uuid': testItem.uuid,
      'title': testItem.title,
      'description': 'test description'
    }
    var updatedTestItem = ItemsService.getNewItem(updatedTestItemValues, testOwnerUUID);
    // We're expecting to get another try at creating the item
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/item', updatedTestItemValues)
       .respond(404);
    ItemsService.saveItem(updatedTestItem, testOwnerUUID);
    $httpBackend.flush();
    expect(items.length)
      .toBe(4);

    // 3. delete item
    // We're still expecting to get another try at creating the first
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/item', testItem)
       .respond(404);
    ItemsService.deleteItem(updatedTestItem, testOwnerUUID);
    $httpBackend.flush();
    expect(items.length)
      .toBe(3);

    // 4. undelete item
    // We're again, still expecting to get another try at creating the first
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/item', testItem)
       .respond(404);
    ItemsService.undeleteItem(updatedTestItem, testOwnerUUID);
    $httpBackend.flush();
    expect(items.length)
      .toBe(4);

    // 5. synchronize items and get back online, we're expecting the delete and undelete to cancel each other

    var latestModified = now.getTime();
    MockUserSessionService.setLatestModified(latestModified);
    $httpBackend.expectGET('/api/' + MockUserSessionService.getActiveUUID() + '/items?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, '{}');
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/item', testItemValues)
        .respond(200, putNewItemResponse);
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/item/' + putNewItemResponse.uuid,
                           updatedTestItemValues)
        .respond(200, putExistingItemResponse);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();

    // Verify that everything is right with the created item
    expect(items.length)
      .toBe(4);
    expect(UUIDService.isFakeUUID(items[3].uuid))
      .toBeFalsy();
    expect(items[1].description)
      .toBeDefined();

    // 6. delete online
    $httpBackend.expectDELETE('/api/' + MockUserSessionService.getActiveUUID() + '/item/' + updatedTestItem.uuid)
       .respond(200, deleteItemResponse);
    ItemsService.deleteItem(updatedTestItem, testOwnerUUID);
    $httpBackend.flush();
    expect(items.length)
      .toBe(3);
    expect(updatedTestItem.deleted)
      .toBe(deleteItemResponse.deleted);
    expect(updatedTestItem.modified)
      .toBe(deleteItemResponse.result.modified);

    // 7. undelete online
    $httpBackend.expectPOST('/api/' + MockUserSessionService.getActiveUUID() + '/item/' + updatedTestItem.uuid + '/undelete')
       .respond(200, undeleteItemResponse);
    ItemsService.undeleteItem(updatedTestItem, testOwnerUUID);
    $httpBackend.flush();
    expect(items.length)
      .toBe(4);
    expect(items[1].deleted)
      .toBeUndefined();
    expect(items[1].modified)
      .toBe(undeleteItemResponse.modified);
  });

  it('should handle item offline update with conflicting sync from server', function () {
    MockUserSessionService.offlineEnabled = true;

    // 1. save existing item
    var yoga = ItemsService.getItemInfo('f7724771-4469-488c-aabd-9db188672a9b', testOwnerUUID).item;
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/item/' + yoga.uuid, yoga)
       .respond(404);
    ItemsService.saveItem(yoga, testOwnerUUID);
    $httpBackend.flush();
    var items = ItemsService.getItems(testOwnerUUID);
    expect(items.length)
      .toBe(3);

    // 2. synchronize items and get back online with conflicting yoga response, that's older than the
    //    offline saved item: the newer is still executed
    var latestModified = now.getTime()-100000;
    MockUserSessionService.setLatestModified(latestModified);

    var newLatestModified = latestModified + 1000;
    var conflictYogaResponse = {
      items: [{
        'uuid': 'f7724771-4469-488c-aabd-9db188672a9b',
        'created': 1391278509634,
        'modified': newLatestModified,
        'title': 'I start yoga'
      }]
    }
    $httpBackend.expectGET('/api/' + MockUserSessionService.getActiveUUID() + '/items?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, conflictYogaResponse);
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/item/' + yoga.uuid, yoga)
        .respond(200, putNewItemResponse);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    MockUserSessionService.setLatestModified(newLatestModified);

    // 3. save existing offline again
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/item/' + yoga.uuid, yoga)
       .respond(404);
    ItemsService.saveItem(yoga, testOwnerUUID);
    $httpBackend.flush();
    expect(items.length)
      .toBe(3);

    // 4. synchronize with conflicting item that is newer, expect PUT to have been deleted
    var veryLatestModified = Date.now() + 1;
    conflictYogaResponse.items[0].modified = veryLatestModified;
    $httpBackend.expectGET('/api/' + MockUserSessionService.getActiveUUID() + '/items?modified=' +
                            newLatestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, conflictYogaResponse);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    expect(items.length)
      .toBe(3);

  });

  it('should handle task offline create, update, delete', function () {
    MockUserSessionService.offlineEnabled = true;

    // 1. save new item
    var testItem = {
      'title': 'test task'
    };
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/item', testItem)
       .respond(404);
    ItemsService.saveItem(testItem, testOwnerUUID);
    $httpBackend.flush();
    var items = ItemsService.getItems(testOwnerUUID);
    expect(items.length)
      .toBe(4);

    // 2. make item into task
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/item', testItem)
       .respond(404);
    ItemsService.itemToTask(testItem, testOwnerUUID);
    $httpBackend.flush();
    expect(items.length)
      .toBe(3);
    var tasks = TasksService.getTasks(testOwnerUUID);
    expect(tasks.length)
      .toBe(5);

    // 3. update task
    var updatedTestTask = {
      uuid: testItem.uuid,
      title: testItem.title,
      trans: {
        description: 'test description'
      }
    };
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/item', testItem)
       .respond(404);
    TasksService.saveTask(updatedTestTask, testOwnerUUID);
    $httpBackend.flush();

    expect(tasks.length)
      .toBe(5);

    // 4. delete task
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/item', testItem)
       .respond(404);
    TasksService.deleteTask(updatedTestTask, testOwnerUUID);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(4);

    // 5. undelete task
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/item', testItem)
       .respond(404);
    TasksService.undeleteTask(updatedTestTask, testOwnerUUID);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(5);

    // 6. synchronize items and get back online, we're expecting the delete and undelete to cancel each other
    var latestModified = now.getTime();
    MockUserSessionService.setLatestModified(latestModified);
    $httpBackend.expectGET('/api/' + MockUserSessionService.getActiveUUID() + '/items?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, '{}');
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/item', testItem)
        .respond(200, putNewItemResponse);
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/task/' + putNewItemResponse.uuid,
                           testItem)
        .respond(200, putExistingItemResponse);
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/task/' + putNewItemResponse.uuid,
                           updatedTestTask)
        .respond(200, putExistingItemResponse);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();

    // Verify that everything is right with the created item
    expect(items.length)
      .toBe(3);
    expect(tasks.length)
      .toBe(5);
    expect(UUIDService.isFakeUUID(tasks[3].uuid))
      .toBeFalsy();
    expect(tasks[1].description)
      .toBeDefined();

    // 7. delete online
    $httpBackend.expectDELETE('/api/' + MockUserSessionService.getActiveUUID() + '/task/' + updatedTestTask.uuid)
       .respond(200, deleteItemResponse);
    TasksService.deleteTask(updatedTestTask, testOwnerUUID);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(4);
    expect(updatedTestTask.deleted)
      .toBe(deleteItemResponse.deleted);
    expect(updatedTestTask.modified)
      .toBe(deleteItemResponse.result.modified);

    // 8. undelete online
    $httpBackend.expectPOST('/api/' + MockUserSessionService.getActiveUUID() + '/task/' + updatedTestTask.uuid + '/undelete')
       .respond(200, undeleteItemResponse);
    TasksService.undeleteTask(updatedTestTask, testOwnerUUID);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(5);
    expect(tasks[1].deleted)
      .toBeUndefined();
    expect(tasks[1].modified)
      .toBe(undeleteItemResponse.modified);
  });

  it('should handle task offline complete, uncomplete', function () {
    MockUserSessionService.offlineEnabled = true;

    // 1. save new task
    var testTask = {
      'title': 'test task'
    };
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/task', testTask)
       .respond(404);
    TasksService.saveTask(testTask, testOwnerUUID);
    $httpBackend.flush();
    var tasks = TasksService.getTasks(testOwnerUUID);
    expect(tasks.length)
      .toBe(5);

    // 2. complete it

    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/task', testTask)
       .respond(404);
    TasksService.completeTask(testTask, testOwnerUUID);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(5);
    expect(testTask.completed).toBeDefined();

    // 3. uncomplete it

    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/task', testTask)
       .respond(404);
    TasksService.uncompleteTask(testTask, testOwnerUUID);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(5);
    expect(testTask.completed).toBeUndefined();

    // 4. complete it again but go online, expect only one complete

    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/task', testTask)
       .respond(200, putNewItemResponse);
    $httpBackend.expectPOST('/api/' + MockUserSessionService.getActiveUUID() + '/task/' + putNewItemResponse.uuid + '/complete')
       .respond(200, completeTaskResponse);
    TasksService.completeTask(testTask, testOwnerUUID);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(5);
    expect(testTask.completed)
      .toBe(completeTaskResponse.completed);
    expect(testTask.modified)
      .toBe(completeTaskResponse.result.modified);

    // 5. uncomplete online

    $httpBackend.expectPOST('/api/' + MockUserSessionService.getActiveUUID() + '/task/' + putNewItemResponse.uuid + '/uncomplete')
       .respond(200, uncompleteTaskResponse);
    TasksService.uncompleteTask(testTask, testOwnerUUID);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(5);
    expect(testTask.modified)
      .toBe(uncompleteTaskResponse.modified);

    // 6. complete offline but get conflicting completed response from the server: expect that double
    //    complete has been removed from queue
    var cleanCloset = TasksService.getTaskInfo('7b53d509-853a-47de-992c-c572a6952629', testOwnerUUID).task;
    $httpBackend.expectPOST('/api/' + MockUserSessionService.getActiveUUID() + '/task/' + cleanCloset.uuid + '/complete')
       .respond(404);
    TasksService.completeTask(cleanCloset, testOwnerUUID);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(5);
    expect(cleanCloset.completed).toBeDefined();

    var latestModified = now.getTime()-100000;
    MockUserSessionService.setLatestModified(latestModified);

    var conflictModified = now.getTime() + 1;
    var conflictingCleanCloset = {
      'uuid': '7b53d509-853a-47de-992c-c572a6952629',
      'created': 1391278509698,
      'modified': conflictModified,
      'completed': conflictModified,
      'title': 'clean closet'
    };

    $httpBackend.expectGET('/api/' + MockUserSessionService.getActiveUUID() + '/items?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, {tasks: [conflictingCleanCloset]});
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();

    expect(TasksService.getTaskInfo(conflictingCleanCloset.uuid, testOwnerUUID).task.completed)
      .toBe(conflictModified);
  });

  it('should handle task offline update with conflicting sync from server', function () {
    MockUserSessionService.offlineEnabled = true;

    // 1. save existing task
    var cleanCloset = TasksService.getTaskInfo('7b53d509-853a-47de-992c-c572a6952629', testOwnerUUID).task;
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/task/' + cleanCloset.uuid, cleanCloset)
       .respond(404);
    TasksService.saveTask(cleanCloset, testOwnerUUID);
    $httpBackend.flush();
    var tasks = TasksService.getTasks(testOwnerUUID);
    expect(tasks.length)
      .toBe(4);

    // 2. synchronize items and get back online with conflicting response, that's older than the
    //    offline saved one: the newer is still executed
    var latestModified = now.getTime()-100000;
    MockUserSessionService.setLatestModified(latestModified);

    var newLatestModified = latestModified + 1000;
    var conflictCleanClosetResponse = {
      tasks: [{
        'uuid': '7b53d509-853a-47de-992c-c572a6952629',
        'created': 1391278509698,
        'modified': newLatestModified,
        'completed': 1391278509917,
        'title': 'clean closet!'
      }]
    }
    $httpBackend.expectGET('/api/' + MockUserSessionService.getActiveUUID() + '/items?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, conflictCleanClosetResponse);
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/task/' + cleanCloset.uuid, cleanCloset)
        .respond(200, putNewItemResponse);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    MockUserSessionService.setLatestModified(newLatestModified);

    // 3. save existing offline again
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/task/' + cleanCloset.uuid, cleanCloset)
       .respond(404);
    TasksService.saveTask(cleanCloset, testOwnerUUID);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(4);

    // 4. synchronize with conflicting task that is newer, expect PUT to have been deleted
    var veryLatestModified = Date.now() + 1;
    conflictCleanClosetResponse.tasks[0].modified = veryLatestModified;
    $httpBackend.expectGET('/api/' + MockUserSessionService.getActiveUUID() + '/items?modified=' +
                            newLatestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, conflictCleanClosetResponse);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    expect(tasks.length)
      .toBe(4);
  });

  it('should handle note offline create, update, delete', function () {
    MockUserSessionService.offlineEnabled = true;

    // 1. save new item
    var testItem = {
      'title': 'test note'
    };
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/item', testItem)
       .respond(404);
    ItemsService.saveItem(testItem, testOwnerUUID);
    $httpBackend.flush();
    var items = ItemsService.getItems(testOwnerUUID);
    expect(items.length)
      .toBe(4);

    // 2. make item into note
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/item', testItem)
       .respond(404);
    ItemsService.itemToNote(testItem, testOwnerUUID);
    $httpBackend.flush();
    expect(items.length)
      .toBe(3);
    var notes = NotesService.getNotes(testOwnerUUID);
    expect(notes.length)
      .toBe(5);

    // 3. update note
    var updatedTestNote = {
      'uuid': testItem.uuid,
      'title': testItem.title,
      'description': 'test description'
    };
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/item', testItem)
       .respond(404);
    NotesService.saveNote(updatedTestNote, testOwnerUUID);
    $httpBackend.flush();

    expect(notes.length)
      .toBe(5);

    // 4. delete note
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/item', testItem)
       .respond(404);
    NotesService.deleteNote(updatedTestNote, testOwnerUUID);
    $httpBackend.flush();
    expect(notes.length)
      .toBe(4);

    // 5. undelete note
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/item', testItem)
       .respond(404);
    NotesService.undeleteNote(updatedTestNote, testOwnerUUID);
    $httpBackend.flush();
    expect(notes.length)
      .toBe(5);

    // 6. synchronize items and get back online, we're expecting the delete and undelete to cancel each other
    var latestModified = now.getTime();
    MockUserSessionService.setLatestModified(latestModified);
    $httpBackend.expectGET('/api/' + MockUserSessionService.getActiveUUID() + '/items?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, '{}');
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/item', testItem)
        .respond(200, putNewItemResponse);
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/note/' + putNewItemResponse.uuid,
                           testItem)
        .respond(200, putExistingItemResponse);
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/note/' + putNewItemResponse.uuid,
                           updatedTestNote)
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
    expect(notes[4].description)
      .toBeDefined();

    // 7. delete online
    $httpBackend.expectDELETE('/api/' + MockUserSessionService.getActiveUUID() + '/note/' + updatedTestNote.uuid)
       .respond(200, deleteItemResponse);
    NotesService.deleteNote(updatedTestNote, testOwnerUUID);
    $httpBackend.flush();
    expect(notes.length)
      .toBe(4);
    expect(updatedTestNote.deleted)
      .toBe(deleteItemResponse.deleted);
    expect(updatedTestNote.modified)
      .toBe(deleteItemResponse.result.modified);

    // 8. undelete online
    $httpBackend.expectPOST('/api/' + MockUserSessionService.getActiveUUID() + '/note/' + updatedTestNote.uuid + '/undelete')
       .respond(200, undeleteItemResponse);
    NotesService.undeleteNote(updatedTestNote, testOwnerUUID);
    $httpBackend.flush();
    expect(notes.length)
      .toBe(5);
    expect(notes[4].deleted)
      .toBeUndefined();
    expect(notes[4].modified)
      .toBe(undeleteItemResponse.modified);
  });


  it('should handle note offline update with conflicting sync from server', function () {
    MockUserSessionService.offlineEnabled = true;

    // 1. save existing note
    var aboutContexts = NotesService.getNoteInfo('a1cd149a-a287-40a0-86d9-0a14462f22d6', testOwnerUUID).note;
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/note/' + aboutContexts.uuid, aboutContexts)
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
    }
    $httpBackend.expectGET('/api/' + MockUserSessionService.getActiveUUID() + '/items?modified=' +
                            latestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, conflictAboutContextsResponse);
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/note/' + aboutContexts.uuid,
                           aboutContexts)
        .respond(200, putNewItemResponse);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    MockUserSessionService.setLatestModified(newLatestModified);

    var aboutContextsConflictingContent = NotesService.getNoteInfo('a1cd149a-a287-40a0-86d9-0a14462f22d6',
                                                      testOwnerUUID).note;
    expect(aboutContextsConflictingContent.content).toContain('conflicting changes');

    // 3. save existing offline again
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/note/' + aboutContexts.uuid,
                           aboutContextsConflictingContent)
       .respond(404);
    NotesService.saveNote(aboutContextsConflictingContent, testOwnerUUID);
    $httpBackend.flush();
    expect(notes.length)
      .toBe(4);

    // 4. synchronize with conflicting note that is newer but with same content, expect PUT to be deleted
    var veryLatestModified = Date.now() + 1;
    conflictAboutContextsResponse.notes[0].modified = veryLatestModified;
    conflictAboutContextsResponse.notes[0].content = aboutContextsConflictingContent.content;
    $httpBackend.expectGET('/api/' + MockUserSessionService.getActiveUUID() + '/items?modified=' +
                            newLatestModified + '&deleted=true&archived=true&completed=true')
        .respond(200, conflictAboutContextsResponse);
    SynchronizeService.synchronize(testOwnerUUID);
    $httpBackend.flush();
    expect(notes.length)
      .toBe(4);
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
    SynchronizeService.synchronize(MockUserSessionService.getActiveUUID()).then(function(){
      expect(ItemsService.getItems(testOwnerUUID).length)
        .toBe(2);
      expect(TasksService.getTasks(testOwnerUUID).length)
        .toBe(5);
    });
    $httpBackend.expectGET('/api/' + MockUserSessionService.getActiveUUID() +
                           '/items?modified=' + latestModified +
                           '&deleted=true&archived=true&completed=true').respond(
                           200, itemsResponseWithItemToTask);
    latestModified = itemsResponseWithItemToTask.tasks[0].modified;
    $httpBackend.flush();

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
    SynchronizeService.synchronize(MockUserSessionService.getActiveUUID()).then(function(){
      expect(NotesService.getNotes(testOwnerUUID).length)
        .toBe(3);
      expect(TasksService.getTasks(testOwnerUUID).length)
        .toBe(6);
    });
    $httpBackend.expectGET('/api/' + MockUserSessionService.getActiveUUID() +
                           '/items?modified=' + latestModified +
                           '&deleted=true&archived=true&completed=true').respond(
                           200, itemsResponseWithNoteToTask);
    latestModified = itemsResponseWithNoteToTask.tasks[0].modified;
    $httpBackend.flush();

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
    SynchronizeService.synchronize(MockUserSessionService.getActiveUUID()).then(function(){
      expect(ListsService.getLists(testOwnerUUID).length)
        .toBe(3);
      expect(TasksService.getTasks(testOwnerUUID).length)
        .toBe(7);
    });
    $httpBackend.expectGET('/api/' + MockUserSessionService.getActiveUUID() +
                           '/items?modified=' + latestModified +
                           '&deleted=true&archived=true&completed=true').respond(
                           200, itemsResponseWithListToTask);
    $httpBackend.flush();
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
    SynchronizeService.synchronize(MockUserSessionService.getActiveUUID()).then(function(){
      expect(ItemsService.getItems(testOwnerUUID).length)
        .toBe(2);
      expect(NotesService.getNotes(testOwnerUUID).length)
        .toBe(5);
    });
    $httpBackend.expectGET('/api/' + MockUserSessionService.getActiveUUID() +
                           '/items?modified=' + latestModified +
                           '&deleted=true&archived=true&completed=true').respond(
                           200, itemsResponseWithItemToNote);
    latestModified = itemsResponseWithItemToNote.notes[0].modified;
    $httpBackend.flush();

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
    SynchronizeService.synchronize(MockUserSessionService.getActiveUUID()).then(function(){
      expect(TasksService.getTasks(testOwnerUUID).length)
        .toBe(3);
      expect(NotesService.getNotes(testOwnerUUID).length)
        .toBe(6);
    });
    $httpBackend.expectGET('/api/' + MockUserSessionService.getActiveUUID() +
                           '/items?modified=' + latestModified +
                           '&deleted=true&archived=true&completed=true').respond(
                           200, itemsResponseWithTaskToNote);
    latestModified = itemsResponseWithTaskToNote.notes[0].modified;
    $httpBackend.flush();

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
    SynchronizeService.synchronize(MockUserSessionService.getActiveUUID()).then(function(){
      expect(ListsService.getLists(testOwnerUUID).length)
        .toBe(3);
      expect(NotesService.getNotes(testOwnerUUID).length)
        .toBe(7);
    });
    $httpBackend.expectGET('/api/' + MockUserSessionService.getActiveUUID() +
                           '/items?modified=' + latestModified +
                           '&deleted=true&archived=true&completed=true').respond(
                           200, itemsResponseWithListToNote);
    $httpBackend.flush();
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
    SynchronizeService.synchronize(MockUserSessionService.getActiveUUID()).then(function(){
      expect(ItemsService.getItems(testOwnerUUID).length)
        .toBe(2);
      expect(ListsService.getLists(testOwnerUUID).length)
        .toBe(5);
    });
    $httpBackend.expectGET('/api/' + MockUserSessionService.getActiveUUID() +
                           '/items?modified=' + latestModified +
                           '&deleted=true&archived=true&completed=true').respond(
                           200, itemsResponseWithItemToList);
    latestModified = itemsResponseWithItemToList.lists[0].modified;
    $httpBackend.flush();

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
    SynchronizeService.synchronize(MockUserSessionService.getActiveUUID()).then(function(){
      expect(TasksService.getTasks(testOwnerUUID).length)
        .toBe(3);
      expect(ListsService.getLists(testOwnerUUID).length)
        .toBe(6);
    });
    $httpBackend.expectGET('/api/' + MockUserSessionService.getActiveUUID() +
                           '/items?modified=' + latestModified +
                           '&deleted=true&archived=true&completed=true').respond(
                           200, itemsResponseWithTaskToList);
    latestModified = itemsResponseWithTaskToList.lists[0].modified;
    $httpBackend.flush();

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
    SynchronizeService.synchronize(MockUserSessionService.getActiveUUID()).then(function(){
      expect(NotesService.getNotes(testOwnerUUID).length)
        .toBe(3);
      expect(ListsService.getLists(testOwnerUUID).length)
        .toBe(7);
    });
    $httpBackend.expectGET('/api/' + MockUserSessionService.getActiveUUID() +
                           '/items?modified=' + latestModified +
                           '&deleted=true&archived=true&completed=true').respond(
                           200, itemsResponseWithNoteToList);
    latestModified = itemsResponseWithNoteToList.lists[0].modified;
    $httpBackend.flush();
  });

  it('should handle swap token when offline', function () {
    MockUserSessionService.offlineEnabled = true;
    MockUserSessionService.authenticated = true;
    MockUserSessionService.authenticateValid = false;
    MockUserSessionService.authenticateReplaceable = true;

    // Mock authenticate callback
    var authenticateCallback = function(){
      MockUserSessionService.authenticateValid = true;
    };
    BackendClientService.registerPrimaryPostResultCallback(authenticateCallback);

    var testItem = {
      'title': 'test note'
    };
    $httpBackend.expectPOST('/api/authenticate', {rememberMe: true})
       .respond(200, authenticateResponse);
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/item', testItem)
        .respond(200, putNewItemResponse);
    ItemsService.saveItem(testItem, testOwnerUUID);
    $httpBackend.flush();
    var items = ItemsService.getItems(testOwnerUUID);
    expect(items.length)
      .toBe(4);
  });


});
