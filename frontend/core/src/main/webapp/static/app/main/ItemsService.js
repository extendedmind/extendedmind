/* global angular*/
'use strict';

function ItemsService($q, $rootScope, UUIDService, BackendClientService, UserSessionService, ArrayService, TagsService, ListsService, TasksService, NotesService){
  var items = {};

  var itemRegex = /\/item/;
  var itemSlashRegex = /\/item\//;

  function initializeArrays(ownerUUID){
    if (!items[ownerUUID]){
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

  function setItem(item, ownerUUID){
    initializeArrays(ownerUUID);
    return ArrayService.setItem(item,
      items[ownerUUID].activeItems,
      items[ownerUUID].deletedItems);
  }

  return {
    setItems: function(itemsResponse, ownerUUID) {
      initializeArrays(ownerUUID);
      return ArrayService.setArrays(itemsResponse,
          items[ownerUUID].activeItems,
          items[ownerUUID].deletedItems);
    },
    updateItems: function(itemsResponse, ownerUUID) {
      initializeArrays(ownerUUID);
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
      if (items[ownerUUID].deletedItems.indexOf(item) > -1){
        deferred.reject(item);
      }else if (item.uuid){
        // Existing item
        if (UserSessionService.isOfflineEnabled()){
          // Push to offline buffer
          params = {type: 'item', owner: ownerUUID, uuid: item.uuid};
          BackendClientService.put('/api/' + params.owner + '/item/' + item.uuid,
                   this.putNewItemRegex, params, item);
          item.modified = (new Date()).getTime() + 1000000;
          updateItem(item, ownerUUID);
          deferred.resolve(item);
        } else{
          // Online
          BackendClientService.putOnline('/api/' + ownerUUID + '/item/' + item.uuid,
                   this.putExistingItemRegex, item).then(function(result) {
            if (result.data){
              item.modified = result.data.modified;
              updateItem(item, ownerUUID);
              deferred.resolve(item);
            }
          });
        }
      }else{
        // New item
        if (UserSessionService.isOfflineEnabled()){
          // Push to offline queue with fake UUID
          var fakeUUID = UUIDService.generateFakeUUID();
          params = {type: 'item', owner: ownerUUID, fakeUUID: fakeUUID};
          BackendClientService.put('/api/' + params.owner + '/item',
                   this.putNewItemRegex, params, item);
          // Use the fake uuid and a fake modified that is far enough in the to make
          // it to the end of the list
          item.uuid = fakeUUID;
          item.created = item.modified = (new Date()).getTime() + 1000000;
          setItem(item, ownerUUID);
          deferred.resolve(item);
        } else{
          // Online
          BackendClientService.putOnline('/api/' + ownerUUID + '/item',
                 this.putNewItemRegex, item).then(function(result) {
            if (result.data){
              item.uuid = result.data.uuid;
              item.created = result.data.created;
              item.modified = result.data.modified;
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
      if (items[ownerUUID].deletedItems.indexOf(item) > -1){
        return;
      }
      if (UserSessionService.isOfflineEnabled()){
        // Offline
        var params = {type: 'item', owner: ownerUUID, uuid: item.uuid,
                      reverse: {
                        method: 'post',
                        url: '/api/' + ownerUUID + '/item/' + item.uuid + '/undelete'
                      }};
        BackendClientService.deleteOffline('/api/' + ownerUUID + '/item/' + item.uuid,
                 this.deleteItemRegex, params);
        var fakeTimestamp = (new Date()).getTime() + 1000000;
        item.deleted = fakeTimestamp;
        item.modified = fakeTimestamp;
        updateItem(item, ownerUUID);
      }else {
        // Online
        BackendClientService.deleteOnline('/api/' + ownerUUID + '/item/' + item.uuid,
                 this.deleteItemRegex).then(function(result) {
          if (result.data){
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
      if (items[ownerUUID].deletedItems.indexOf(item) === -1){
        return;
      }
      if (UserSessionService.isOfflineEnabled()){
        // Offline
        var params = {type: 'item', owner: ownerUUID, uuid: item.uuid};
        BackendClientService.post('/api/' + ownerUUID + '/item/' + item.uuid + '/undelete',
                 this.deleteItemRegex, params);
        delete item.deleted;
        updateItem(item, ownerUUID);
      }else{
        // Online
        BackendClientService.postOnline('/api/' + ownerUUID + '/item/' + item.uuid + '/undelete',
                 this.deleteItemRegex).then(function(result) {
          if (result.data){
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
      if (items[ownerUUID].deletedItems.indexOf(item) > -1){
        return;
      }
      var index = items[ownerUUID].activeItems.findFirstIndexByKeyValue('uuid', item.uuid);
      if (index !== undefined) {
        TasksService.saveTask(item, ownerUUID);
        items[ownerUUID].activeItems.splice(index, 1);
      }
    },
    itemToNote: function(item, ownerUUID) {
      initializeArrays(ownerUUID);
      // Check that item is not deleted before trying to turn it into a note
      if (items[ownerUUID].deletedItems.indexOf(item) > -1){
        return;
      }
      var index = items[ownerUUID].activeItems.findFirstIndexByKeyValue('uuid', item.uuid);
      if (index !== undefined) {
        NotesService.saveNote(item, ownerUUID);
        items[ownerUUID].activeItems.splice(index, 1);
      }
    },
    itemToList: function(item, ownerUUID) {
      initializeArrays(ownerUUID);
      // Check that item is not deleted before trying to turn it into a list
      if (items[ownerUUID].deletedItems.indexOf(item) > -1){
        return;
      }

      var index = items[ownerUUID].activeItems.findFirstIndexByKeyValue('uuid', item.uuid);
      if (index !== undefined) {
        // Save as list and remove from the activeItems array
        ListsService.saveList(item, ownerUUID);
        items[ownerUUID].activeItems.splice(index, 1);
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
                   BackendClientService.uuidRegex.source  +
                   BackendClientService.undeleteRegex.source),
  };
}

ItemsService.$inject = ['$q', '$rootScope', 'UUIDService', 'BackendClientService', 'UserSessionService', 'ArrayService',
                           'TagsService', 'ListsService', 'TasksService', 'NotesService'];
angular.module('em.services').factory('ItemsService', ItemsService);
