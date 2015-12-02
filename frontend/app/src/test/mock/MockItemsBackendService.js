/* Copyright 2013-2015 Extended Mind Technologies Oy
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

 /*global angular, getJSONFixture */
'use strict';

function MockItemsBackendService($httpBackend, ItemsService, SynchronizeService, UUIDService) {

  function convertModifiedItemsIntoPersistent(modifiedItems){
    var persistentItems = [];
    for (var i=0; i<modifiedItems.length; i++){
      var persistentItem = {
        uuid: UUIDService.isFakeUUID(modifiedItems[i].trans.uuid) ? UUIDService.randomUUID() :
                                                              modifiedItems[i].trans.uuid,
        title: modifiedItems[i].mod.title || modifiedItems[i].trans.title,
        created: modifiedItems[i].trans.created,
        modified: modifiedItems[i].mod.modified || modifiedItems[i].trans.modified
      };
      if (modifiedItems[i].mod.id) persistentItem.id = modifiedItems[i].mod.id;
      else if (modifiedItems[i].trans.id) persistentItem.id = modifiedItems[i].trans.id;

      if (modifiedItems[i].mod.description) persistentItem.description = modifiedItems[i].mod.description;
      else if (modifiedItems[i].trans.description) persistentItem.description = modifiedItems[i].trans.description;

      if (modifiedItems[i].mod.link) persistentItem.link = modifiedItems[i].mod.link;
      else if (modifiedItems[i].trans.link) persistentItem.link = modifiedItems[i].trans.link;

      if (modifiedItems[i].mod.deleted) persistentItem.deleted = modifiedItems[i].mod.deleted;
      else if (modifiedItems[i].trans.deleted) persistentItem.deleted = modifiedItems[i].trans.deleted;

      if (modifiedItems[i].mod.archived) persistentItem.archived = modifiedItems[i].mod.archived;
      else if (modifiedItems[i].trans.archived) persistentItem.archived = modifiedItems[i].trans.archived;

      if (modifiedItems[i].mod.due) persistentItem.due = modifiedItems[i].mod.due;
      else if (modifiedItems[i].trans.due) persistentItem.due = modifiedItems[i].trans.due;

      if (modifiedItems[i].mod.completed) persistentItem.completed = modifiedItems[i].mod.completed;
      else if (modifiedItems[i].trans.completed) persistentItem.completed = modifiedItems[i].trans.completed;

      if (modifiedItems[i].mod.repeating) persistentItem.repeating = modifiedItems[i].mod.repeating;
      else if (modifiedItems[i].trans.repeating) persistentItem.repeating = modifiedItems[i].trans.repeating;

      if (modifiedItems[i].mod.reminders) {
        persistentItem.reminders = JSON.parse(JSON.stringify(modifiedItems[i].mod.reminders));
      } else if (modifiedItems[i].trans.reminders) {
        persistentItem.reminders = JSON.parse(JSON.stringify(modifiedItems[i].trans.reminders));
      }

      if (modifiedItems[i].mod.visibility) {
        persistentItem.visibility = JSON.parse(JSON.stringify(modifiedItems[i].mod.visibility));
      } else if (modifiedItems[i].trans.visibility) {
        persistentItem.visibility = JSON.parse(JSON.stringify(modifiedItems[i].trans.visibility));
      }

      if (modifiedItems[i].mod.content) persistentItem.content = modifiedItems[i].mod.content;
      else if (modifiedItems[i].trans.content) persistentItem.content = modifiedItems[i].trans.content;

      if (modifiedItems[i].mod.relationships)
        persistentItem.relationships = modifiedItems[i].mod.relationships;
      else if (modifiedItems[i].relationships)
        persistentItem.relationships = modifiedItems[i].relationships;

      if (modifiedItems[i].mod.parent)
        persistentItem.parent = modifiedItems[i].mod.parent;
      else if (modifiedItems[i].parent)
        persistentItem.parent = modifiedItems[i].parent;

      if (modifiedItems[i].mod.tagType) persistentItem.tagType = modifiedItems[i].mod.tagType;
      else if (modifiedItems[i].trans.tagType) persistentItem.tagType = modifiedItems[i].trans.tagType;

      persistentItems.push(persistentItem);
    }
    return persistentItems;
  }

  function mockGetItems(expectResponse){
    $httpBackend.whenGET(SynchronizeService.getItemsRegex)
      .respond(function(method, url, data, headers) {
        var i;
        if (url.indexOf('?modified=') !== -1 || url.indexOf('?deleted=') !== -1){
          var modifiedResponse = {};
          var ownerUUID = url.substr(5, 36);

          var tagsOnly = (url.indexOf('tagsOnly=true') !== -1);
          // Search values that contain mod from the PersistentStorageService and return them
          var modifiedItems = SynchronizeService.getModifiedItems('item', ownerUUID);
          if (modifiedItems && modifiedItems.length && !tagsOnly){
            modifiedResponse.items = convertModifiedItemsIntoPersistent(modifiedItems);
          }
          var modifiedTasks = SynchronizeService.getModifiedItems('task', ownerUUID);
          if (modifiedTasks && modifiedTasks.length && !tagsOnly){
            modifiedResponse.tasks = convertModifiedItemsIntoPersistent(modifiedTasks);
          }
          var modifiedNotes = SynchronizeService.getModifiedItems('note', ownerUUID);
          if (modifiedNotes && modifiedNotes.length && !tagsOnly){
            modifiedResponse.notes = convertModifiedItemsIntoPersistent(modifiedNotes);
          }
          var modifiedLists = SynchronizeService.getModifiedItems('list', ownerUUID);
          if (modifiedLists && modifiedLists.length && !tagsOnly){
            modifiedResponse.lists = convertModifiedItemsIntoPersistent(modifiedLists);
          }
          var modifiedTags = SynchronizeService.getModifiedItems('tag', ownerUUID);
          if (modifiedTags && modifiedTags.length){
            modifiedResponse.tags = convertModifiedItemsIntoPersistent(modifiedTags);
          }
          return expectResponse(method, url, data, headers, modifiedResponse);
        }else if (url.indexOf('?completed=true') != -1){
          var response = {
            'tasks': []
          };
          for(i = 0; i < 100; i++) {
            var referenceDate = new Date();
            if (i < 10 ){
              // First ten are today
            }else if (i < 20){
              // Yesterday
              referenceDate.setDate(referenceDate.getDate()-1);
            }else if (i < 30){
              // Two days ago
              referenceDate.setDate(referenceDate.getDate()-2);
            }else if (i < 40){
              // Week ago
              referenceDate.setDate(referenceDate.getDate()-7);
            }else if (i < 50){
              // Month ago
              referenceDate.setDate(referenceDate.getDate()-31);
            }else if (i < 60){
              // Two months ago
              referenceDate.setDate(referenceDate.getDate()-62);
            }else {
              // Way back
              referenceDate.setDate(referenceDate.getDate()-1000);
            }
            var referenceEpoch = referenceDate.getTime();

            response.tasks.push({
              'uuid': UUIDService.randomUUID(),
              'created': referenceEpoch,
              'modified': referenceEpoch,
              'completed': referenceEpoch + i,
              'title': 'test completed ' + i
            });
          }
          return expectResponse(method, url, data, headers, response);
        }else if (url.indexOf('?archived=true') != -1){
          return expectResponse(method, url, data, headers, {});
        }else if (url.indexOf('?deleted=true') != -1){
          return expectResponse(method, url, data, headers, {});
        }else if (url.indexOf('?tagsOnly=true') != -1){
          if (url.indexOf('11111111-1111-1111-1111-111111111111') != -1){
            // Common collective
            var tagsOnlyItemsResponseData = getJSONFixture('tagsOnlyItemsResponse.json');
            return expectResponse(method, url, data, headers, tagsOnlyItemsResponseData);
          }else{
            return expectResponse(method, url, data, headers, {});
          }
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

          if (headers.Authorization === 'Basic dG9rZW46VEVTVA=='){
            // Token 'TEST' returned for jp@ext.md
            return expectResponse(method, url, data, headers, {});
          } else if (headers.Authorization === 'Basic dG9rZW46U0hBUkVE'){
            // Token 'SHARED' returned for lauri@ext.md
            var activeUUID = sessionStorage.getItem('activeUUID');
            if (activeUUID && url.indexOf(activeUUID) === -1){
              return expectResponse(method, url, data, headers, getJSONFixture('sharedItemsResponse.json'));
            }else{
              return expectResponse(method, url, data, headers, {});
            }
          } else if (headers.Authorization === 'Basic dG9rZW46T0ZGTElORQ==') {
            return [404, 'Not found'];
          }
          var itemsResponseData = getJSONFixture('itemsResponse.json');
          if (itemsResponseData.tasks) {
            var twoHoursInFuture = new Date();
            twoHoursInFuture.setHours(twoHoursInFuture.getHours() + 2,
                                      twoHoursInFuture.getMinutes() + 2,
                                      0, 0);
            twoHoursInFuture = twoHoursInFuture.getTime();
            for (i = 0; i < itemsResponseData.tasks.length; i++) {
              if (itemsResponseData.tasks[i].reminders) {
                for (var j = 0; j < itemsResponseData.tasks[i].reminders.length; j++) {
                  // Set notification 2 hours into future.
                  itemsResponseData.tasks[i].reminders[j].notification = twoHoursInFuture;
                }
              }
            }
          }
          return expectResponse(method, url, data, headers, itemsResponseData);
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

MockItemsBackendService['$inject'] = ['$httpBackend', 'ItemsService',
'SynchronizeService', 'UUIDService'];
angular.module('em.appTest').factory('MockItemsBackendService', MockItemsBackendService);
