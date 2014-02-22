/* global angular, jQuery */
'use strict';

function ItemsService($q, $rootScope, UUIDService, BackendClientService, UserSessionService, ArrayService, TagsService, ListsService, TasksService, NotesService){
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

  function getLatestModified(latestTag, latestList, latestTask, latestNote, latestItem){
    return Math.max(
      isNaN(latestTag) ? -Infinity : latestTag,
      isNaN(latestList) ? -Infinity : latestList,
      isNaN(latestTask) ? -Infinity : latestTask,
      isNaN(latestNote) ? -Infinity : latestNote,
      isNaN(latestItem) ? -Infinity : latestItem);
  }

  function processSynchronizeUpdateResult(ownerUUID, response) {
    var latestTag = TagsService.updateTags(response.tags, ownerUUID);
    var latestList = ListsService.updateLists(response.lists, ownerUUID);
    var latestTask = TasksService.updateTasks(response.tasks, ownerUUID);
    var latestNote = NotesService.updateNotes(response.notes, ownerUUID);
    var latestItem = ArrayService.updateArrays(response.items,
      items[ownerUUID].activeItems,
      items[ownerUUID].deletedItems);
    if (latestTag || latestList || latestTask || latestNote || latestItem){
      // Set latest modified
      var latestModified = getLatestModified(latestTag, latestList, latestTask, latestNote, latestItem);
      UserSessionService.setLatestModified(latestModified, ownerUUID);
    }
  }

  // Register callbacks to BackendClientService 
  var synchronizeCallback = function(request, response /*, queue*/) {
    if (!jQuery.isEmptyObject(response)){
      // TODO: The entire offline queue should be evaluated to see, if
      //       something will fail. I.e. delete task on desktop, and try to
      //       complete it on offline mobile.
      var ownerUUID = request.params.owner;
      processSynchronizeUpdateResult(ownerUUID, response);
    }
  };
  var defaultCallback = function(request, response, queue) {
    // TODO: Make this better by not replacing the UUID and modified values 
    //       right away but instead creating a realUuid and realModified values
    //       that can be traded for the real ones on synchronize callback. That
    //       would ensure that when going online, the items don't change places
    //       and also (if using 'track by' with uuid+modified key in lists) no 
    //       unnecessary rendering would take place after online => faster UX.

    // Get the necessary information from the request
    if (request.content.method === 'post'){
      // TODO
    }else if (request.content.method === 'put'){
      var uuid, oldUuid;
      if (request.params.uuid){
        // Put existing
        oldUuid = request.params.uuid;
        uuid = oldUuid;
      }else{
        // New, there should be an uuid in the response and a fake one in the request
        if (!response.uuid){
          $rootScope.$emit('emException', {type: 'response', response: response, description: 'No uuid from server'});
          return;
        }else{
          oldUuid = request.params.fakeUUID;
          uuid = response.uuid;

          // Also update queue to replace all calls with the old fake uuid with the new one
          if (queue && queue.length > 0){
            for (var i=0, len=queue.length; i<len; i++) {
              if (queue[i].params.uuid === oldUuid){
                queue[i].params.uuid = uuid;
                queue[i].content.url = queue[i].content.url.replace(oldUuid,uuid);
              }
            }
          }
        }
      }

      if (request.params.type === 'item'){
        if (!ArrayService.updateItemUUIDAndModified(
                  oldUuid,
                  uuid,
                  response.modified,
                  items[request.params.owner].activeItems,
                  items[request.params.owner].deletedItems)){
          // The item might have moved to either notes or tasks
          if (!TasksService.updateTask(oldUuid, uuid, response.modified, request.params.owner)){
            if (!NotesService.updateNote(oldUuid, uuid, response.modified, request.params.owner)){
              $rootScope.$emit('emException', {type: 'response', response: response, description: 'Could not update item from with values from server'});
              return;              
            }
          }
        }
      }else if (request.params.type === 'task'){
        if (!TasksService.updateTask(oldUuid, uuid, response.modified, request.params.owner)){
          $rootScope.$emit('emException',
                {type: 'response',
                response: {uuid: newUuid, modified: newModified},
                description: 'Could not update task from with values from server'});
          return;
        };
      }else if (request.params.type === 'note'){
        
      }else if (request.params.type === 'tag'){
        
      }else if (request.params.type === 'list'){
        
      }

    }else if (request.content.method === 'delete'){
      
    }
  };
  BackendClientService.registerSecondaryGetCallback(synchronizeCallback);
  BackendClientService.registerDefaultCallback(defaultCallback);

  return {
    // Main method to synchronize all arrays with backend.
    synchronize: function(ownerUUID) {
      var deferred = $q.defer();
      var latestModified = UserSessionService.getLatestModified(ownerUUID);
      var url = '/api/' + ownerUUID + '/items';
      if (latestModified){
        url += '?modified=' + latestModified + '&deleted=true&archived=true&completed=true';
        if (UserSessionService.isOfflineEnabled()){
          // Push request to offline buffer
          BackendClientService.getSecondary(url, this.getItemsRegex, {owner: ownerUUID});
          deferred.resolve();
        }else{
          BackendClientService.get(url, this.getItemsRegex).then(function(result) {
            if (result.data){
              processSynchronizeUpdateResult(ownerUUID, result.data);
            }
            deferred.resolve();
          });
        }
      }else {
        BackendClientService.get(url, this.getItemsRegex).then(function(result) {
          if (result.data){
            var latestTag, latestList, latestTask, latestItem, latestNote;
            initializeArrays(ownerUUID);
            // Reset all arrays
            latestTag = TagsService.setTags(result.data.tags, ownerUUID);
            latestList = ListsService.setLists(result.data.lists, ownerUUID);
            latestTask = TasksService.setTasks(result.data.tasks, ownerUUID);
            latestNote = NotesService.setNotes(result.data.notes, ownerUUID);
            latestItem = ArrayService.setArrays(result.data.items,
              items[ownerUUID].activeItems,
              items[ownerUUID].deletedItems);
            if (latestTag || latestList || latestTask || latestNote || latestItem){
              // Set latest modified
              latestModified = getLatestModified(latestTag, latestList, latestTask, latestNote, latestItem);
              UserSessionService.setLatestModified(latestModified, ownerUUID);
            }
          }
          deferred.resolve();
        }, function() {
          deferred.reject();
        });
      }
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
      var params;
      if (item.uuid){
        // Existing item
        if (UserSessionService.isOfflineEnabled()){
          // Push to offline buffer
          params = {type: 'item', owner: ownerUUID, uuid: item.uuid};
          BackendClientService.put('/api/' + params.owner + '/item/' + item.uuid,
                   this.putNewItemRegex, params, item);
          item.modified = (new Date()).getTime() + 1000000;
          ArrayService.updateItem(item,
            items[ownerUUID].activeItems,
            items[ownerUUID].deletedItems);
          deferred.resolve(item);
        } else{
          // Online
          BackendClientService.putOnline('/api/' + ownerUUID + '/item/' + item.uuid,
                   this.putExistingItemRegex, item).then(function(result) {
            if (result.data){
              item.modified = result.data.modified;
              ArrayService.updateItem(item,
                items[ownerUUID].activeItems,
                items[ownerUUID].deletedItems);
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
          item.modified = (new Date()).getTime() + 1000000;
          initializeArrays(ownerUUID);
          ArrayService.setItem(item,
            items[ownerUUID].activeItems,
            items[ownerUUID].deletedItems);
          deferred.resolve(item);
        } else{
          // Online
          BackendClientService.putOnline('/api/' + ownerUUID + '/item',
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
      }
      return deferred.promise;
    },
    deleteItem: function(item, ownerUUID) {
      if (UserSessionService.isOfflineEnabled()){
        // Offline
        var params = {type: 'item', owner: ownerUUID, uuid: item.uuid,
                      reverse: {
                        method: 'post',
                        url: '/api/' + ownerUUID + '/item/' + item.uuid + '/undelete'
                      }};
        BackendClientService.delete('/api/' + ownerUUID + '/item/' + item.uuid,
                 this.deleteItemRegex, params);
        var fakeTimestamp = (new Date()).getTime() + 1000000;
        item.deleted = fakeTimestamp;
        item.modified = fakeTimestamp;
        ArrayService.updateItem(item,
          items[ownerUUID].activeItems,
          items[ownerUUID].deletedItems);
      }else {
        // Online
        BackendClientService.deleteOnline('/api/' + ownerUUID + '/item/' + item.uuid,
                 this.deleteItemRegex).then(function(result) {
          if (result.data){
            item.deleted = result.data.deleted;
            item.modified = result.data.result.modified;
            ArrayService.updateItem(item,
              items[ownerUUID].activeItems,
              items[ownerUUID].deletedItems);
          }
        });
      }
    },
    undeleteItem: function(item, ownerUUID) {
      if (UserSessionService.isOfflineEnabled()){
        // Offline
        var params = {type: 'item', owner: ownerUUID, uuid: item.uuid};
        BackendClientService.post('/api/' + ownerUUID + '/item/' + item.uuid + '/undelete',
                 this.deleteItemRegex, params);
        delete item.deleted;
        ArrayService.updateItem(item,
          items[ownerUUID].activeItems,
          items[ownerUUID].deletedItems);
      }else{
        // Online
        BackendClientService.postOnline('/api/' + ownerUUID + '/item/' + item.uuid + '/undelete',
                 this.deleteItemRegex).then(function(result) {
          if (result.data){
            delete item.deleted;
            item.modified = result.data.modified;
            ArrayService.updateItem(item,
              items[ownerUUID].activeItems,
              items[ownerUUID].deletedItems);
          }
        });
      }
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
  
ItemsService.$inject = ['$q', '$rootScope', 'UUIDService', 'BackendClientService', 'UserSessionService', 'ArrayService',
                           'TagsService', 'ListsService', 'TasksService', 'NotesService'];
angular.module('em.services').factory('ItemsService', ItemsService);
