/* Copyright 2013-2016 Extended Mind Technologies Oy
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
                       TagsService, TasksService, UISessionService, UserSessionService) {
  var ITEM_TYPE = 'item';

  var itemFieldInfos = ItemLikeService.getFieldInfos();

  var items = {};

  function initializeArrays(ownerUUID) {
    if (!items[ownerUUID]) {
      items[ownerUUID] = {
        activeItems: [],
        deletedItems: []
      };
    }
  }
  function notifyOwners(userUUID, collectives, sharedLists) {
    var extraOwners = ItemLikeService.processOwners(userUUID, collectives, sharedLists,
                                                    items, initializeArrays);
    for (var i=0; i < extraOwners.length; i++){
      // Need to destroy data from this owner
      ItemLikeService.destroyPersistentItems(
        items[extraOwners[i]].activeItems.concat(items[extraOwners[i]].deletedItems));
      delete items[extraOwners[i]];
    }
  }
  UserSessionService.registerNofifyOwnersCallback(notifyOwners, 'ItemsService');

  function updateItem(item, ownerUUID, oldUUID) {
    ItemLikeService.persistAndReset(item, ITEM_TYPE, ownerUUID, itemFieldInfos, oldUUID);
    return ArrayService.updateItem(ownerUUID, ITEM_TYPE, item,
                                   items[ownerUUID].activeItems,
                                   items[ownerUUID].deletedItems);
  }

  function setItem(item, ownerUUID) {
    ItemLikeService.persistAndReset(item, ITEM_TYPE, ownerUUID, itemFieldInfos);
    return ArrayService.setItem(ownerUUID, ITEM_TYPE, item,
                                items[ownerUUID].activeItems,
                                items[ownerUUID].deletedItems);
  }

  function removeActiveItem(item, ownerUUID) {
    ItemLikeService.remove(item.trans.uuid);
    ArrayService.removeFromArrays(ownerUUID, item, ITEM_TYPE,
                                        items[ownerUUID].activeItems);
  }

  return {
    getNewItem: function(initialValues, ownerUUID) {
      return ItemLikeService.getNew(initialValues, ITEM_TYPE, ownerUUID, itemFieldInfos);
    },
    setItems: function(itemsResponse, ownerUUID, skipPersist, addToExisting) {
      var itemsToSave;
      if (skipPersist){
        itemsToSave = ItemLikeService.resetAndPruneOldDeleted(itemsResponse, ITEM_TYPE, ownerUUID, itemFieldInfos);
      }else{
        itemsToSave = ItemLikeService.persistAndReset(itemsResponse, ITEM_TYPE, ownerUUID, itemFieldInfos);
      }

      if (addToExisting){
        return ArrayService.updateArrays(ownerUUID, ITEM_TYPE, itemsToSave,
                                    items[ownerUUID].activeItems,
                                    items[ownerUUID].deletedItems);
      }else{
        return ArrayService.setArrays(ownerUUID, ITEM_TYPE, itemsToSave,
                                    items[ownerUUID].activeItems,
                                    items[ownerUUID].deletedItems);
      }
    },
    updateItems: function(itemsResponse, ownerUUID) {
      if (itemsResponse && itemsResponse.length){
        // Go through itemsResponse, and add .mod values if the fields in the current .mod do not match
        // the values in the persistent response
        var updatedItems = [];
        for (var i=0; i<itemsResponse.length; i++){
          var itemInfo = this.getItemInfo(itemsResponse[i].uuid, ownerUUID);
          if (itemInfo){
            ItemLikeService.evaluateMod(itemsResponse[i], itemInfo.item,
                                        ITEM_TYPE, ownerUUID, itemFieldInfos);
            updatedItems.push(itemInfo.item);
          }else{
            updatedItems.push(itemsResponse[i]);
          }
        }
        ItemLikeService.persistAndReset(updatedItems, ITEM_TYPE, ownerUUID, itemFieldInfos);
        return ArrayService.updateArrays(ownerUUID, ITEM_TYPE, updatedItems,
                                         items[ownerUUID].activeItems,
                                         items[ownerUUID].deletedItems);
      }
    },
    updateItemModProperties: function(uuid, properties, ownerUUID) {
      var itemInfo = this.getItemInfo(uuid, ownerUUID);
      if (itemInfo){
        if (!properties){
          if (itemInfo.item.mod){
            delete itemInfo.item.mod;
            updateItem(itemInfo.item, ownerUUID);
          }
        }else{
          if (!itemInfo.item.mod) itemInfo.item.mod = {};
          ItemLikeService.updateObjectProperties(itemInfo.item.mod, properties);
          updateItem(itemInfo.item, ownerUUID, properties.uuid ? uuid : undefined);
        }
        return itemInfo.item;
      }
    },
    getItems: function(ownerUUID) {
      return items[ownerUUID].activeItems;
    },
    getModifiedItems: function(ownerUUID) {
      return ArrayService.getModifiedItems(items[ownerUUID].activeItems,
                                         items[ownerUUID].deletedItems);
    },
    getItemInfo: function(value, ownerUUID, searchField) {
      if (value !== undefined && ownerUUID !== undefined){
        var field = searchField ? searchField : 'uuid';
        var item = items[ownerUUID].activeItems.findFirstObjectByKeyValue(field, value, 'trans');
        if (item){
          return {
            type: 'active',
            item: item
          };
        }
        item = items[ownerUUID].deletedItems.findFirstObjectByKeyValue(field, value, 'trans');
        if (item){
          return {
            type: 'deleted',
            item: item
          };
        }
      }
    },
    getDeletedItems: function(ownerUUID) {
      return items[ownerUUID].deletedItems;
    },
    saveItem: function(item) {
      var ownerUUID = item.trans.owner;
      var deferred = $q.defer();
      if (items[ownerUUID].deletedItems.findFirstObjectByKeyValue('uuid', item.trans.uuid, 'trans')) {
        deferred.reject({type: 'deleted'});
      } else {
        ItemLikeService.save(item, ITEM_TYPE, ownerUUID, itemFieldInfos).then(
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
    isItemEdited: function(item) {
      var ownerUUID = item.trans.owner;
      return ItemLikeService.isEdited(item, ITEM_TYPE, ownerUUID, itemFieldInfos);
    },
    resetItem: function(item) {
      var ownerUUID = item.trans.owner;
      return ItemLikeService.resetTrans(item, ITEM_TYPE, ownerUUID, itemFieldInfos);
    },
    deleteItem: function(item) {
      var ownerUUID = item.trans.owner;
      var deferred = $q.defer();
      // Check if item has already been deleted
      if (items[ownerUUID].deletedItems.findFirstObjectByKeyValue('uuid', item.trans.uuid, 'trans')) {
        deferred.resolve('unmodified');
      }else{
        ItemLikeService.processDelete(item, ITEM_TYPE, ownerUUID, itemFieldInfos).then(
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
    undeleteItem: function(item) {
      var ownerUUID = item.trans.owner;
      var deferred = $q.defer();
      // Check that item is deleted before trying to undelete
      if (!items[ownerUUID].deletedItems.findFirstObjectByKeyValue('uuid', item.trans.uuid, 'trans')) {
        deferred.resolve('unmodified');
      }else{
        ItemLikeService.undelete(item, ITEM_TYPE, ownerUUID, itemFieldInfos).then(
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
    removeItem: function(uuid, ownerUUID) {
      var itemInfo = this.getItemInfo(uuid, ownerUUID);
      if (itemInfo) {
        if (itemInfo.type === 'active') {
          removeActiveItem(itemInfo.item, ownerUUID);
        } else if (itemInfo.type === 'deleted') {
          ItemLikeService.remove(itemInfo.item.trans.uuid);
          ArrayService.removeFromArrays(ownerUUID, itemInfo.item, ITEM_TYPE,
                                        items[ownerUUID].activeItems,
                                        items[ownerUUID].deletedItems);
        }
        return itemInfo.item.hist ? itemInfo.item.hist : {};
      }
    },
    itemToTask: function(item) {
      var ownerUUID = item.trans.owner;
      var deferred = $q.defer();
      if (items[ownerUUID].deletedItems.findFirstObjectByKeyValue('uuid', item.trans.uuid, 'trans')) {
        deferred.reject({type: 'deleted'});
      } else {
        TasksService.saveTask(item).then(function(/*result*/){
          removeActiveItem(item, ownerUUID);
          deferred.resolve(item);
        },function(failure){
          deferred.reject(failure);
        });
      }
      return deferred.promise;
    },
    itemToNote: function(item) {
      var ownerUUID = item.trans.owner;
      var deferred = $q.defer();
      if (items[ownerUUID].deletedItems.findFirstObjectByKeyValue('uuid', item.trans.uuid, 'trans')) {
        deferred.reject({type: 'deleted'});
      } else {
        // Copy item description as note content
        item.trans.content = item.trans.description;
        item.trans.description = undefined;
        NotesService.saveNote(item).then(function(/*result*/){
          removeActiveItem(item, ownerUUID);
          deferred.resolve(item);
        },function(failure){
          deferred.reject(failure);
        });
      }
      return deferred.promise;
    },
    itemToList: function(item) {
      var ownerUUID = item.trans.owner;
      var deferred = $q.defer();
      if (items[ownerUUID].deletedItems.findFirstObjectByKeyValue('uuid', item.trans.uuid, 'trans')) {
        deferred.reject({type: 'deleted'});
      } else {
        ListsService.saveList(item).then(function(/*result*/){
          removeActiveItem(item, ownerUUID);
          deferred.resolve(item);
        },function(failure){
          deferred.reject(failure);
        });
      }
      return deferred.promise;
    },
    clearItems: function() {
      items = {};
    },
    changeOwnerUUID: function(oldUUID, newUUID){
      if (items[oldUUID]){
        items[newUUID] = items[oldUUID];
        delete items[oldUUID];
        ItemLikeService.persistAndReset(items[newUUID].activeItems, ITEM_TYPE, newUUID, itemFieldInfos);
        ItemLikeService.persistAndReset(items[newUUID].deletedItems, ITEM_TYPE, newUUID, itemFieldInfos);
      }
    },
    resetOwnerData: function(ownerUUID){
      if (items[ownerUUID]){
        ItemLikeService.destroyPersistentItems(
          items[ownerUUID].activeItems.concat(items[ownerUUID].deletedItems));
        initializeArrays(ownerUUID);
      }
    },
    // Regular expressions for item requests
    putNewItemRegex: ItemLikeService.getPutNewRegex(ITEM_TYPE),
    putExistingItemRegex: ItemLikeService.getPutExistingRegex(ITEM_TYPE),
    deleteItemRegex: ItemLikeService.getDeleteRegex(ITEM_TYPE),
    undeleteItemRegex: ItemLikeService.getUndeleteRegex(ITEM_TYPE)
  };
}

ItemsService['$inject'] = ['$q', 'ArrayService', 'BackendClientService', 'ItemLikeService', 'ListsService',
  'NotesService', 'TagsService', 'TasksService', 'UISessionService', 'UserSessionService'];
angular.module('em.main').factory('ItemsService', ItemsService);
