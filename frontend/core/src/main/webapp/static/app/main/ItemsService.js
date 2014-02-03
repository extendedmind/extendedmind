/*global angular */
'use strict';

function ItemsService(BackendClientService, UserSessionService, ArrayService, TagsService, ListsService, TasksService){
  var items = [];
  var deletedItems = [];
  var recentlyUpgradedItems = [];

  var itemRegex = /\/item/;
  var itemSlashRegex = /\/item\//;
  var itemsRegex = /\/items/;

  function cleanRecentlyUpgradedItems(){
    // Loop through recently upgraded items and delete them from the items array
    for (var i=0, len=recentlyUpgradedItems.length; i<len; i++) {
      var recentlyUpgradedItemIndex = items.findFirstIndexByKeyValue('uuid', recentlyUpgradedItems[i].uuid);
      if (recentlyUpgradedItemIndex !== undefined){
        items.splice(recentlyUpgradedItemIndex, 1);
      }
    }
    recentlyUpgradedItems.length = 0;
  }

  return {
    // Main method to synchronize all arrays with backend.
    synchronize: function() {
      cleanRecentlyUpgradedItems();
      var latestModified = UserSessionService.getLatestModified();
      var url = '/api/' + UserSessionService.getActiveUUID() + '/items';
      if (latestModified){
        url += '?modified=' + latestModified + '&deleted=true&archived=true&completed=true';
      }
      BackendClientService.get(url, this.getItemsRegex).then(function(result) {
        if (result.data){
          var latestTags, latestLists, latestTasks, latestItems;
          if (latestModified){
            // Only update modified
            latestTags = TagsService.updateTags(result.data.tags);
            latestLists = ListsService.updateLists(result.data.lists);
            latestTasks = TasksService.updateTasks(result.data.tasks);
            latestItems = ArrayService.updateArrays(result.data.items, items, deletedItems);
          }else{
            // Reset all arrays
            latestTags = TagsService.setTags(result.data.tags);
            latestLists = ListsService.setLists(result.data.lists);
            latestTasks = TasksService.setTasks(result.data.tasks);
            latestItems = ArrayService.setArrays(result.data.items, items, deletedItems);
          }
          if (latestTags || latestLists || latestTasks || latestItems){
            // Set latest modified
            latestModified = Math.max(
              isNaN(latestTags) ? -Infinity : latestTags,
              isNaN(latestLists) ? -Infinity : latestLists,
              isNaN(latestTasks) ? -Infinity : latestTasks,
              isNaN(latestItems) ? -Infinity : latestItems);
            UserSessionService.setLatestModified(latestModified);
          }
        }
      });
    },
    getItems: function() {
      return items;
    },
    getItemByUUID: function(uuid) {
      return items.findFirstObjectByKeyValue('uuid', uuid);
    },
    saveItem: function(item) {
      cleanRecentlyUpgradedItems();
      if (item.uuid){
        // Existing item
        BackendClientService.put('/api/' + UserSessionService.getActiveUUID() + '/item/' + item.uuid,
                 this.putExistingItemRegex, item).then(function(result) {
          if (result.data){
            item.modified = result.data.modified;
            ArrayService.updateItem(item, items, deletedItems);
          }
        });
      }else{
        // New item
        BackendClientService.put('/api/' + UserSessionService.getActiveUUID() + '/item',
                 this.putNewItemRegex, item).then(function(result) {
          if (result.data){
            item.uuid = result.data.uuid;
            item.modified = result.data.modified;
            ArrayService.setItem(item, items, deletedItems);
          }
        });
      }
    },
    deleteItem: function(item) {
      cleanRecentlyUpgradedItems();
      BackendClientService.delete('/api/' + UserSessionService.getActiveUUID() + '/item/' + item.uuid,
               this.deleteItemRegex).then(function(result) {
        if (result.data){
          item.deleted = result.data.deleted;
          item.modified = result.data.result.modified;
          ArrayService.updateItem(item, items, deletedItems);
        }
      });
    },
    undeleteItem: function(item) {
      cleanRecentlyUpgradedItems();
      BackendClientService.post('/api/' + UserSessionService.getActiveUUID() + '/item/' + item.uuid + '/undelete',
               this.deleteItemRegex).then(function(result) {
        if (result.data){
          delete item.deleted;
          item.modified = result.data.modified;
          ArrayService.updateItem(item, items, deletedItems);
        }
      });
    },
    itemToTask: function(item) {
      cleanRecentlyUpgradedItems();
      var index = items.findFirstIndexByKeyValue('uuid', item.uuid);
      if (index !== undefined) {
        // Save as task and add it to the recently upgraded items array
        TasksService.saveTask(item);
        recentlyUpgradedItems.push(item);
      }
    },
    completeItemToTask: function(item) {
      cleanRecentlyUpgradedItems();
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
  
ItemsService.$inject = ['BackendClientService', 'UserSessionService', 'ArrayService', 'TagsService', 'ListsService', 'TasksService'];
angular.module('em.services').factory('ItemsService', ItemsService);