/*global beforeEach, getJSONFixture, module, inject, describe, afterEach, it, expect */
'use strict';

describe('ItemService', function() {

  // INJECTS 

  var $httpBackend;
  var ItemsService, BackendClientService, HttpBasicAuthenticationService, HttpClientService;

  // TEST DATA
  
  var now = new Date;
  var putNewItemResponse = getJSONFixture('putItemResponse.json');
  putNewItemResponse.modified = now.getTime();
  var putExistingItemResponse = getJSONFixture('putExistingItemResponse.json');
  putExistingItemResponse.modified = now.getTime();
  var deleteItemResponse = getJSONFixture('deleteItemResponse.json');
  deleteItemResponse.result.modified = now.getTime();
  var undeleteItemResponse = getJSONFixture('undeleteItemResponse.json');
  undeleteItemResponse.modified = now.getTime();

  var MockUserSessionService = {
      getCredentials: function () {
        return '123456789';
      },
      getActiveUUID: function () {
        return '6be16f46-7b35-4b2d-b875-e13d19681e77';
      }
    };
  var testItemData = [{
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
    }]

  // SETUP / TEARDOWN

  beforeEach(function() {
    module('em.appTest');

    module('em.services', function ($provide){
      $provide.value('UserSessionService', MockUserSessionService);
    });

    inject(function (_$httpBackend_, _ItemsService_, _BackendClientService_, _HttpBasicAuthenticationService_, _HttpClientService_) {
      $httpBackend = _$httpBackend_;
      ItemsService = _ItemsService_;
      BackendClientService = _BackendClientService_;
      HttpBasicAuthenticationService = _HttpBasicAuthenticationService_;
      HttpClientService = _HttpClientService_;
      ItemsService.setItems(testItemData);
    });
  });


  afterEach(function() {
     $httpBackend.verifyNoOutstandingExpectation();
     $httpBackend.verifyNoOutstandingRequest();
   });

  // TESTS

  it('should get items', function () {
    var items = ItemsService.getItems();
    expect(items.length)
      .toBe(3);
    // Items should be in modified order
    expect(items[0].title).toBe('should I start yoga?');
    expect(items[1].title).toBe('remember the milk');
    expect(items[2].title).toBe('buy new shoes');
  });

  it('should find item by uuid', function () {
    expect(ItemsService.getItemByUUID('d1e764e8-3be3-4e3f-8bec-8c3f9e7843e9'))
      .toBeDefined();
  });

  it('should not find item by unknown uuid', function () {
    expect(ItemsService.getItemByUUID('bf726d03-8fee-4614-8b68-f9f885938a50'))
      .toBeUndefined();
  });

  it('should save new item', function () {
    var testItem = {
      'title': 'test item'
    };
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/item', testItem)
       .respond(200, putNewItemResponse);
    ItemsService.saveItem(testItem);
    $httpBackend.flush();
    expect(ItemsService.getItemByUUID(putNewItemResponse.uuid))
      .toBeDefined();

    // Should go to the end of the array
    var items = ItemsService.getItems();
    expect(items.length)
      .toBe(4);
    expect(items[3].uuid)
      .toBe(putNewItemResponse.uuid);
  });

  it('should update existing item', function () {
    var rememberTheMilk = ItemsService.getItemByUUID('d1e764e8-3be3-4e3f-8bec-8c3f9e7843e9');
    rememberTheMilk.title = 'remember the milk!';
    $httpBackend.expectPUT('/api/' + MockUserSessionService.getActiveUUID() + '/item/' + rememberTheMilk.uuid, rememberTheMilk)
       .respond(200, putExistingItemResponse);
    ItemsService.saveItem(rememberTheMilk);
    $httpBackend.flush();
    expect(ItemsService.getItemByUUID(rememberTheMilk.uuid).modified)
      .toBe(putExistingItemResponse.modified);

    // Should move to the end of the array
    var items = ItemsService.getItems();
    expect(items.length)
      .toBe(3);
    expect(items[2].uuid)
      .toBe(rememberTheMilk.uuid);
  });

  it('should delete and undelete item', function () {
    var rememberTheMilk = ItemsService.getItemByUUID('d1e764e8-3be3-4e3f-8bec-8c3f9e7843e9');
    $httpBackend.expectDELETE('/api/' + MockUserSessionService.getActiveUUID() + '/item/' + rememberTheMilk.uuid)
       .respond(200, deleteItemResponse);
    ItemsService.deleteItem(rememberTheMilk);
    $httpBackend.flush();
    expect(ItemsService.getItemByUUID(rememberTheMilk.uuid))
      .toBeUndefined();

    // There should be just two left
    var items = ItemsService.getItems();
    expect(items.length)
      .toBe(2);

    // Undelete the item
    $httpBackend.expectPOST('/api/' + MockUserSessionService.getActiveUUID() + '/item/' + rememberTheMilk.uuid + '/undelete')
       .respond(200, undeleteItemResponse);
    ItemsService.undeleteItem(rememberTheMilk);
    $httpBackend.flush();
    expect(ItemsService.getItemByUUID(rememberTheMilk.uuid).modified)
      .toBe(undeleteItemResponse.modified);

    // There should be three left with the undeleted rememberTheMilk the last
    items = ItemsService.getItems();
    expect(items.length)
      .toBe(3);
    expect(items[2].uuid)
      .toBe(rememberTheMilk.uuid);
  });

});
