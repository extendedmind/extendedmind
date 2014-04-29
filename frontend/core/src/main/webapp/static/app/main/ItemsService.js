/* global angular, jQuery */
'use strict';

function ItemsService($q, $rootScope, UUIDService, BackendClientService, UserSessionService, ArrayService, TagsService, ListsService, TasksService, NotesService){
  var items = {};

  var itemRegex = /\/item/;
  var itemSlashRegex = /\/item\//;
  var itemsRegex = /\/items/;
  var getItemsRegex = new RegExp(BackendClientService.apiPrefixRegex.source +
                   BackendClientService.uuidRegex.source +
                   itemsRegex.source);

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
    var latestModified = null;
    if (latestTag || latestList || latestTask || latestNote || latestItem){
      // Set latest modified
      latestModified = getLatestModified(latestTag, latestList, latestTask, latestNote, latestItem);
    }
    UserSessionService.setLatestModified(latestModified, ownerUUID);
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
  // Handles response from backend where offline buffer has been used
  var defaultCallback = function(request, response, queue) {
    var properties;
    // Get the necessary information from the request
    // ****
    // POST
    // ****
    if (request.content.method === 'post'){
      if (request.params.type === 'item'){
        if (request.content.url.endsWith('/undelete')){
          // Undelete
          properties = {modified: response.modified};
          if (!ArrayService.updateItemProperties(
                    request.params.uuid,
                    properties,
                    items[request.params.owner].activeItems,
                    items[request.params.owner].deletedItems)){
            // The item might have moved to either notes or tasks
            if (!TasksService.updateTaskProperties(request.params.uuid, properties, request.params.owner)){
              if (!NotesService.updateNoteProperties(request.params.uuid, properties, request.params.owner)){
                $rootScope.$emit('emException', {type: 'response', response: response,
                          description: 'Could not update undeleted item with values from server'});
                return;
              }
            }
          }
        }
      }else if (request.params.type === 'task'){
        if (request.content.url.endsWith('/undelete') || request.content.url.endsWith('/uncomplete')){
          // Undelete or uncomplete: only modified changes
          properties = {modified: response.modified};
        }else if (request.content.url.endsWith('/complete')){
          // Complete
          properties = {completed: response.completed, modified: response.result.modified};
        }
        if (!TasksService.updateTaskProperties(request.params.uuid, properties, request.params.owner)){
          $rootScope.$emit('emException', {type: 'response', response: response,
                    description: 'Could not update modified task with values from server'});
          return;
        }
      }else if (request.params.type === 'note'){
        if (request.content.url.endsWith('/undelete')){
          properties = {modified: response.modified};
          if (!NotesService.updateNoteProperties(request.params.uuid, properties, request.params.owner)){
            $rootScope.$emit('emException', {type: 'response', response: response,
                      description: 'Could not update undeleted note with values from server'});
            return;
          }
        }
      }
    // ***
    // PUT
    // ***
    }else if (request.content.method === 'put'){
      // TODO: Make this better by not replacing the UUID and modified values
      //       right away but instead creating a realUuid and realModified values
      //       that can be traded for the real ones on synchronize callback. That
      //       would ensure that when going online, the items don't change places
      //       and also (if using 'track by' with uuid+modified key in lists) no
      //       unnecessary rendering would take place after online => faster UX.
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

      properties = {uuid: uuid, modified: response.modified};
      if (request.params.type === 'item'){
        if (!ArrayService.updateItemProperties(
                  oldUuid,
                  properties,
                  items[request.params.owner].activeItems,
                  items[request.params.owner].deletedItems)){
          // The item might have moved to either notes or tasks
          if (!TasksService.updateTaskProperties(oldUuid, properties, request.params.owner)){
            if (!NotesService.updateNoteProperties(oldUuid, properties, request.params.owner)){
              $rootScope.$emit('emException', {type: 'response', response: response,
                              description: 'Could not update item with values from server'});
              return;
            }
          }
        }
      }else if (request.params.type === 'task'){
        if (!TasksService.updateTaskProperties(oldUuid, properties, request.params.owner)){
          $rootScope.$emit('emException',
                {type: 'response',
                response: response,
                description: 'Could not update task with values from server'});
          return;
        }
      }else if (request.params.type === 'note'){
        if (!NotesService.updateNoteProperties(oldUuid, properties, request.params.owner)){
          $rootScope.$emit('emException',
                {type: 'response',
                response: response,
                description: 'Could not update note with values from server'});
          return;
        }
      }
    // ******
    // DELETE
    // ******
    }else if (request.content.method === 'delete'){
      properties = {deleted: response.deleted, modified: response.result.modified};
      if (request.params.type === 'item'){
        if (!ArrayService.updateItemProperties(
                  request.params.uuid,
                  properties,
                  items[request.params.owner].activeItems,
                  items[request.params.owner].deletedItems)){
          // The item might have moved to either notes or tasks
          if (!TasksService.updateTaskProperties(request.params.uuid, properties, request.params.owner)){
            if (!NotesService.updateNoteProperties(request.params.uuid, properties, request.params.owner)){
              $rootScope.$emit('emException', {type: 'response', response: response,
                        description: 'Could not update deleted item with values from server'});
              return;
            }
          }
        }
      }else if (request.params.type === 'task'){
        if (!TasksService.updateTaskProperties(request.params.uuid, properties, request.params.owner)){
          $rootScope.$emit('emException', {type: 'response', response: response,
                    description: 'Could not update deleted task with values from server'});
          return;
        }
      }else if (request.params.type === 'note'){
        if (!NotesService.updateNoteProperties(request.params.uuid, properties, request.params.owner)){
          $rootScope.$emit('emException', {type: 'response', response: response,
                    description: 'Could not update deleted note with values from server'});
          return;
        }
      }
    }
  };
  BackendClientService.registerSecondaryGetCallback(synchronizeCallback);
  BackendClientService.registerDefaultCallback(defaultCallback);

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

  var getAllItemsOnline = function getAllItemsOnline(ownerUUID) {
    return BackendClientService.getSecondary('/api/' + ownerUUID + '/items', getItemsRegex, undefined, true).then(function(result) {
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
        var latestModified = null;
        if (latestTag || latestList || latestTask || latestNote || latestItem){
          // Set latest modified
          latestModified = getLatestModified(latestTag, latestList, latestTask, latestNote, latestItem);
        }
        UserSessionService.setLatestModified(latestModified, ownerUUID);
      }
      return result;
    });
  };

  var synchronize = function(ownerUUID) {
    var deferred = $q.defer();
    var latestModified = UserSessionService.getLatestModified(ownerUUID);
    var url = '/api/' + ownerUUID + '/items';
    if (latestModified !== undefined){
      if (latestModified){
        url += '?modified=' + latestModified + '&deleted=true&archived=true&completed=true';
      }
      if (UserSessionService.isOfflineEnabled()){
        // Push request to offline buffer
        BackendClientService.getSecondary(url, getItemsRegex, {owner: ownerUUID});
        deferred.resolve();
      }else{
        BackendClientService.get(url, getItemsRegex).then(function(result) {
          if (result.data){
            processSynchronizeUpdateResult(ownerUUID, result.data);
          }
          deferred.resolve();
        }, function(/*error*/){
          // just resolve, because this command does not need to always succeed
          deferred.resolve();
        });
      }
    }else {
      getAllItemsOnline(ownerUUID).then(
        function(result){
          deferred.resolve();
          return result;
        },
        function(error) {
          if (BackendClientService.isOffline(error.status)){
            // Emit online required exception
            $rootScope.$emit('emException', {
              type: 'onlineRequired',
              status: error.status,
              data: error.data,
              retry: getAllItemsOnline,
              retryParam: ownerUUID,
              promise: deferred
            });
          }
        });
    }
    return deferred.promise;
  };

  return {
    // Main method to synchronize all arrays with backend.
    synchronize: function(ownerUUID) {
      return synchronize(ownerUUID);
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
          item.modified = (new Date()).getTime() + 1000000;
          setItem(item, ownerUUID);
          deferred.resolve(item);
        } else{
          // Online
          BackendClientService.putOnline('/api/' + ownerUUID + '/item',
                 this.putNewItemRegex, item).then(function(result) {
            if (result.data){
              item.uuid = result.data.uuid;
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
    // Regular expressions for item requests
    getItemsRegex: getItemsRegex,
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
