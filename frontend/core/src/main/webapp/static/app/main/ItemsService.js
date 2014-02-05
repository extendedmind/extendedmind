/*global angular */
'use strict';

function ItemsService($q, BackendClientService, UserSessionService, ArrayService, TagsService, ListsService, TasksService){
  var items = {};

  var itemRegex = /\/item/;
  var itemSlashRegex = /\/item\//;
  var itemsRegex = /\/items/;

  function initializeArrays(ownerUUID){
    if (!items[ownerUUID]){
      items[ownerUUID] = {
        activeItems: [],
        deletedItems: [],
        recentlyUpgradedItems: []
      };
    }
  }

  function cleanRecentlyUpgradedItems(ownerUUID){
    if (items[ownerUUID]){
      // Loop through recently upgraded items and delete them from the items array
      for (var i=0, len=items[ownerUUID].recentlyUpgradedItems.length; i<len; i++) {
        var recentlyUpgradedItemIndex =
          items[ownerUUID].activeItems.findFirstIndexByKeyValue(
            'uuid', items[ownerUUID].recentlyUpgradedItems[i].uuid);
        if (recentlyUpgradedItemIndex !== undefined){
          items[ownerUUID].activeItems.splice(recentlyUpgradedItemIndex, 1);
        }
      }
      items[ownerUUID].recentlyUpgradedItems.length = 0;
    }
  }

  return {
    // Main method to synchronize all arrays with backend.
    synchronize: function(ownerUUID) {
      cleanRecentlyUpgradedItems(ownerUUID);
      var latestModified = UserSessionService.getLatestModified(ownerUUID);
      var url = '/api/' + ownerUUID + '/items';
      if (latestModified){
        url += '?modified=' + latestModified + '&deleted=true&archived=true&completed=true';
      }
      BackendClientService.get(url, this.getItemsRegex).then(function(result) {
        if (result.data){
          var latestTags, latestLists, latestTasks, latestItems;
          initializeArrays(ownerUUID);
          if (latestModified){
            // Only update modified
            latestTags = TagsService.updateTags(result.data.tags, ownerUUID);
            latestLists = ListsService.updateLists(result.data.lists, ownerUUID);
            latestTasks = TasksService.updateTasks(result.data.tasks, ownerUUID);
            latestItems = ArrayService.updateArrays(result.data.items,
              items[ownerUUID].activeItems,
              items[ownerUUID].deletedItems);
          }else{
            // Reset all arrays
            latestTags = TagsService.setTags(result.data.tags, ownerUUID);
            latestLists = ListsService.setLists(result.data.lists, ownerUUID);
            latestTasks = TasksService.setTasks(result.data.tasks, ownerUUID);
            latestItems = ArrayService.setArrays(result.data.items,
              items[ownerUUID].activeItems,
              items[ownerUUID].deletedItems);
          }
          if (latestTags || latestLists || latestTasks || latestItems){
            // Set latest modified
            latestModified = Math.max(
              isNaN(latestTags) ? -Infinity : latestTags,
              isNaN(latestLists) ? -Infinity : latestLists,
              isNaN(latestTasks) ? -Infinity : latestTasks,
              isNaN(latestItems) ? -Infinity : latestItems);
            UserSessionService.setLatestModified(latestModified, ownerUUID);
          }
        }
      });
    },
    getItems: function(ownerUUID) {
      initializeArrays(ownerUUID);
      return items[ownerUUID].activeItems;
    },
    getItemByUUID: function(uuid, ownerUUID) {
      return items[ownerUUID].activeItems.findFirstObjectByKeyValue('uuid', uuid);
    },
    saveItem: function(item, ownerUUID) {
      var deferred = $q.defer();
      cleanRecentlyUpgradedItems(ownerUUID);
      if (item.uuid){
        // Existing item
        BackendClientService.put('/api/' + ownerUUID + '/item/' + item.uuid,
                 this.putExistingItemRegex, item).then(function(result) {
          if (result.data){
            item.modified = result.data.modified;
            ArrayService.updateItem(item,
              items[ownerUUID].activeItems,
              items[ownerUUID].deletedItems);
            deferred.resolve(item);
          }
        });
      }else{
        // New item
        BackendClientService.put('/api/' + ownerUUID + '/item',
                 this.putNewItemRegex, item).then(function(result) {
          if (result.data){
            item.uuid = result.data.uuid;
            item.modified = result.data.modified;
            initializeArrays(ownerUUID);
            ArrayService.setItem(item,
              items[ownerUUID].activeItems,
              items[ownerUUID].deletedItems);
            deferred.resolve(item);
          }
        });
      }
      return deferred.promise;
    },
    deleteItem: function(item, ownerUUID) {
      cleanRecentlyUpgradedItems(ownerUUID);
      BackendClientService.delete('/api/' + ownerUUID + '/item/' + item.uuid,
               this.deleteItemRegex).then(function(result) {
        if (result.data){
          item.deleted = result.data.deleted;
          item.modified = result.data.result.modified;
          ArrayService.updateItem(item,
            items[ownerUUID].activeItems,
            items[ownerUUID].deletedItems);
        }
      });
    },
    undeleteItem: function(item, ownerUUID) {
      cleanRecentlyUpgradedItems(ownerUUID);
      BackendClientService.post('/api/' + ownerUUID + '/item/' + item.uuid + '/undelete',
               this.deleteItemRegex).then(function(result) {
        if (result.data){
          delete item.deleted;
          item.modified = result.data.modified;
          ArrayService.updateItem(item,
            items[ownerUUID].activeItems,
            items[ownerUUID].deletedItems);
        }
      });
    },
    itemToTask: function(item, ownerUUID) {
      cleanRecentlyUpgradedItems(ownerUUID);
      var index = items[ownerUUID].activeItems.findFirstIndexByKeyValue('uuid', item.uuid);
      if (index !== undefined) {
        // Save as task and add it to the recently upgraded items array
        TasksService.saveTask(item, ownerUUID);
        items[ownerUUID].recentlyUpgradedItems.push(item);
      }
    },
    completeItemToTask: function(item, ownerUUID) {
      cleanRecentlyUpgradedItems(ownerUUID);
    },
    // Regular expressions for item requests
    getItemsRegex:
        new RegExp(BackendClientService.apiPrefixRegex.source +
                   BackendClientService.uuidRegex.source +
                   itemsRegex.source),
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
  
ItemsService.$inject = ['$q', 'BackendClientService', 'UserSessionService', 'ArrayService', 'TagsService', 'ListsService', 'TasksService'];
angular.module('em.services').factory('ItemsService', ItemsService);