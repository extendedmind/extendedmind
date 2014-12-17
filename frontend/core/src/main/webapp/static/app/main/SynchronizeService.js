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

 /* global angular, jQuery */
 'use strict';

 function SynchronizeService($q, $rootScope, BackendClientService, ItemsService, ListsService,
                             NotesService, TagsService, TasksService, UserService, UserSessionService) {

  var itemsRegex = /\/items/;
  var getItemsRegex = new RegExp(BackendClientService.apiPrefixRegex.source +
   BackendClientService.uuidRegex.source +
   itemsRegex.source);

  function getLatestModified(latestTag, latestList, latestTask, latestNote, latestItem) {
    return Math.max(
      isNaN(latestTag) ? -Infinity : latestTag,
      isNaN(latestList) ? -Infinity : latestList,
      isNaN(latestTask) ? -Infinity : latestTask,
      isNaN(latestNote) ? -Infinity : latestNote,
      isNaN(latestItem) ? -Infinity : latestItem);
  }

  function getLocallyDifferentType(ownerUUID, item, itemType){
    switch(itemType) {
    case 'item':
      if (TasksService.getTaskInfo(item.uuid, ownerUUID)) return 'task';
      if (NotesService.getNoteInfo(item.uuid, ownerUUID)) return 'note';
      if (ListsService.getListInfo(item.uuid, ownerUUID)) return 'list';
      break;
    case 'task':
      if (ItemsService.getItemInfo(item.uuid, ownerUUID)) return 'item';
      if (NotesService.getNoteInfo(item.uuid, ownerUUID)) return 'note';
      if (ListsService.getListInfo(item.uuid, ownerUUID)) return 'list';
      break;
    case 'note':
      if (ItemsService.getItemInfo(item.uuid, ownerUUID)) return 'item';
      if (TasksService.getTaskInfo(item.uuid, ownerUUID)) return 'task';
      if (ListsService.getListInfo(item.uuid, ownerUUID)) return 'list';
      break;
    case 'list':
      if (ItemsService.getItemInfo(item.uuid, ownerUUID)) return 'item';
      if (TasksService.getTaskInfo(item.uuid, ownerUUID)) return 'task';
      if (NotesService.getNoteInfo(item.uuid, ownerUUID)) return 'note';
      break;
    }
  }

  function removeItemFromArray(ownerUUID, item, itemType){
    switch(itemType) {
    case 'item':
      ItemsService.removeItem(item, ownerUUID);
      break;
    case 'task':
      TasksService.removeTask(item, ownerUUID);
      break;
    case 'note':
      NotesService.removeNote(item, ownerUUID);
      break;
    case 'list':
      ListsService.removeList(item, ownerUUID);
      break;
    }
  }

  function removeItemsFromWrongArrays(ownerUUID, items, itemType){
    var locallyDifferentType;
    for (var i = 0, len = items.length; i < len; i++){
      locallyDifferentType = getLocallyDifferentType(ownerUUID, items[i], itemType);
      if (locallyDifferentType) removeItemFromArray(ownerUUID, items[i], locallyDifferentType)
    }
  }

  function processSynchronizeUpdateResult(ownerUUID, response) {
    var latestTag = TagsService.updateTags(response.tags, ownerUUID);
    var latestList, latestTask, latestNote, latestItem;
    if (response.lists && response.lists.length){
      removeItemsFromWrongArrays(ownerUUID, response.lists, 'list');
      latestList = ListsService.updateLists(response.lists, ownerUUID);
    }
    if (response.tasks && response.tasks.length){
      removeItemsFromWrongArrays(ownerUUID, response.tasks, 'task');
      latestTask = TasksService.updateTasks(response.tasks, ownerUUID);
    }
    if (response.notes && response.notes.length){
      removeItemsFromWrongArrays(ownerUUID, response.notes, 'note');
      latestNote = NotesService.updateNotes(response.notes, ownerUUID);
    }
    if (response.items && response.items.length){
      removeItemsFromWrongArrays(ownerUUID, response.items, 'item');
      latestItem = ItemsService.updateItems(response.items, ownerUUID);
    }

    var latestModified = null;
    if (latestTag || latestList || latestTask || latestNote || latestItem) {
      // Set latest modified
      latestModified = getLatestModified(latestTag, latestList, latestTask, latestNote, latestItem);
    }
    UserSessionService.setLatestModified(latestModified, ownerUUID);
  }

  function getItemFromResponse(response, uuid, itemType){
    switch(itemType) {
    case 'item':
      if (response.items && response.items.length){
        return response.items.findFirstObjectByKeyValue('uuid', uuid);
      }
      break;
    case 'task':
      if (response.tasks && response.tasks.length){
        return response.tasks.findFirstObjectByKeyValue('uuid', uuid);
      }
      break;
    case 'note':
      if (response.notes && response.notes.length){
        return response.notes.findFirstObjectByKeyValue('uuid', uuid);
      }
      break;
    case 'list':
      if (response.lists && response.lists.length){
        return response.lists.findFirstObjectByKeyValue('uuid', uuid);
      }
      break;
    case 'tag':
      if (response.tags && response.tags.length){
        return response.tags.findFirstObjectByKeyValue('uuid', uuid);
      }
      break;
    }
  }

  // Register callbacks to BackendClientService
  function synchronizeCallback(request, response, queue) {
    if (!jQuery.isEmptyObject(response)) {
      if (queue && queue.length){
        for (var i = queue.length-1; i >= 0; i--){
          var conflictingItem =
            getItemFromResponse(response,
                                queue[i].params.uuid,
                                queue[i].params.type);
          if (conflictingItem){

            if (conflictingItem.deleted){
              // Deleted elsewhere overrides everything
              queue.splice(i, 1);
            }else if (queue[i].content.method === 'put'){
              if (queue[i].params.type === 'note' &&
                  queue[i].content.data.content && queue[i].content.data.content.length &&
                  conflictingItem.content && conflictingItem.content.length &&
                  queue[i].content.data.content !== conflictingItem.content){
                // Content conflict, create hybrid and change PUT in queue to reflect the change
                var conflictDelimiter = '\n\n>>> conflicting changes >>>\n\n';
                if (conflictingItem.modified > queue[i].content.timestamp){
                  conflictingItem.content = conflictingItem.content +
                                            conflictDelimiter +
                                            queue[i].content.data.content;
                  queue[i].content.data = conflictingItem;
                }else{
                  var conflictedContent = queue[i].content.data.content +
                                            conflictDelimiter +
                                            conflictingItem.content;
                  queue[i].content.data.content = conflictedContent;
                  conflictingItem.content = conflictedContent;
                }
              }else if (conflictingItem.modified > queue[i].content.timestamp){
                queue.splice(i, 1);
              }
            }else if (queue[i].content.method === 'post'){
              if (queue[i].content.url.endsWith('/complete') && conflictingItem.completed){
                queue.splice(i, 1);
                // Need to change completed value to make sure mod is deleted on update
                TasksService.updateTaskProperties(conflictingItem.uuid,
                                                  {modified: conflictingItem.modified,
                                                  completed: conflictingItem.completed},
                                                  request.params.owner);
              }else if (queue[i].content.url.endsWith('/uncomplete') && !conflictingItem.completed){
                queue.splice(i, 1);
              }else if (queue[i].content.url.endsWith('/favorite') && conflictingItem.completed){
                // Need to change completed value to make sure mod is deleted on update
                NotesService.updateNoteProperties(conflictingItem.uuid,
                                                  {modified: conflictingItem.modified,
                                                  favorited: conflictingItem.favorited},
                                                  request.params.owner);
                queue.splice(i, 1);
              }else if (queue[i].content.url.endsWith('/unfavorite') && !conflictingItem.completed){
                queue.splice(i, 1);
              }
            }
          }
        }
      }
      var ownerUUID = request.params.owner;
      processSynchronizeUpdateResult(ownerUUID, response);
    }
  }

  function synchronizeUserAccountCallback(request, response /*, queue*/) {
    // TODO: We should find from the offline queue whether there is a
    //       putAccount that comes after this. Currently the response here is just overwritten!
    storeUserAccountResponse(response);
  }

  function storeUserAccountResponse(accountResponse){
    if (!jQuery.isEmptyObject(accountResponse) && accountResponse && accountResponse.data){
      UserSessionService.setEmail(accountResponse.data.email);
      UserSessionService.setUserModified(accountResponse.data.modified);
      UserSessionService.setTransportPreferences(accountResponse.data.preferences);
    }
  }

  // Handles response from backend where offline buffer has been used
  function defaultCallback(request, response, queue) {
    var properties;
    // Get the necessary information from the request
    // ****
    // POST
    // ****
    if (request.content.method === 'post') {
      if (request.params.type === 'item') {
        if (request.content.url.endsWith('/undelete')) {
          // Undelete
          properties = {modified: response.modified, deleted: undefined};
          if (!ItemsService.updateItemProperties(request.params.uuid, properties, request.params.owner)) {
            // The item might have moved to either notes or tasks
            if (!TasksService.updateTaskProperties(request.params.uuid, properties, request.params.owner)) {
              if (!NotesService.updateNoteProperties(request.params.uuid, properties, request.params.owner)) {
                $rootScope.$emit('emException',
                                 {type: 'response',
                                 value: {
                                  response: response,
                                  description: 'Could not update undeleted item with values from server'
                                }});
                return;
              }
            }
          }
        }
      } else if (request.params.type === 'task') {
        if (request.content.url.endsWith('/undelete') || request.content.url.endsWith('/uncomplete')) {
          // Undelete or uncomplete: only modified changes
          properties = {modified: response.modified};
        } else if (request.content.url.endsWith('/complete')) {
          // Complete
          properties = {completed: response.completed, modified: response.result.modified};
        }
        if (!TasksService.updateTaskProperties(request.params.uuid, properties, request.params.owner)) {
          $rootScope.$emit('emException',
                           {type: 'response',
                           value: {
                            response: response,
                            description: 'Could not update modified task with values from server'
                          }});
          return;
        }
      } else if (request.params.type === 'note') {
        if (request.content.url.endsWith('/undelete')  || request.content.url.endsWith('/unfavorite')) {
          properties = {modified: response.modified};
        }else if (request.content.url.endsWith('/favorite')) {
          // Favorite
          properties = {favorited: response.favorited, modified: response.result.modified};
        }
        if (!NotesService.updateNoteProperties(request.params.uuid, properties, request.params.owner)) {
          $rootScope.$emit('emException',
                           {type: 'response',
                           value: {
                            response: response,
                            description: 'Could not update modified note with values from server'
                          }});
          return;
        }
      }
    // ***
    // PUT
    // ***
  } else if (request.content.method === 'put') {
      var uuid, oldUuid;
      if (request.params.uuid) {
        // Put existing
        oldUuid = request.params.uuid;
        uuid = oldUuid;
      } else {
        // New, there should be an uuid in the response and a fake one in the request
        if (!response.uuid) {
          $rootScope.$emit('emException',
                           {type: 'response',
                           value: {
                            response: response,
                            description: 'No uuid from server'
                          }});
          return;
        } else {
          oldUuid = request.params.fakeUUID;
          uuid = response.uuid;

          // Also update queue to replace all calls with the old fake uuid with the new one
          // and at the same time swap the modified value
          if (queue && queue.length > 0) {
            for (var i=0, len=queue.length; i<len; i++) {
              if (queue[i].params.uuid === oldUuid) {
                queue[i].params.uuid = uuid;
                queue[i].content.url = queue[i].content.url.replace(oldUuid,uuid);
                if (queue[i].content.data && queue[i].content.data.modified){
                  queue[i].content.data.modified = response.modified;
                }
              }
            }
          }
        }
      }

      properties = {uuid: uuid, modified: response.modified};
      if (response.created) properties.created = response.created;

      if (request.params.type === 'user') {
        UserSessionService.setUserModified(properties.modified);
      } else if (request.params.type === 'item') {
        if (!ItemsService.updateItemProperties(oldUuid, properties, request.params.owner)) {
          // The item might have moved to either notes or tasks
          if (!TasksService.updateTaskProperties(oldUuid, properties, request.params.owner)) {
            if (!NotesService.updateNoteProperties(oldUuid, properties, request.params.owner)) {
              $rootScope.$emit('emException',
                               {type: 'response',
                               value: {
                                response: response,
                                description: 'Could not update item with values from server'
                              }});
              return;
            }
          }
        }
      } else if (request.params.type === 'task') {
        if (!TasksService.updateTaskProperties(oldUuid, properties, request.params.owner)) {
          $rootScope.$emit('emException',
            {type: 'response',
            value: {
              response: response,
              description: 'Could not update task with values from server'
            }});
          return;
        }
      } else if (request.params.type === 'note') {
        if (!NotesService.updateNoteProperties(oldUuid, properties, request.params.owner)) {
          $rootScope.$emit('emException',
            {type: 'response',
              value: {response: response,
              description: 'Could not update note with values from server'
            }});
          return;
        }
      }
    // ******
    // DELETE
    // ******
  } else if (request.content.method === 'delete') {
    properties = {deleted: response.deleted, modified: response.result.modified};
    if (request.params.type === 'item') {
      if (!ItemsService.updateItemProperties(request.params.uuid, properties, request.params.owner)) {
          // The item might have moved to either notes or tasks
          if (!TasksService.updateTaskProperties(request.params.uuid, properties, request.params.owner)) {
            if (!NotesService.updateNoteProperties(request.params.uuid, properties, request.params.owner)) {
              $rootScope.$emit('emException',
                               {type: 'response',
                               value: {
                                response: response,
                                description: 'Could not update deleted item with values from server'
                               }});
              return;
            }
          }
        }
      } else if (request.params.type === 'task') {
        if (!TasksService.updateTaskProperties(request.params.uuid, properties, request.params.owner)) {
          $rootScope.$emit('emException',
                           {type: 'response',
                            value: {
                              response: response,
                              description: 'Could not update deleted task with values from server'
                            }});
          return;
        }
      } else if (request.params.type === 'note') {
        if (!NotesService.updateNoteProperties(request.params.uuid, properties, request.params.owner)) {
          $rootScope.$emit('emException',
                           {type: 'response',
                            value: {
                              response: response,
                              description: 'Could not update deleted note with values from server'
                            }});
          return;
        }
      }
    }
  }
  BackendClientService.registerSecondaryGetCallback(synchronizeCallback);
  BackendClientService.registerBeforeLastGetCallback(synchronizeUserAccountCallback);
  BackendClientService.registerDefaultCallback(defaultCallback);

  function getAllOnline(ownerUUID, getAllMethod, deferred) {
    getAllMethod(ownerUUID).then(
      function(result) {
        deferred.resolve(true);
        return result;
      },
      function(error) {
        var rejection, emitType;
        if (BackendClientService.isOffline(error.value.status)) {
          emitType = 'emInteraction';
          rejection = {
            type: 'onlineRequired',
            value: {
              status: error.value.status,
              data: error.value.data,
              retry: getAllMethod,
              retryParam: ownerUUID,
              promise: deferred,
              promiseParam: true
          }};
        } else {
          emitType = 'emException';
          rejection = {type: 'http',
                       value: {
                         status: error.value.status,
                         data: error.value.data, url: error.value.config.url
                       }};
        }
        $rootScope.$emit(emitType, rejection);
        return $q.reject(rejection);
      });
  };

  function getAllItemsOnline(ownerUUID) {
    return BackendClientService.getSecondary('/api/' +
                                             ownerUUID +
                                             '/items', getItemsRegex,
                                             undefined, true).then(function(result) {
      if (result.data) {
        var latestTag, latestList, latestTask, latestItem, latestNote;
        // Reset all arrays
        latestTag = TagsService.setTags(result.data.tags, ownerUUID);
        latestList = ListsService.setLists(result.data.lists, ownerUUID);
        latestTask = TasksService.setTasks(result.data.tasks, ownerUUID);
        latestNote = NotesService.setNotes(result.data.notes, ownerUUID);
        latestItem = ItemsService.setItems(result.data.items, ownerUUID);
        var latestModified = null;
        if (latestTag || latestList || latestTask || latestNote || latestItem) {
          // Set latest modified
          latestModified = getLatestModified(latestTag, latestList, latestTask, latestNote, latestItem);
        }
        UserSessionService.setLatestModified(latestModified, ownerUUID);
      }
      return result;
    });
  };

  function synchronize(ownerUUID) {
    var deferred = $q.defer();
    var latestModified = UserSessionService.getLatestModified(ownerUUID);
    var url = '/api/' + ownerUUID + '/items';
    if (latestModified !== undefined) {
      if (latestModified) {
        url += '?modified=' + latestModified + '&deleted=true&archived=true&completed=true';
      }
      if (UserSessionService.isOfflineEnabled()) {
        // Push request to offline buffer
        BackendClientService.getSecondary(url, getItemsRegex, {owner: ownerUUID});
        deferred.resolve();
      } else {
        BackendClientService.get(url, getItemsRegex).then(function(result) {
          if (result.data) {
            processSynchronizeUpdateResult(ownerUUID, result.data);
          }
          deferred.resolve(false);
        }, function(error) {
          if (error && error.status === 403) {
            // Got 403, need to go to login
            var rejection = {type: 'http', value: {
              status: error.status, data: error.data, url: error.config.url}};
            $rootScope.$emit('emException', rejection);
            deferred.reject(rejection);
          } else {
            // just resolve, because this command does not need to always succeed
            deferred.resolve(false);
          }
        });
      }
    } else {
      getAllOnline(ownerUUID, getAllItemsOnline, deferred);
    }
    return deferred.promise;
  };

  function getAllArchivedAndCompletedOnline(ownerUUID) {
    return BackendClientService.getSecondary('/api/' +
                                             ownerUUID +
                                             '/items?archived=true&completed=true&active=false',
                                             getItemsRegex, undefined, true).then(function(result) {
      if (result.data) {
        // Update all arrays with archived values
        TagsService.updateTags(result.data.tags, ownerUUID);
        ListsService.updateLists(result.data.lists, ownerUUID);
        TasksService.updateTasks(result.data.tasks, ownerUUID);
        NotesService.updateNotes(result.data.notes, ownerUUID);
        ItemsService.updateItems(result.data.items, ownerUUID);
      }
      return result;
    });
  };

  function getAllDeletedOnline(ownerUUID) {
    return BackendClientService.getSecondary('/api/' +
                                             ownerUUID +
                                             '/items?deleted=true&active=false',
                                             getItemsRegex, undefined, true).then(function(result) {
      if (result.data) {
        // Update all arrays with archived values
        TagsService.updateTags(result.data.tags, ownerUUID);
        ListsService.updateLists(result.data.lists, ownerUUID);
        TasksService.updateTasks(result.data.tasks, ownerUUID);
        NotesService.updateNotes(result.data.notes, ownerUUID);
        ItemsService.updateItems(result.data.items, ownerUUID);
      }
      return result;
    });
  };

  return {
    // Main method to synchronize all arrays with backend.
    synchronize: function(ownerUUID) {
      return synchronize(ownerUUID);
    },
    addCompletedAndArchived: function(ownerUUID) {
      var deferred = $q.defer();
      getAllOnline(ownerUUID, getAllArchivedAndCompletedOnline, deferred);
      return deferred.promise;
    },
    addDeleted: function(ownerUUID) {
      var deferred = $q.defer();
      getAllOnline(ownerUUID, getAllDeletedOnline, deferred);
      return deferred.promise;
    },
    synchronizeUser: function(ownerUUID) {
      var deferred = $q.defer();

      if (UserSessionService.isOfflineEnabled()) {
        // Offline
        BackendClientService.getBeforeLast('/api/account',
         UserService.getAccountRegex);
        deferred.resolve();
      } else {
        // Online
        BackendClientService.getBeforeLast('/api/account',
         UserService.getAccountRegex, undefined, true).then(function(accountResponse) {
          storeUserAccountResponse(accountResponse);
          deferred.resolve();
        });
      }
      return deferred.promise;
    },
    // Regular expressions for item requests
    getItemsRegex: getItemsRegex
  };
}

SynchronizeService['$inject'] = ['$q', '$rootScope', 'BackendClientService', 'ItemsService',
'ListsService', 'NotesService', 'TagsService', 'TasksService', 'UserService', 'UserSessionService'];
angular.module('em.main').factory('SynchronizeService', SynchronizeService);
