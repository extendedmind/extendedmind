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

describe('ItemsService', function() {

  // INJECTS

  var $httpBackend;
  var ItemsService, BackendClientService, HttpClientService,
      ListsService, TagsService, TasksService, NotesService, ItemLikeService,
      UserSessionService;

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
  var putExistingTaskResponse = getJSONFixture('putExistingTaskResponse.json');
  putExistingTaskResponse.modified = now.getTime();
  var putExistingNoteResponse = getJSONFixture('putExistingNoteResponse.json');
  putExistingNoteResponse.modified = now.getTime();
  var putExistingListResponse = getJSONFixture('putExistingListResponse.json');
  putExistingListResponse.modified = now.getTime();

  var testOwnerUUID = '6be16f46-7b35-4b2d-b875-e13d19681e77';

  // SETUP / TEARDOWN

  beforeEach(function() {
    module('em.appTest');

    inject(function (_$httpBackend_, _ItemsService_, _BackendClientService_, _HttpClientService_,
                    _ListsService_, _TagsService_, _TasksService_, _NotesService_, _ItemLikeService_,
                    _UserSessionService_) {
      $httpBackend = _$httpBackend_;
      ItemsService = _ItemsService_;
      BackendClientService = _BackendClientService_;
      HttpClientService = _HttpClientService_;
      ListsService = _ListsService_;
      TagsService = _TagsService_;
      TasksService = _TasksService_;
      NotesService = _NotesService_;
      ItemLikeService = _ItemLikeService_;
      UserSessionService = _UserSessionService_;
      UserSessionService.executeNotifyOwnerCallbacks(testOwnerUUID);

      ItemsService.setItems(
        [{
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
        }], testOwnerUUID);
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
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  // TESTS

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
    expect(ItemsService.getItemInfo('d1e764e8-3be3-4e3f-8bec-8c3f9e7843e9', testOwnerUUID))
      .toBeDefined();
  });

  it('should not find item by unknown uuid', function () {
    expect(ItemsService.getItemInfo('bf726d03-8fee-4614-8b68-f9f885938a50', testOwnerUUID))
      .toBeUndefined();
  });

  it('should save new item', function () {
    var testItemValues = {title: 'test item'};
    var testItem = ItemsService.getNewItem(testItemValues);
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item', testItemValues)
       .respond(200, putNewItemResponse);
    ItemsService.saveItem(testItem, testOwnerUUID);
    $httpBackend.flush();
    expect(ItemsService.getItemInfo(putNewItemResponse.uuid, testOwnerUUID))
      .toBeDefined();

    // Should go to the end of the array
    var items = ItemsService.getItems(testOwnerUUID);
    expect(items.length)
      .toBe(4);
    expect(items[3].uuid)
      .toBe(putNewItemResponse.uuid);
  });

  it('should update existing item', function () {
    var rememberTheMilk = ItemsService.getItemInfo('d1e764e8-3be3-4e3f-8bec-8c3f9e7843e9', testOwnerUUID).item;
    rememberTheMilk.trans.title = 'remember the milk!';
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/item/' + rememberTheMilk.uuid,
                           {title: rememberTheMilk.trans.title,
                           modified: rememberTheMilk.modified})
       .respond(200, putExistingItemResponse);
    ItemsService.saveItem(rememberTheMilk, testOwnerUUID);
    $httpBackend.flush();
    expect(ItemsService.getItemInfo(rememberTheMilk.uuid, testOwnerUUID).item.modified)
      .toBe(putExistingItemResponse.modified);

    // Should not change places
    var items = ItemsService.getItems(testOwnerUUID);
    expect(items.length)
      .toBe(3);
    expect(items[1].uuid)
      .toBe(rememberTheMilk.uuid);
  });

  it('should delete and undelete item', function () {
    var rememberTheMilk = ItemsService.getItemInfo('d1e764e8-3be3-4e3f-8bec-8c3f9e7843e9', testOwnerUUID).item;
    $httpBackend.expectDELETE('/api/' + testOwnerUUID + '/item/' + rememberTheMilk.uuid)
       .respond(200, deleteItemResponse);
    ItemsService.deleteItem(rememberTheMilk, testOwnerUUID);
    $httpBackend.flush();
    expect(ItemsService.getItemInfo(rememberTheMilk.uuid, testOwnerUUID).type)
      .toBe('deleted');

    // There should be just two left
    var items = ItemsService.getItems(testOwnerUUID);
    expect(items.length)
      .toBe(2);

    // Undelete the item
    $httpBackend.expectPOST('/api/' + testOwnerUUID + '/item/' + rememberTheMilk.uuid + '/undelete')
       .respond(200, undeleteItemResponse);
    ItemsService.undeleteItem(rememberTheMilk, testOwnerUUID);
    $httpBackend.flush();
    expect(ItemsService.getItemInfo(rememberTheMilk.uuid, testOwnerUUID).item.modified)
      .toBe(undeleteItemResponse.modified);

    // There should be three left with the undeleted rememberTheMilk in its old place
    items = ItemsService.getItems(testOwnerUUID);
    expect(items.length)
      .toBe(3);
    expect(items[1].uuid)
      .toBe(rememberTheMilk.uuid);
  });

  it('should convert item to task', function () {
    var rememberTheMilk = ItemsService.getItemInfo('d1e764e8-3be3-4e3f-8bec-8c3f9e7843e9', testOwnerUUID).item;
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/task/' + rememberTheMilk.uuid)
       .respond(200, putExistingTaskResponse);
    ItemsService.itemToTask(rememberTheMilk, testOwnerUUID);
    $httpBackend.flush();

    // There should be two left
    expect(ItemsService.getItemInfo(rememberTheMilk.uuid, testOwnerUUID))
      .toBeUndefined();
    expect(ItemsService.getItems(testOwnerUUID).length)
      .toBe(2);

    // Tasks should have the new item
    expect(TasksService.getTaskInfo(rememberTheMilk.uuid, testOwnerUUID))
      .toBeDefined();
    expect(TasksService.getTasks(testOwnerUUID).length)
      .toBe(1);
  });

  it('should convert item to note', function () {
    var yoga = ItemsService.getItemInfo('f7724771-4469-488c-aabd-9db188672a9b', testOwnerUUID).item;
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/note/' + yoga.uuid)
       .respond(200, putExistingNoteResponse);
    ItemsService.itemToNote(yoga, testOwnerUUID);
    $httpBackend.flush();

    // There should be two left
    expect(ItemsService.getItemInfo(yoga.uuid, testOwnerUUID))
      .toBeUndefined();
    expect(ItemsService.getItems(testOwnerUUID).length)
      .toBe(2);

    // Notes should have the new item
    expect(NotesService.getNoteInfo(yoga.uuid, testOwnerUUID))
      .toBeDefined();
    expect(NotesService.getNotes(testOwnerUUID).length)
      .toBe(1);
  });

  it('should convert item to list', function () {
    var yoga = ItemsService.getItemInfo('f7724771-4469-488c-aabd-9db188672a9b', testOwnerUUID).item;
    $httpBackend.expectPUT('/api/' + testOwnerUUID + '/list/' + yoga.uuid)
       .respond(200, putExistingListResponse);
    ItemsService.itemToList(yoga, testOwnerUUID);
    $httpBackend.flush();

    // There should be two left
    expect(ItemsService.getItemInfo(yoga.uuid, testOwnerUUID))
      .toBeUndefined();
    expect(ItemsService.getItems(testOwnerUUID).length)
      .toBe(2);

    // Lists should have the new item
    expect(ListsService.getListInfo(yoga.uuid, testOwnerUUID))
      .toBeDefined();
    expect(ListsService.getLists(testOwnerUUID).length)
      .toBe(1);
  });

});
