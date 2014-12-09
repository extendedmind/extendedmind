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

 function ItemsService($q, ArrayService, BackendClientService, ItemLikeService, ListsService, NotesService,
                       TagsService, TasksService, UISessionService, UserSessionService, UUIDService) {
  var items = {};

  var itemRegex = /\/item/;
  var itemSlashRegex = /\/item\//;
  var itemFieldInfos = ItemLikeService.getDefaultFieldInfos();

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
    getNewItem: function(initialValues, ownerUUID) {
      return ItemLikeService.getNew(initialValues, 'item', ownerUUID, itemFieldInfos);
    },
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
      return ArrayService.updateArrays(itemsResponse,
                                       items[ownerUUID].activeItems,
                                       items[ownerUUID].deletedItems);
    },
    updateItemProperties: function(uuid, properties, ownerUUID) {
      return ArrayService.updateItemProperties(uuid,
                                               properties,
                                               items[ownerUUID].activeItems,
                                               items[ownerUUID].deletedItems);
    },
    getItems: function(ownerUUID) {
      initializeArrays(ownerUUID);
      return items[ownerUUID].activeItems;
    },
    getItemInfo: function(uuid, ownerUUID) {
      initializeArrays(ownerUUID);
      var item = items[ownerUUID].activeItems.findFirstObjectByKeyValue('uuid', uuid);
      if (item){
        return {
          type: 'active',
          item: ItemLikeService.refreshTrans(item, 'item', ownerUUID, itemFieldInfos)
        };
      }
      item = items[ownerUUID].deletedItems.findFirstObjectByKeyValue('uuid', uuid);
      if (item){
        return {
          type: 'deleted',
          item: ItemLikeService.refreshTrans(item, 'item', ownerUUID, itemFieldInfos)
        };
      }
    },
    getDeletedItems: function(ownerUUID) {
      initializeArrays(ownerUUID);
      return items[ownerUUID].deletedItems;
    },
    saveItem: function(item, ownerUUID) {
      initializeArrays(ownerUUID);
      var deferred = $q.defer();
      if (items[ownerUUID].deletedItems.indexOf(item) > -1) {
        deferred.reject({type: 'deleted'});
      } else {
        ItemLikeService.save(item, 'item', ownerUUID, itemFieldInfos).then(
          function(result){
            if (result === 'new') setItem(item, ownerUUID);
            else if (result === 'existing') updateItem(item, ownerUUID);
            deferred.resolve(result);
          }, function(validationErrors){
            deferred.reject(failure);
          }
        );
      }
      return deferred.promise;
    },
    deleteItem: function(item, ownerUUID) {
      initializeArrays(ownerUUID);
      var deferred = $q.defer();
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
        }, replaceable: true};
        BackendClientService.deleteOffline('/api/' + ownerUUID + '/item/' + item.uuid,
                                           this.deleteItemRegex, params);
        item.deleted = item.modified = BackendClientService.generateFakeTimestamp();
        updateItem(item, ownerUUID);
        deferred.resolve(item);
      } else {
        // Online
        BackendClientService.deleteOnline('/api/' + ownerUUID + '/item/' + item.uuid,
                                          this.deleteItemRegex)
        .then(function(result) {
          if (result.data) {
            item.deleted = result.data.deleted;
            item.modified = result.data.result.modified;
            updateItem(item, ownerUUID);
            deferred.resolve(item);
          }
        });
      }
      return deferred.promise;
    },
    undeleteItem: function(item, ownerUUID) {
      initializeArrays(ownerUUID);
      // Check that item is deleted before trying to undelete
      if (items[ownerUUID].deletedItems.indexOf(item) === -1) {
        return;
      }
      if (UserSessionService.isOfflineEnabled()) {
        // Offline
        var params = {type: 'item', owner: ownerUUID, uuid: item.uuid,
        reverse: {
          method: 'post',
          url: '/api/' + ownerUUID + '/item/' + item.uuid + '/delete'
        }, replaceable: true};
        BackendClientService.post('/api/' + ownerUUID + '/item/' + item.uuid + '/undelete',
                                  this.deleteItemRegex, params);
        delete item.deleted;
        updateItem(item, ownerUUID);
      } else {
        // Online
        BackendClientService.postOnline('/api/' + ownerUUID + '/item/' + item.uuid + '/undelete',
                                        this.deleteItemRegex)
        .then(function(result) {
          if (result.data) {
            delete item.deleted;
            item.modified = result.data.modified;
            updateItem(item, ownerUUID);
          }
        });
      }
    },
    removeItem: function(item, ownerUUID) {
      initializeArrays(ownerUUID);
      ArrayService.removeFromArrays(item,
                                    items[ownerUUID].activeItems,
                                    items[ownerUUID].deletedItems);
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
          if (!items[i].trans) items[i].trans = {};
          items[i].trans.itemType = 'item';
        }
      }
    },
    // Regular expressions for item requests
    putNewItemRegex: ItemLikeService.getPutNewRegex('item'),
    putExistingItemRegex: ItemLikeService.getPutExistingRegex('item'),
    deleteItemRegex: ItemLikeService.getDeleteRegex('item'),
    undeleteItemRegex: ItemLikeService.getUndeleteRegex('item'),
    itemFieldInfos: itemFieldInfos
  };
}

ItemsService['$inject'] = ['$q', 'ArrayService', 'BackendClientService', 'ItemLikeService', 'ListsService',
  'NotesService', 'TagsService', 'TasksService', 'UISessionService', 'UserSessionService', 'UUIDService'];
angular.module('em.main').factory('ItemsService', ItemsService);
