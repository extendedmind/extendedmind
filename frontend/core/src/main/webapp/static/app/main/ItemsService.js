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

 /* global angular*/
 'use strict';

 function ItemsService($q, ArrayService, BackendClientService, ListsService, NotesService, TagsService,
                       TasksService, UISessionService, UserSessionService, UUIDService) {
  var items = {};

  var itemRegex = /\/item/;
  var itemSlashRegex = /\/item\//;

  function initializeArrays(ownerUUID) {
    if (!items[ownerUUID]) {
      items[ownerUUID] = {
        activeItems: [],
        deletedItems: []
      };
    }
  }

  function updateItem(item, ownerUUID) {
    return ArrayService.updateItem(item,
      items[ownerUUID].activeItems,
      items[ownerUUID].deletedItems);
  }

  function setItem(item, ownerUUID) {
    initializeArrays(ownerUUID);
    return ArrayService.setItem(item,
      items[ownerUUID].activeItems,
      items[ownerUUID].deletedItems);
  }

  return {
    setItems: function(itemsResponse, ownerUUID) {
      initializeArrays(ownerUUID);
      this.addTransientProperties(itemsResponse);
      return ArrayService.setArrays(itemsResponse,
        items[ownerUUID].activeItems,
        items[ownerUUID].deletedItems);
    },
    updateItems: function(itemsResponse, ownerUUID) {
      initializeArrays(ownerUUID);
      this.addTransientProperties(itemsResponse);
      // issue a very short lived lock to prevent leave animation
      // when arrays are reformulated
      UISessionService.lock('leaveAnimation', 100);

      return ArrayService.updateArrays(itemsResponse,
        items[ownerUUID].activeItems,
        items[ownerUUID].deletedItems);
    },
    updateItemProperties: function(uuid, properties, ownerUUID) {
      return ArrayService.updateItemProperties(
        uuid,
        properties,
        items[ownerUUID].activeItems,
        items[ownerUUID].deletedItems);
    },
    getItems: function(ownerUUID) {
      initializeArrays(ownerUUID);
      return items[ownerUUID].activeItems;
    },
    getItemByUUID: function(uuid, ownerUUID) {
      return items[ownerUUID].activeItems.findFirstObjectByKeyValue('uuid', uuid);
    },
    saveItem: function(item, ownerUUID) {
      initializeArrays(ownerUUID);
      var deferred = $q.defer();
      var params;
      if (items[ownerUUID].deletedItems.indexOf(item) > -1) {
        deferred.reject(item);
      } else if (item.uuid) {
        // Existing item
        var transientProperties = item.transientProperties;
        delete item.transientProperties;

        if (UserSessionService.isOfflineEnabled()) {
          // Push to offline buffer
          params = {type: 'item', owner: ownerUUID, uuid: item.uuid};
          BackendClientService.put('/api/' + params.owner + '/item/' + item.uuid,
           this.putNewItemRegex, params, item);
          item.modified = BackendClientService.generateFakeTimestamp();
          item.transientProperties = transientProperties;
          updateItem(item, ownerUUID);
          deferred.resolve(item);
        } else {
          // Online
          BackendClientService.putOnline('/api/' + ownerUUID + '/item/' + item.uuid,
           this.putExistingItemRegex, item).then(function(result) {
            if (result.data) {
              item.modified = result.data.modified;
              item.transientProperties = transientProperties;
              updateItem(item, ownerUUID);
              deferred.resolve(item);
            }
          });
         }
       } else {
        // New item
        if (UserSessionService.isOfflineEnabled()) {
          // Push to offline queue with fake UUID
          var fakeUUID = UUIDService.generateFakeUUID();
          params = {type: 'item', owner: ownerUUID, fakeUUID: fakeUUID};
          BackendClientService.put('/api/' + params.owner + '/item',
           this.putNewItemRegex, params, item);
          // Use the fake uuid and a fake modified that is far enough in the to make
          // it to the end of the list
          item.uuid = fakeUUID;
          item.created = item.modified = BackendClientService.generateFakeTimestamp();
          item.transientProperties = {itemType: 'item'};
          setItem(item, ownerUUID);
          deferred.resolve(item);
        } else {
          // Online
          BackendClientService.putOnline('/api/' + ownerUUID + '/item',
           this.putNewItemRegex, item).then(function(result) {
            if (result.data) {
              item.uuid = result.data.uuid;
              item.created = result.data.created;
              item.modified = result.data.modified;
              item.transientProperties = {itemType: 'item'};
              setItem(item, ownerUUID);
              deferred.resolve(item);
            }
          });
        }
      }
      return deferred.promise;
    },
    deleteItem: function(item, ownerUUID) {
      initializeArrays(ownerUUID);
      // Check if item has already been deleted
      if (items[ownerUUID].deletedItems.indexOf(item) > -1) {
        return;
      }
      if (UserSessionService.isOfflineEnabled()) {
        // Offline
        var params = {type: 'item', owner: ownerUUID, uuid: item.uuid,
        reverse: {
          method: 'post',
          url: '/api/' + ownerUUID + '/item/' + item.uuid + '/undelete'
        }};
        BackendClientService.deleteOffline('/api/' + ownerUUID + '/item/' + item.uuid,
         this.deleteItemRegex, params);
        item.deleted = item.modified = BackendClientService.generateFakeTimestamp();
        updateItem(item, ownerUUID);
      } else {
        // Online
        BackendClientService.deleteOnline('/api/' + ownerUUID + '/item/' + item.uuid,
         this.deleteItemRegex).then(function(result) {
          if (result.data) {
            item.deleted = result.data.deleted;
            item.modified = result.data.result.modified;
            updateItem(item, ownerUUID);
          }
        });
      }
    },
    undeleteItem: function(item, ownerUUID) {
      initializeArrays(ownerUUID);
      // Check that item is deleted before trying to undelete
      if (items[ownerUUID].deletedItems.indexOf(item) === -1) {
        return;
      }
      if (UserSessionService.isOfflineEnabled()) {
        // Offline
        var params = {type: 'item', owner: ownerUUID, uuid: item.uuid};
        BackendClientService.post('/api/' + ownerUUID + '/item/' + item.uuid + '/undelete',
         this.deleteItemRegex, params);
        delete item.deleted;
        updateItem(item, ownerUUID);
      } else {
        // Online
        BackendClientService.postOnline('/api/' + ownerUUID + '/item/' + item.uuid + '/undelete',
         this.deleteItemRegex).then(function(result) {
          if (result.data) {
            delete item.deleted;
            item.modified = result.data.modified;
            updateItem(item, ownerUUID);
          }
        });
      }
    },
    itemToTask: function(item, ownerUUID) {
      initializeArrays(ownerUUID);
      // Check that item is not deleted before trying to turn it into a task
      if (items[ownerUUID].deletedItems.indexOf(item) > -1) {
        return;
      }
      var index = items[ownerUUID].activeItems.findFirstIndexByKeyValue('uuid', item.uuid);
      if (index !== undefined) {
        return TasksService.saveTask(item, ownerUUID).then(function(task){
          items[ownerUUID].activeItems.splice(index, 1);
          return task;
        });
      }
    },
    itemToNote: function(item, ownerUUID) {
      initializeArrays(ownerUUID);
      // Check that item is not deleted before trying to turn it into a note
      if (items[ownerUUID].deletedItems.indexOf(item) > -1) {
        return;
      }
      var index = items[ownerUUID].activeItems.findFirstIndexByKeyValue('uuid', item.uuid);

      if (index !== undefined) {
        return NotesService.saveNote(item, ownerUUID).then(function(note){
          items[ownerUUID].activeItems.splice(index, 1);
          return note;
        });
      }
    },
    itemToList: function(item, ownerUUID) {
      initializeArrays(ownerUUID);
      // Check that item is not deleted before trying to turn it into a list
      if (items[ownerUUID].deletedItems.indexOf(item) > -1) {
        return;
      }

      var index = items[ownerUUID].activeItems.findFirstIndexByKeyValue('uuid', item.uuid);
      if (index !== undefined) {
        // Save as list and remove from the activeItems array
        return ListsService.saveList(item, ownerUUID).then(function(list){
          items[ownerUUID].activeItems.splice(index, 1);
          return list;
        });
      }
    },
    addTransientProperties: function(items) {
      if (items && items.length > 0){
        for (var i = 0; i< items.length; i++){
          if (!items[i].transientProperties) items[i].transientProperties = {};
          items[i].transientProperties.itemType = 'item';
        }
      }
    },
    // Regular expressions for item requests
    putNewItemRegex:
    new RegExp(BackendClientService.apiPrefixRegex.source +
      BackendClientService.uuidRegex.source +
      itemRegex.source),
    putExistingItemRegex:
    new RegExp(BackendClientService.apiPrefixRegex.source +
      BackendClientService.uuidRegex.source +
      itemSlashRegex.source +
      BackendClientService.uuidRegex.source),
    deleteItemRegex:
    new RegExp(BackendClientService.apiPrefixRegex.source +
      BackendClientService.uuidRegex.source +
      itemSlashRegex.source +
      BackendClientService.uuidRegex.source),
    undeleteItemRegex:
    new RegExp(BackendClientService.apiPrefixRegex.source +
      BackendClientService.uuidRegex.source +
      itemSlashRegex.source +
      BackendClientService.uuidRegex.source +
      BackendClientService.undeleteRegex.source),
  };
}

ItemsService['$inject'] = ['$q', 'ArrayService', 'BackendClientService', 'ListsService', 'NotesService',
'TagsService', 'TasksService', 'UISessionService', 'UserSessionService', 'UUIDService'];
angular.module('em.main').factory('ItemsService', ItemsService);
