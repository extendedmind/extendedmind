'use strict';

function ItemsService($q, BackendClientService, UserSessionService, ArrayService, TagsService, ListsService, TasksService, NotesService){
  var items = {};

  var itemRegex = /\/item/;
  var itemSlashRegex = /\/item\//;
  var itemsRegex = /\/items/;

  function initializeArrays(ownerUUID){
    if (!items[ownerUUID]){
      items[ownerUUID] = {
        activeItems: [],
        deletedItems: []
      };
    }
  }

  // Register callbacks to BackendClientService 
  var synchronizeCallback = function(request, response) {
    console.log("synchronizeCallback");
  }
  var defaultCallback = function(request, response) {
    console.log("defaultCallback");
  }
  BackendClientService.registerSecondaryGetCallback(synchronizeCallback)
  BackendClientService.registerDefaultCallback(defaultCallback);

  return {
    // Main method to synchronize all arrays with backend.
    synchronize: function(ownerUUID) {
      var deferred = $q.defer();
      var latestModified = UserSessionService.getLatestModified(ownerUUID);
      var url = '/api/' + ownerUUID + '/items';
      if (latestModified){
        url += '?modified=' + latestModified + '&deleted=true&archived=true&completed=true';
      }
      BackendClientService.get(url, this.getItemsRegex).then(function(result) {
        if (result.data){
          var latestTag, latestList, latestTask, latestItem, latestNote;
          initializeArrays(ownerUUID);
          if (latestModified){
            // Only update modified
            latestTag = TagsService.updateTags(result.data.tags, ownerUUID);
            latestList = ListsService.updateLists(result.data.lists, ownerUUID);
            latestTask = TasksService.updateTasks(result.data.tasks, ownerUUID);
            latestNote = NotesService.updateNotes(result.data.notes, ownerUUID);
            latestItem = ArrayService.updateArrays(result.data.items,
              items[ownerUUID].activeItems,
              items[ownerUUID].deletedItems);
          }else{
            // Reset all arrays
            latestTag = TagsService.setTags(result.data.tags, ownerUUID);
            latestList = ListsService.setLists(result.data.lists, ownerUUID);
            latestTask = TasksService.setTasks(result.data.tasks, ownerUUID);
            latestNote = NotesService.setNotes(result.data.notes, ownerUUID);
            latestItem = ArrayService.setArrays(result.data.items,
              items[ownerUUID].activeItems,
              items[ownerUUID].deletedItems);
          }
          if (latestTag || latestList || latestTask || latestNote || latestItem){
            // Set latest modified
            latestModified = Math.max(
              isNaN(latestTag) ? -Infinity : latestTag,
              isNaN(latestList) ? -Infinity : latestList,
              isNaN(latestTask) ? -Infinity : latestTask,
              isNaN(latestNote) ? -Infinity : latestNote,
              isNaN(latestItem) ? -Infinity : latestItem);
            UserSessionService.setLatestModified(latestModified, ownerUUID);
          }
        }
        deferred.resolve();
      }, function() {
        deferred.reject();
      });
      return deferred.promise;
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
      var index = items[ownerUUID].activeItems.findFirstIndexByKeyValue('uuid', item.uuid);
      if (index !== undefined) {
        TasksService.saveTask(item, ownerUUID);
        items[ownerUUID].activeItems.splice(index, 1);
      }
    },
    itemToNote: function(item, ownerUUID) {
      var index = items[ownerUUID].activeItems.findFirstIndexByKeyValue('uuid', item.uuid);
      if (index !== undefined) {
        NotesService.saveNote(item, ownerUUID);
        items[ownerUUID].activeItems.splice(index, 1);
      }
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
  
ItemsService['$inject'] = ['$q', 'BackendClientService', 'UserSessionService', 'ArrayService',
                           'TagsService', 'ListsService', 'TasksService', 'NotesService'];
angular.module('em.services').factory('ItemsService', ItemsService);
