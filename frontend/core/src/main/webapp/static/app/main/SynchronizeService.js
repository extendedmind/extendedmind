/* global angular, jQuery */
'use strict';

function SynchronizeService($q, $rootScope, UUIDService, BackendClientService, UserSessionService, ArrayService, TagsService, ListsService, TasksService, NotesService, ItemsService){

  var itemsRegex = /\/items/;
  var getItemsRegex = new RegExp(BackendClientService.apiPrefixRegex.source +
                   BackendClientService.uuidRegex.source +
                   itemsRegex.source);

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
    var latestItem = ItemsService.updateItems(response.items, ownerUUID);
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
          if (!ItemsService.updateItemProperties(request.params.uuid, properties, request.params.owner)){
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
        if (!ItemsService.updateItemProperties(oldUuid, properties, request.params.owner)){
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
        if (!ItemsService.updateItemProperties(request.params.uuid, properties, request.params.owner)){
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

  var getAllItemsOnline = function getAllItemsOnline(ownerUUID) {
    return BackendClientService.getSecondary('/api/' + ownerUUID + '/items', getItemsRegex, undefined, true).then(function(result) {
      if (result.data){
        var latestTag, latestList, latestTask, latestItem, latestNote;
        // Reset all arrays
        latestTag = TagsService.setTags(result.data.tags, ownerUUID);
        latestList = ListsService.setLists(result.data.lists, ownerUUID);
        latestTask = TasksService.setTasks(result.data.tasks, ownerUUID);
        latestNote = NotesService.setNotes(result.data.notes, ownerUUID);
        latestItem = ItemsService.setItems(result.data.items, ownerUUID);
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
        }, function(error){
          if (error.status === 403){
            // Got 403, need to go to login
            $rootScope.$emit('emException', {type: 'http', status: error.status, data: error.data, url: error.config.url});
          }else{
            // just resolve, because this command does not need to always succeed
            deferred.resolve();
          }
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
          }else if (error.status === 403){
            // Got 403, need to go to login
            $rootScope.$emit('emException', {type: 'http', status: error.status, data: error.data, url: error.config.url});
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
    // Regular expressions for item requests
    getItemsRegex: getItemsRegex
  };
}

SynchronizeService.$inject = ['$q', '$rootScope', 'UUIDService', 'BackendClientService', 'UserSessionService', 'ArrayService',
                           'TagsService', 'ListsService', 'TasksService', 'NotesService', 'ItemsService'];
angular.module('em.services').factory('SynchronizeService', SynchronizeService);
