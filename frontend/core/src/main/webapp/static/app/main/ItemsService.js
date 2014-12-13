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
  var itemFieldInfos = ItemLikeService.getFieldInfos();

  function initializeArrays(ownerUUID) {
    if (!items[ownerUUID]) {
      items[ownerUUID] = {
        activeItems: [],
        deletedItems: []
      };
    }
  }
  UserSessionService.registerNofifyOwnerCallback(initializeArrays, 'ItemsService');

  function updateItem(item, ownerUUID) {
    ItemLikeService.persistAndReset(item, 'item', ownerUUID, itemFieldInfos);
    return ArrayService.updateItem(item,
                                   items[ownerUUID].activeItems,
                                   items[ownerUUID].deletedItems);
  }

  function setItem(item, ownerUUID) {
    ItemLikeService.persistAndReset(item, 'item', ownerUUID, itemFieldInfos);
    return ArrayService.setItem(item,
                                items[ownerUUID].activeItems,
                                items[ownerUUID].deletedItems);
  }

  return {
    getNewItem: function(initialValues, ownerUUID) {
      return ItemLikeService.getNew(initialValues, 'item', ownerUUID, itemFieldInfos);
    },
    setItems: function(itemsResponse, ownerUUID) {
      ItemLikeService.persistAndReset(itemsResponse, 'item', ownerUUID, itemFieldInfos);
      return ArrayService.setArrays(itemsResponse,
                                    items[ownerUUID].activeItems,
                                    items[ownerUUID].deletedItems);
    },
    updateItems: function(itemsResponse, ownerUUID) {
      ItemLikeService.persistAndReset(itemsResponse, 'item', ownerUUID, itemFieldInfos);
      return ArrayService.updateArrays(itemsResponse,
                                       items[ownerUUID].activeItems,
                                       items[ownerUUID].deletedItems);
    },
    updateItemProperties: function(uuid, properties, ownerUUID) {
      var itemInfo = this.getItemInfo(uuid, ownerUUID);
      if (itemInfo){
        ItemLikeService.updateObjectProperties(itemInfo.item, properties);
        updateItem(itemInfo.item, ownerUUID);
        return itemInfo.item;
      }
    },
    getItems: function(ownerUUID) {
      return items[ownerUUID].activeItems;
    },
    getItemInfo: function(uuid, ownerUUID) {
      var item = items[ownerUUID].activeItems.findFirstObjectByKeyValue('uuid', uuid, 'trans');
      if (item){
        return {
          type: 'active',
          item: ItemLikeService.resetTrans(item, 'item', ownerUUID, itemFieldInfos)
        };
      }
      item = items[ownerUUID].deletedItems.findFirstObjectByKeyValue('uuid', uuid, 'trans');
      if (item){
        return {
          type: 'deleted',
          item: ItemLikeService.resetTrans(item, 'item', ownerUUID, itemFieldInfos)
        };
      }
    },
    getDeletedItems: function(ownerUUID) {
      return items[ownerUUID].deletedItems;
    },
    saveItem: function(item, ownerUUID) {
      var deferred = $q.defer();
      if (items[ownerUUID].deletedItems.findFirstObjectByKeyValue('uuid', item.trans.uuid, 'trans')) {
        deferred.reject({type: 'deleted'});
      } else {
        ItemLikeService.save(item, 'item', ownerUUID, itemFieldInfos).then(
          function(result){
            if (result === 'new') setItem(item, ownerUUID);
            else if (result === 'existing') updateItem(item, ownerUUID);
            deferred.resolve(result);
          }, function(failure){
            deferred.reject(failure);
          }
        );
      }
      return deferred.promise;
    },
    deleteItem: function(item, ownerUUID) {
      var deferred = $q.defer();
      // Check if item has already been deleted
      if (items[ownerUUID].deletedItems.findFirstObjectByKeyValue('uuid', item.trans.uuid, 'trans')) {
        deferred.resolve('unmodified');
      }else{
        ItemLikeService.processDelete(item, 'item', ownerUUID, itemFieldInfos).then(
          function(){
            updateItem(item, ownerUUID);
            deferred.resolve(item);
          }, function(failure){
            deferred.reject(failure);
          }
        );
      }
      return deferred.promise;
    },
    undeleteItem: function(item, ownerUUID) {
      var deferred = $q.defer();
      // Check that item is deleted before trying to undelete
      if (!items[ownerUUID].deletedItems.findFirstObjectByKeyValue('uuid', item.trans.uuid, 'trans')) {
        deferred.resolve('unmodified');
      }else{
        ItemLikeService.undelete(item, 'item', ownerUUID, itemFieldInfos).then(
          function(){
            updateItem(item, ownerUUID);
            deferred.resolve(item);
          }, function(failure){
            deferred.reject(failure);
          }
        );
      }
      return deferred.promise;
    },
    removeItem: function(item, ownerUUID) {
      ArrayService.removeFromArrays(item,
                                    items[ownerUUID].activeItems,
                                    items[ownerUUID].deletedItems);
    },
    itemToTask: function(item, ownerUUID) {
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
    // Regular expressions for item requests
    putNewItemRegex: ItemLikeService.getPutNewRegex('item'),
    putExistingItemRegex: ItemLikeService.getPutExistingRegex('item'),
    deleteItemRegex: ItemLikeService.getDeleteRegex('item'),
    undeleteItemRegex: ItemLikeService.getUndeleteRegex('item')
  };
}

ItemsService['$inject'] = ['$q', 'ArrayService', 'BackendClientService', 'ItemLikeService', 'ListsService',
  'NotesService', 'TagsService', 'TasksService', 'UISessionService', 'UserSessionService', 'UUIDService'];
angular.module('em.main').factory('ItemsService', ItemsService);
