/*global angular, getJSONFixture */
'use strict';

function MockItemsBackendService($httpBackend, ItemsService, UUIDService) {

  function mockGetItems(expectResponse){
    $httpBackend.whenGET(ItemsService.getItemsRegex)
      .respond(function(method, url, data, headers) {
        if (url.indexOf('?modified=') != -1){
          return expectResponse(method, url, data, headers, {});
        }else if (url.indexOf('?completed=true') != -1){
          var response = {
            'tasks': []
          };
          for(var i = 0; i < 3; i++) {
            var now = new Date().getTime();
            response.tasks.push({
              'uuid': UUIDService.randomUUID(),
              'created': now,
              'modified': now,
              'completed': now + i,
              'title': 'test completed ' + i
            })
          }
          return expectResponse(method, url, data, headers, response)
        }else if (url.indexOf('?archived=true') != -1){
          return expectResponse(method, url, data, headers, {});
        }else{
          var authenticateResponse = getJSONFixture('authenticateResponse.json');
          for (var collectiveUUID in authenticateResponse.collectives) {
            if (authenticateResponse.collectives.hasOwnProperty(collectiveUUID)) {
              if (url.indexOf(collectiveUUID) != -1){
                var collectiveItemsResponse = getJSONFixture('collectiveItemsResponse.json');
                return expectResponse(method, url, data, headers, collectiveItemsResponse);
              }
            }
          }
          var itemsResponse = getJSONFixture('itemsResponse.json');
          return expectResponse(method, url, data, headers, itemsResponse);
        }
      });
  }

  function mockPutNewItem(expectResponse){
    $httpBackend.whenPUT(ItemsService.putNewItemRegex)
      .respond(function(method, url, data, headers) {
        var putNewItemResponse = getJSONFixture('putItemResponse.json');
        putNewItemResponse.created = putNewItemResponse.modified = (new Date()).getTime();
        putNewItemResponse.uuid = UUIDService.randomUUID();
        return expectResponse(method, url, data, headers, putNewItemResponse);
      });
  }

  function mockPutExistingItem(expectResponse){
    $httpBackend.whenPUT(ItemsService.putExistingItemRegex)
      .respond(function(method, url, data, headers) {
        var putExistingItemResponse = getJSONFixture('putExistingItemResponse.json');
        putExistingItemResponse.modified = (new Date()).getTime();
        return expectResponse(method, url, data, headers, putExistingItemResponse);
      });
  }

  function mockDeleteItem(expectResponse){
    $httpBackend.whenDELETE(ItemsService.deleteItemRegex)
      .respond(function(method, url, data, headers) {
        var deleteItemResponse = getJSONFixture('deleteItemResponse.json');
        deleteItemResponse.result.modified = (new Date()).getTime();
        return expectResponse(method, url, data, headers, deleteItemResponse);
      });
  }

  function mockUndeleteItem(expectResponse){
    $httpBackend.whenPOST(ItemsService.undeleteItemRegex)
      .respond(function(method, url, data, headers) {
        var undeleteItemResponse = getJSONFixture('undeleteItemResponse.json');
        undeleteItemResponse.modified = (new Date()).getTime();
        return expectResponse(method, url, data, headers, undeleteItemResponse);
      });
  }


  return {
    mockItemsBackend: function(expectResponse) {
      mockGetItems(expectResponse);
      mockPutNewItem(expectResponse);
      mockPutExistingItem(expectResponse);
      mockDeleteItem(expectResponse);
      mockUndeleteItem(expectResponse);
    }
  };
}

MockItemsBackendService.$inject = ['$httpBackend', 'ItemsService', 'UUIDService'];
angular.module('em.appTest').factory('MockItemsBackendService', MockItemsBackendService);
