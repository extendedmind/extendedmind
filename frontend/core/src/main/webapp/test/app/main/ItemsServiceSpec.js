/*global beforeEach, getJSONFixture, module, inject, describe, afterEach, it, expect */
'use strict';

describe('ItemService', function() {

  // INJECTS 

  var $httpBackend;
  var ItemsService, BackendClientService, HttpBasicAuthenticationService, HttpClientService,
      ListsService, TagsService, TasksService;

  // MOCKS
  
  var now = new Date();
  var putNewItemResponse = getJSONFixture('putItemResponse.json');
  putNewItemResponse.modified = now.getTime();
  var putExistingItemResponse = getJSONFixture('putExistingItemResponse.json');
  putExistingItemResponse.modified = now.getTime();
  var deleteItemResponse = getJSONFixture('deleteItemResponse.json');
  deleteItemResponse.result.modified = now.getTime();
  var undeleteItemResponse = getJSONFixture('undeleteItemResponse.json');
  undeleteItemResponse.modified = now.getTime();
  var putExistingTaskResponse = getJSONFixture('putExistingTaskResponse.json');
  putExistingTaskResponse.modified = now.getTime();

  var testOwnerUUID = '6be16f46-7b35-4b2d-b875-e13d19681e77';

  var MockUserSessionService = {
      latestModified: undefined,
      getCredentials: function () {
        return '123456789';
      },
      getActiveUUID: function () {
        return testOwnerUUID;
      },
      getLatestModified: function () {
        return this.latestModified;
      },
      setLatestModified: function (modified) {
        this.latestModified = modified;
      }
    };

  // SETUP / TEARDOWN

  beforeEach(function() {
    module('em.appTest');

    module('em.services', function ($provide){
      $provide.value('UserSessionService', MockUserSessionService);
    });

    inject(function (_$httpBackend_, _ItemsService_, _BackendClientService_, _HttpBasicAuthenticationService_, _HttpClientService_,
                    _ListsService_, _TagsService_, _TasksService_) {
      $httpBackend = _$httpBackend_;
      ItemsService = _ItemsService_;
      BackendClientService = _BackendClientService_;
      HttpBasicAuthenticationService = _HttpBasicAuthenticationService_;
      HttpClientService = _HttpClientService_;
      ListsService = _ListsService_;
      TagsService = _TagsService_;
      TasksService = _TasksService_;

      var testItemData = {
          'items': [{
              'uuid': 'f7724771-4469-488c-aabd-9db188672a9b',
              'modified': 1391278509634,
              'title': 'should I start yoga?'
            }, {
              'uuid': 'd1e764e8-3be3-4e3f-8bec-8c3f9e7843e9',
              'modified': 1391278509640,
              'title': 'remember the milk'
            }, {
              'uuid': '7a612ca2-7de0-45ad-a758-d949df37f51e',
              'modified': 1391278509745,
              'title': 'buy new shoes'
            }],
          'tasks': [{
              'uuid': '7a612ca2-7de0-45ad-a758-d949df37f51e',
              'modified': 1391278509745,
              'title': 'write essay body',
              'due': '2014-03-09',
              'relationships': {
                'parent': '07bc96d1-e8b2-49a9-9d35-1eece6263f98'
              }
            }, {
              'uuid': '7b53d509-853a-47de-992c-c572a6952629',
              'modified': 1391278509698,
              'title': 'clean closet'
            }, {
              'uuid': '9a1ce3aa-f476-43c4-845e-af59a9a33760',
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
              'modified': 1391278509917,
              'title': 'buy tickets',
              'completed': 1391278509917,
              'relationships': {
                'parent': 'bf726d03-8fee-4614-8b68-f9f885938a51'
              }
            }],
          'lists': [{
              'uuid': '0da0bff6-3bd7-4884-adba-f47fab9f270d',
              'modified': 1390912600957,
              'title': 'extended mind technologies',
              'link': 'http://ext.md'
            }, {
              'uuid': 'bf726d03-8fee-4614-8b68-f9f885938a51',
              'modified': 1390912600947,
              'title': 'trip to Dublin',
              'completable': true,
              'due': '2013-10-31'
            }, {
              'uuid': '07bc96d1-e8b2-49a9-9d35-1eece6263f98',
              'modified': 1390912600983,
              'title': 'write essay on cognitive biases',
              'completable': true
          }],
          'tags': [{
              'uuid': '1208d45b-3b8c-463e-88f3-f7ef19ce87cd',
              'modified': 1391066914167,
              'title': 'home',
              'tagType': 'context'
            }, {
              'uuid': '81daf688-d34d-4551-9a24-564a5861ace9',
              'modified': 1391066914032,
              'title': 'email',
              'tagType': 'context',
              'parent': 'e1bc540a-97fe-4c9f-9a44-ffcd7a8563e8'
            }, {
              'uuid': 'c933e120-90e7-488b-9f15-ea2ee2887e67',
              'modified': 1391066914132,
              'title': 'secret',
              'tagType': 'keyword'
            }]
        };

      // Syncronize with test data
      $httpBackend.expectGET('/api/' + MockUserSessionService.getActiveUUID() + '/items')
       .respond(200, testItemData);
      ItemsService.synchronize(testOwnerUUID);
      $httpBackend.flush();
    });
  });


  afterEach(function() {
    MockUserSessionService.setLatestModified(undefined);
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
    ItemsService.synchronize(testOwnerUUID);
    $httpBackend.flush();

    expect(ItemsService.getItems(testOwnerUUID).length)
      .toBe(4);
    expect(TagsService.getTags(testOwnerUUID).length)
      .toBe(3);
    expect(ListsService.getLists(testOwnerUUID).length)
      .toBe(3);
    expect(TasksService.getTasks(testOwnerUUID).length)
      .toBe(3);
    expect(TasksService.getCompletedTasks(testOwnerUUID).length)
      .toBe(1);
    expect(MockUserSessionService.getLatestModified())
      .toBe(newLatestModified);

    // Check that task got the right context
    expect(TasksService.getTaskByUUID('9a1ce3aa-f476-43c4-845e-af59a9a33760',testOwnerUUID)
            .relationships.context).toBe('1208d45b-3b8c-463e-88f3-f7ef19ce87cd');
  });

  it('should syncronize with empty result', function () {
    MockUserSessionService.setLatestModified(undefined);
    $httpBackend.expectGET('/api/' + MockUserSessionService.getActiveUUID() + '/items')
     .respond(200, '{}');
    ItemsService.synchronize(testOwnerUUID);
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

  it('should get items', function () {
    var items = ItemsService.getItems(testOwnerUUID);
    expect(items.length)
      .toBe(3);
    // Items should be in modified order
    expect(items[0].title).toBe('should I start yoga?');
    expect(items[1].title).toBe('remember the milk');
    expect(items[2].title).toBe('buy new shoes');
  });

  it('should find item by uuid', function () {
    expect(ItemsService.getItemByUUID('d1e764e8-3be3-4e3f-8bec-8c3f9e7843e9', testOwnerUUID))
      .toBeDefined();
  });

  it('should not find item by unknown uuid', function () {
    expect(ItemsService.getItemByUUID('bf726d03-8fee-4614-8b68-f9f885938a50', testOwnerUUID))
      .toBeUndefined();
  });

  it('should save new item', function () {
    var testItem = {
      'title': 'test item'
    };
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/item', testItem)
       .respond(200, putNewItemResponse);
    ItemsService.saveItem(testItem, testOwnerUUID);
    $httpBackend.flush();
    expect(ItemsService.getItemByUUID(putNewItemResponse.uuid, testOwnerUUID))
      .toBeDefined();

    // Should go to the end of the array
    var items = ItemsService.getItems(testOwnerUUID);
    expect(items.length)
      .toBe(4);
    expect(items[3].uuid)
      .toBe(putNewItemResponse.uuid);
  });

  it('should update existing item', function () {
    var rememberTheMilk = ItemsService.getItemByUUID('d1e764e8-3be3-4e3f-8bec-8c3f9e7843e9', testOwnerUUID);
    rememberTheMilk.title = 'remember the milk!';
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/item/' + rememberTheMilk.uuid, rememberTheMilk)
       .respond(200, putExistingItemResponse);
    ItemsService.saveItem(rememberTheMilk, testOwnerUUID);
    $httpBackend.flush();
    expect(ItemsService.getItemByUUID(rememberTheMilk.uuid, testOwnerUUID).modified)
      .toBe(putExistingItemResponse.modified);

    // Should move to the end of the array
    var items = ItemsService.getItems(testOwnerUUID);
    expect(items.length)
      .toBe(3);
    expect(items[2].uuid)
      .toBe(rememberTheMilk.uuid);
  });

  it('should delete and undelete item', function () {
    var rememberTheMilk = ItemsService.getItemByUUID('d1e764e8-3be3-4e3f-8bec-8c3f9e7843e9', testOwnerUUID);
    $httpBackend.expectDELETE('/api/' + MockUserSessionService.getActiveUUID() + '/item/' + rememberTheMilk.uuid)
       .respond(200, deleteItemResponse);
    ItemsService.deleteItem(rememberTheMilk, testOwnerUUID);
    $httpBackend.flush();
    expect(ItemsService.getItemByUUID(rememberTheMilk.uuid, testOwnerUUID))
      .toBeUndefined();

    // There should be just two left
    var items = ItemsService.getItems(testOwnerUUID);
    expect(items.length)
      .toBe(2);

    // Undelete the item
    $httpBackend.expectPOST('/api/' + MockUserSessionService.getActiveUUID() + '/item/' + rememberTheMilk.uuid + '/undelete')
       .respond(200, undeleteItemResponse);
    ItemsService.undeleteItem(rememberTheMilk, testOwnerUUID);
    $httpBackend.flush();
    expect(ItemsService.getItemByUUID(rememberTheMilk.uuid, testOwnerUUID).modified)
      .toBe(undeleteItemResponse.modified);

    // There should be three left with the undeleted rememberTheMilk the last
    items = ItemsService.getItems(testOwnerUUID);
    expect(items.length)
      .toBe(3);
    expect(items[2].uuid)
      .toBe(rememberTheMilk.uuid);
  });

  it('should convert item to task', function () {
    var rememberTheMilk = ItemsService.getItemByUUID('d1e764e8-3be3-4e3f-8bec-8c3f9e7843e9', testOwnerUUID);
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/task/' + rememberTheMilk.uuid)
       .respond(200, putExistingTaskResponse);
    ItemsService.itemToTask(rememberTheMilk, testOwnerUUID);
    $httpBackend.flush();

    // There should be still three left, as it will stay there until completing
    expect(ItemsService.getItemByUUID(rememberTheMilk.uuid, testOwnerUUID))
      .toBeDefined();
    expect(ItemsService.getItems(testOwnerUUID).length)
      .toBe(3);

    // Tasks should have the new item
    expect(TasksService.getTaskByUUID(rememberTheMilk.uuid, testOwnerUUID))
      .toBeDefined();
    expect(TasksService.getTasks(testOwnerUUID).length)
      .toBe(4);

    // Complete task upgrade
    ItemsService.completeItemToTask(rememberTheMilk, testOwnerUUID);

    // Now there should be only two left
    expect(ItemsService.getItems(testOwnerUUID).length)
      .toBe(2);
  });


  it('should archive tasks alongside list', function () {
    var modified = now.getTime();
    var archiveTripToDublinResponse = {
      'archived': modified,
      'children': [{
        'uuid': '9a1ce3aa-f476-43c4-845e-af59a9a33760',
        'modified': modified
      }, {
        'uuid': '1a1ce3aa-f476-43c4-845e-af59a9a33760',
        'modified': modified
      }],
      'history': {
        'uuid': '3fab3a32-3933-4b00-bf7e-9f2f516fae5f',
        'modified': modified,
        'title': 'bf726d03-8fee-4614-8b68-f9f885938a51',
        'tagType': 'history'
      },
      'result': {
        'modified': modified
      }
    };
    var tripToDublin = ListsService.getListByUUID('bf726d03-8fee-4614-8b68-f9f885938a51', testOwnerUUID);
    $httpBackend.expectPOST('/api/' + MockUserSessionService.getActiveUUID() + '/list/' + tripToDublin.uuid + '/archive')
       .respond(200, archiveTripToDublinResponse);
    ListsService.archiveList(tripToDublin, testOwnerUUID);
    $httpBackend.flush();
    
    // The list should not be active anymore
    expect(ListsService.getListByUUID(tripToDublin.uuid, testOwnerUUID))
      .toBeUndefined();
    expect(ListsService.getLists(testOwnerUUID).length)
      .toBe(2);
    expect(ListsService.getArchivedLists(testOwnerUUID).length)
      .toBe(1);

    // TagsService should have the new generated tag
    expect(TagsService.getTagByUUID(archiveTripToDublinResponse.history.uuid, testOwnerUUID))
      .toBeDefined();

    // There should be a new archived task
    expect(TasksService.getArchivedTasks(testOwnerUUID).length)
      .toBe(2);
    expect(TasksService.getTasks(testOwnerUUID).length)
      .toBe(2);
    expect(TasksService.getCompletedTasks(testOwnerUUID).length)
      .toBe(0);
  });
});
