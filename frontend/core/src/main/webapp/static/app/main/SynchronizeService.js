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

 function SynchronizeService($q, $rootScope, BackendClientService, ItemLikeService, ItemsService,
                             ListsService, NotesService, PersistentStorageService, TagsService, TasksService,
                             UserService, UserSessionService) {

  var itemsRegex = /\/items/;
  // NOTE: Do not set start/end of string anchors into getItemsRegex!
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
      ItemsService.removeItem(item.uuid, ownerUUID);
      break;
    case 'task':
      TasksService.removeTask(item.uuid, ownerUUID);
      break;
    case 'note':
      NotesService.removeNote(item.uuid, ownerUUID);
      break;
    case 'list':
      ListsService.removeList(item.uuid, ownerUUID);
      break;
    }
  }

  function removeItemsFromWrongArrays(ownerUUID, items, itemType){
    var locallyDifferentType;
    for (var i = 0, len = items.length; i < len; i++){
      locallyDifferentType = getLocallyDifferentType(ownerUUID, items[i], itemType);
      if (locallyDifferentType) removeItemFromArray(ownerUUID, items[i], locallyDifferentType);
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
      UserSessionService.setLatestModified(latestModified, ownerUUID);
    }
  }

  function executeUpdateFns(updateFns, itemUUID, probableItemType, properties, ownerUUID){
    switch(probableItemType) {
    case 'item':
      // Already right order
      break;
    case 'task':
      updateFns.move(1, 0);
      break;
    case 'note':
      updateFns.move(2, 0);
      break;
    case 'list':
      updateFns.move(3, 0);
      break;
    case 'tag':
      updateFns.move(4, 0);
      break;
    }
    // Now execute the functions
    for (var i=0, len=updateFns.length; i<len; i++){
      var itemInfo = updateFns[i](itemUUID, properties, ownerUUID);
      if (itemInfo.item) return itemInfo;
    }
  }

  function updateHistProperties(itemUUID, probableItemType, properties, ownerUUID){
    function updateTaskHistProperties (itemUUID, properties, ownerUUID){
      return {type: 'task', item: TasksService.updateTaskHistProperties(itemUUID, properties, ownerUUID)};
    }
    function updateNoteHistProperties (itemUUID, properties, ownerUUID){
      return {type: 'note', item: NotesService.updateNoteHistProperties(itemUUID, properties, ownerUUID)};
    }
    function updateListHistProperties (itemUUID, properties, ownerUUID){
      return {type: 'list', item: ListsService.updateListHistProperties(itemUUID, properties, ownerUUID)};
    }

    var updateFns = [updateTaskHistProperties,
                     updateNoteHistProperties,
                     updateListHistProperties];
    return executeUpdateFns(updateFns, itemUUID, probableItemType, properties, ownerUUID);
  }


  function updateModProperties(itemUUID, probableItemType, properties, ownerUUID){
    function updateItemModProperties (itemUUID, properties, ownerUUID){
      return {type: 'item', item: ItemsService.updateItemModProperties(itemUUID, properties, ownerUUID)};
    }
    function updateTaskModProperties (itemUUID, properties, ownerUUID){
      return {type: 'task', item: TasksService.updateTaskModProperties(itemUUID, properties, ownerUUID)};
    }
    function updateNoteModProperties (itemUUID, properties, ownerUUID){
      return {type: 'note', item: NotesService.updateNoteModProperties(itemUUID, properties, ownerUUID)};
    }
    function updateListModProperties (itemUUID, properties, ownerUUID){
      return {type: 'list', item: ListsService.updateListModProperties(itemUUID, properties, ownerUUID)};
    }
    function updateTagModProperties (itemUUID, properties, ownerUUID){
      return {type: 'tag', item: TagsService.updateTagModProperties(itemUUID, properties, ownerUUID)};
    }

    var updateFns = [updateItemModProperties,
                     updateTaskModProperties,
                     updateNoteModProperties,
                     updateListModProperties,
                     updateTagModProperties];
    return executeUpdateFns(updateFns, itemUUID, probableItemType, properties, ownerUUID);
  }


  function getItemInfoFromResponse(response, uuid){
    var item;
    if (response.items && response.items.length){
      item = response.items.findFirstObjectByKeyValue('uuid', uuid);
      if (item) return {type: 'item', item: item};
    }
    if (response.tasks && response.tasks.length){
      item = response.tasks.findFirstObjectByKeyValue('uuid', uuid);
      if (item) return {type: 'task', item: item};
    }
    if (response.notes && response.notes.length){
      item = response.notes.findFirstObjectByKeyValue('uuid', uuid);
      if (item) return {type: 'note', item: item};
    }
    if (response.lists && response.lists.length){
      item = response.lists.findFirstObjectByKeyValue('uuid', uuid);
      if (item) return {type: 'list', item: item};
    }
    if (response.tags && response.tags.length){
      item = response.tags.findFirstObjectByKeyValue('uuid', uuid);
      if (item) return {type: 'tag', item: item};
    }
  }

  function isListAsParentInResponse(response, listUUID){
    var i;
    if (response.tasks && response.tasks.length){
      for (i=0; i<response.tasks.length; i++){
        if (response.tasks[i].relationships && response.tasks[i].relationships.parent === listUUID)
          return true;
      }
    }
    if (response.notes && response.notes.length){
      for (i=0; i<response.notes.length; i++){
        if (response.notes[i].relationships && response.notes[i].relationships.parent === listUUID)
          return true;
      }
    }
    if (response.lists && response.lists.length){
      for (i=0; i<response.lists.length; i++){
        if (response.lists[i].relationships && response.lists[i].relationships.parent === listUUID)
          return true;
      }
    }
  }

  function removeItemFromResponse(response, uuid, itemType){
    var index;
    switch(itemType) {
    case 'item':
      if (response.items && response.items.length){
        index = response.items.findFirstIndexByKeyValue('uuid', uuid);
        if (index !== undefined) response.items.splice(index, 1);
      }
      break;
    case 'task':
      if (response.tasks && response.tasks.length){
        index = response.tasks.findFirstIndexByKeyValue('uuid', uuid);
        if (index !== undefined) response.tasks.splice(index, 1);
      }
      break;
    case 'note':
      if (response.notes && response.notes.length){
        index = response.notes.findFirstIndexByKeyValue('uuid', uuid);
        if (index !== undefined) response.notes.splice(index, 1);
      }
      break;
    case 'list':
      if (response.lists && response.lists.length){
        index = response.lists.findFirstIndexByKeyValue('uuid', uuid);
        if (index !== undefined) response.lists.splice(index, 1);
      }
      break;
    case 'tag':
      if (response.tags && response.tags.length){
        index = response.tags.findFirstIndexByKeyValue('uuid', uuid);
        if (index !== undefined) response.tags.splice(index, 1);
      }
      break;
    }
  }

  // Register callbacks to BackendClientService
  function synchronizeCallback(request, response, queue) {
    if (!jQuery.isEmptyObject(response)) {
      if (queue && queue.length){
        var updatedPutUUIDs = [];
        var mismatchTypeConflictInfos = [];
        var i, len;
        for (i = queue.length-1; i >= 0; i--){
          var conflictingItemInfo =
            getItemInfoFromResponse(response,
                                queue[i].params.uuid);
          if (conflictingItemInfo && conflictingItemInfo.type === queue[i].params.type){

            // *******************************************************************************
            // NORMAL: Database item is of the same type as the type in the request queue

            var conflictingItem = conflictingItemInfo.item;
            if (conflictingItem.deleted){
              // Deleted elsewhere overrides everything
              queue.splice(i, 1);
              continue;
            }else if (queue[i].content.method === 'put'){
              if (!updatedPutUUIDs.findFirstObjectByKeyValue('uuid', conflictingItem.uuid)){
                if (queue[i].params.type === 'note' &&
                    queue[i].content.data.content && queue[i].content.data.content.length &&
                    conflictingItem.content && conflictingItem.content.length &&
                    queue[i].content.data.content !== conflictingItem.content){

                  // Content conflict, create hybrid and change PUT in queue to reflect the change
                  var conflictDelimiter = '\n\n>>> conflicting changes >>>\n\n', conflictedContent;
                  if (conflictingItem.modified > queue[i].content.timestamp){
                    conflictedContent = conflictingItem.content +
                                              conflictDelimiter +
                                              queue[i].content.data.content;
                  }else{
                    conflictedContent = queue[i].content.data.content +
                                              conflictDelimiter +
                                              conflictingItem.content;
                  }
                  queue[i].content.data.content = conflictedContent;
                  queue[i].content.data.modified = conflictingItem.modified;
                  conflictingItem.content = conflictedContent;

                  // Also update the current note modifications to match the queue
                  updateModProperties(conflictingItem.uuid,
                                      queue[i].params.type,
                                      {content: conflictedContent,
                                       modified: conflictingItem.modified},
                                       request.params.owner);
                  // In both cases remove the item to prevent mixed data model
                  removeItemFromResponse(response, conflictingItem.uuid, queue[i].params.type);
                }else{
                  // Other types than note: no need to do a merge of content
                  if (conflictingItem.modified > queue[i].content.timestamp){
                    // We now removed the latest PUT from the queue, so we sould also remove the local
                    // modifications on the item
                    updateModProperties(conflictingItem.uuid, queue[i].params.type,
                                        undefined, request.params.owner);
                    // Database item is newer, remove the PUT from the queue
                    queue.splice(i, 1);
                    continue;
                  }else{

                    // Don't splice it from the buffer, but we still want to change the modified value so that
                    // the call doesn't fail with next sync
                    queue[i].content.data.modified = conflictingItem.modified;

                    // Update modified value to reflect backend from both persistent and mod fields
                    updateModProperties(conflictingItem.uuid,
                                        queue[i].params.type,
                                        {modified: conflictingItem.modified},
                                        request.params.owner);
                    // Remove database item from response
                    removeItemFromResponse(response, conflictingItem.uuid, queue[i].params.type);
                  }
                }
                updatedPutUUIDs.push(conflictingItem.uuid);
              }else{
                // This has already been updated, but we want to change the modified value anyway to
                // match the backend
                queue[i].content.data.modified = conflictingItem.modified;
              }
            }else if (queue[i].content.method === 'post'){
              if (queue[i].content.url.endsWith('/complete') && conflictingItem.completed){
                // Need to change completed value to make sure mod is deleted on update
                updateModProperties(conflictingItem.uuid,
                                    queue[i].params.type,
                                    {modified: conflictingItem.modified,
                                    completed: conflictingItem.completed},
                                    request.params.owner);
                queue.splice(i, 1);
                continue;
              }else if (queue[i].content.url.endsWith('/uncomplete') && !conflictingItem.completed){
                queue.splice(i, 1);
                continue;
              }else if (queue[i].content.url.endsWith('/favorite') && conflictingItem.completed){
                // Need to change favorited value to make sure mod is deleted on update
                updateModProperties(conflictingItem.uuid,
                                    queue[i].params.type,
                                    {modified: conflictingItem.modified,
                                    favorited: conflictingItem.favorited},
                                    request.params.owner);
                queue.splice(i, 1);
                continue;
              }else if (queue[i].content.url.endsWith('/unfavorite') && !conflictingItem.favorited){
                queue.splice(i, 1);
                continue;
              }else if (queue[i].params.type === 'task' &&
                        queue[i].content.url.endsWith('/note') ||
                        queue[i].content.url.endsWith('/list')){
                if (!(queue[i].content.url.endsWith('/list') && conflictingItem.relationships &&
                      conflictingItem.relationships.parent)){
                  // Converting task: do the convert, but replace payload to server version
                  queue[i].content.data = ItemLikeService.createTransportItem(conflictingItem,
                                                                            TasksService.taskFieldInfos);
                }else{
                  // Has list already, ignore convert to list
                  queue.splice(i, 1);
                  continue;
                }
              }else if (queue[i].params.type === 'note' &&
                        queue[i].content.url.endsWith('/task') ||
                        queue[i].content.url.endsWith('/list')){
                if (!(queue[i].content.url.endsWith('/list') && conflictingItem.relationships &&
                    conflictingItem.relationships.parent)){
                  // Converting note: do the convert, but replace payload to server version
                  queue[i].content.data = ItemLikeService.createTransportItem(conflictingItem,
                                                                              NotesService.noteFieldInfos);
                }else{
                  // Has list already, ignore convert to list
                  queue.splice(i, 1);
                  continue;
                }
              }else if (queue[i].params.type === 'list' &&
                        queue[i].content.url.endsWith('/note') ||
                        queue[i].content.url.endsWith('/list')){
                if (!isListAsParentInResponse(response, queue[i].params.uuid)){
                  // Converting list: do the convert, but replace payload to server version
                  queue[i].content.data = ItemLikeService.createTransportItem(conflictingItem,
                                                                              ListsService.listFieldInfos);
                }else{
                  // don't do the convert as the list has children now
                  queue.splice(i, 1);
                  continue;
                }
              }
            }
          }else if (conflictingItemInfo && conflictingItemInfo.type !== queue[i].params.type){
            // *****************************************************************************
            // MISMATCH: Database item is of different type as the type in the request queue

            // As we loop the queue from the end, we could have a convert in the queue before
            // this one. We need to just collect store this conflict and loop the queue again
            // in starting from the beginning, where we know to delete
            if (mismatchTypeConflictInfos.indexOf(conflictingItemInfo) === -1)
              mismatchTypeConflictInfos.push(conflictingItemInfo);
          }

          // Handle deleted lists and tags
          if (queue[i].content.method === 'put' && queue[i].content.data &&
              queue[i].content.data.relationships){
            // Check list
            if (queue[i].content.data.relationships.parent){
              var listInfoInResponse = getItemInfoFromResponse(response,
                                                               queue[i].content.data.relationships.parent);
              if (listInfoInResponse){
                if (listInfoInResponse.type !== 'tag'){
                  if (listInfoInResponse.type !== 'list' || listInfoInResponse.item.deleted){
                    // The UUID here has been transformed into another type or it has been deleted,
                    // remove it from the queue

                    var listDeleteProperties;

                    delete queue[i].content.data.relationships.parent;
                    if (!queue[i].content.data.relationships.tags){
                      delete queue[i].content.data.relationships;
                      listDeleteProperties = {relationships: undefined};
                    }else{
                      listDeleteProperties = {relationships: queue[i].content.data.relationships};
                    }
                    updateModProperties(queue[i].params.uuid,
                                        queue[i].params.type,
                                        listDeleteProperties,
                                        request.params.owner);
                  }
                }else{
                  // TODO: Tag has as parent another tag
                }
              }
            }

            // Check tags
            if (queue[i].content.data.relationships && queue[i].content.data.relationships.tags){

              var tagRemoved = false;
              for (j=queue[i].content.data.relationships.tags.length-1; j>=0; j--){
                var tagInfoInResponse = getItemInfoFromResponse(
                                          response,
                                          queue[i].content.data.relationships.tags[j]);
                if (tagInfoInResponse && tagInfoInResponse.item.deleted){
                  // tag has been deleted, remove it from item in the queue
                  queue[i].content.data.relationships.tags.splice(j, 1);
                  tagRemoved = true;
                }
              }

              if (tagRemoved){
                var tagRemoveProperties;
                if (queue[i].content.data.relationships.tags.length === 0 &&
                    !queue[i].content.data.relationships.parent){
                  delete queue[i].content.data.relationships;
                  tagRemoveProperties = {relationships: undefined};
                }else{
                  tagRemoveProperties = {relationships: {}};
                  if (queue[i].content.data.relationships.parent){
                    tagRemoveProperties.parent = queue[i].content.data.relationships.parent;
                  }
                  if (queue[i].content.data.relationships.tags.length){
                    tagRemoveProperties.tags = queue[i].content.data.relationships.tags;
                  }
                }
                updateModProperties(queue[i].params.uuid,
                                    queue[i].params.type,
                                    tagRemoveProperties,
                                    request.params.owner);
              }
            }
          }
        }

        if (mismatchTypeConflictInfos.length){
          // Loop again from the beginning
          var queueSpliceInfos = [];
          for (i = 0, len=queue.length; i < len; i++){
            for(var j = mismatchTypeConflictInfos.length-1; j >= 0; j--){
              if (mismatchTypeConflictInfos[j].item.uuid === queue[i].params.uuid){
                if (queue[i].params.type !== mismatchTypeConflictInfos[j].type){
                  // Wrong type, need to splice IF not turning an item into a task/note which is ok
                  if (mismatchTypeConflictInfos[j].type === 'item' && queue[i].content.method === 'put'){
                    // We just remove this conflict, everything is cool as the item was converted in the
                    // offline queue to anbther type
                    mismatchTypeConflictInfos.splice(j, 1);
                  }else{
                    queueSpliceInfos.push({index: i, correctType: mismatchTypeConflictInfos[j].type});
                  }
                }
              }
            }
          }
          for (i=0, len=queueSpliceInfos.length; i<len; i++){
            // Remove mod from the item and then remove the entire item
            var mismatchItemInfo = updateModProperties(queue[queueSpliceInfos[i].index].params.uuid,
                                               queue[queueSpliceInfos[i].index].params.type,
                                               undefined, request.params.owner);
            if (mismatchItemInfo){
              removeItemFromArray(request.params.owner, mismatchItemInfo.item, mismatchItemInfo.type);
            }
            // All that's left is to remove the request from the queue: the response and will be added to
            // the right service after this
            queue.splice(queueSpliceInfos[i].index, 1);
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

  function storeUserAccountResponse(response){
    UserSessionService.setEmail(response.email);
    UserSessionService.setUserModified(response.modified);
    UserSessionService.setTransportPreferences(response.preferences);
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
          updateModProperties(request.params.uuid, request.params.type, properties, request.params.owner);
        }
      } else if (request.params.type === 'task') {
        if (request.content.url.endsWith('/undelete')){
          properties = {modified: response.modified, deleted: undefined};
        } else if(request.content.url.endsWith('/uncomplete')) {
          properties = {modified: response.modified, completed: undefined};
        } else if (request.content.url.endsWith('/complete')) {
          // Complete
          properties = {completed: response.completed, modified: response.result.modified};
          // Handle repeating task
          if (response.generated){
            // Update generated item properties
            updateModProperties(request.params.generatedFakeUUID, request.params.type,
                                {uuid: response.generated.uuid,
                                 created: response.generated.created,
                                 modified: response.generated.modified},
                                 request.params.owner);
            // Also update the UUID in the task's history
            updateHistProperties(request.params.uuid, request.params.type,
                                 {generatedUUID: response.generated.uuid}, request.params.owner);
          }
        } else if (request.content.url.endsWith('/note')){
          // Convert to note
          properties = {modified: response.modified};
          updateModProperties(request.params.uuid, 'note', properties, request.params.owner);
        } else if ( request.content.url.endsWith('/list')){
          // Convert to list
          properties = {modified: response.modified};
          updateModProperties(request.params.uuid, 'list', properties, request.params.owner);
        }
        if (properties)
          updateModProperties(request.params.uuid, request.params.type, properties, request.params.owner);
      } else if (request.params.type === 'note') {
        if (request.content.url.endsWith('/undelete')){
          properties = {modified: response.modified, deleted: undefined};
        }else if (request.content.url.endsWith('/unfavorite')) {
          properties = {modified: response.modified, favorited: undefined};
        }else if (request.content.url.endsWith('/favorite')) {
          // Favorite
          properties = {favorited: response.favorited, modified: response.result.modified};
        } else if (request.content.url.endsWith('/task')){
          // Convert to task
          properties = {modified: response.modified};
          updateModProperties(request.params.uuid, 'task', properties, request.params.owner);
        } else if ( request.content.url.endsWith('/list')){
          // Convert to list
          properties = {modified: response.modified};
          updateModProperties(request.params.uuid, 'list', properties, request.params.owner);
        }
        if (properties)
          updateModProperties(request.params.uuid, request.params.type, properties, request.params.owner);
      } else if (request.params.type === 'list') {
        if (request.content.url.endsWith('/undelete')){
          properties = {modified: response.modified, deleted: undefined};
          updateModProperties(request.params.uuid, request.params.type, properties, request.params.owner);
        } else if (request.content.url.endsWith('/note')){
          // Convert to note
          properties = {modified: response.modified};
          updateModProperties(request.params.uuid, 'note', properties, request.params.owner);
        } else if ( request.content.url.endsWith('/task')){
          // Convert to task
          properties = {modified: response.modified};
          updateModProperties(request.params.uuid, 'task', properties, request.params.owner);
        }
      } else if (request.params.type === 'tag') {
        if (request.content.url.endsWith('/undelete')){
          properties = {modified: response.modified, deleted: undefined};
          updateModProperties(request.params.uuid, request.params.type, properties, request.params.owner);
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
          properties = {};
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
            properties = {uuid: uuid};
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
                if (queue[i].content.method  === 'put'){
                  // Need to also replace list and tag UUID from relationships array
                  if (queue[i].content.data && queue[i].content.data.relationships){
                    var stringRelationships = JSON.stringify(queue[i].content.data.relationships);
                    queue[i].content.data.relationships =
                      JSON.parse(stringRelationships.replace(oldUuid,uuid));
                  }
                }
              }
            }
          }
        }
        properties.modified = response.modified;
        if (response.created){
          properties.created = response.created;
        }

        if (request.params.type === 'user') {
          UserSessionService.setUserModified(properties.modified);
        } else {
          updateModProperties(oldUuid, request.params.type, properties, request.params.owner);
        }
      // ******
      // DELETE
      // ******
    } else if (request.content.method === 'delete') {
      properties = {deleted: response.deleted, modified: response.result.modified};
      updateModProperties(request.params.uuid, request.params.type, properties, request.params.owner);
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
        if (error.type === 'offline') {
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
  }

  function setItemArrays(itemsByType, ownerUUID, skipPersist){
    var latestTag, latestList, latestTask, latestItem, latestNote;
    // Reset all arrays
    latestTag = TagsService.setTags(itemsByType.tags, ownerUUID, skipPersist);
    latestList = ListsService.setLists(itemsByType.lists, ownerUUID, skipPersist);
    latestTask = TasksService.setTasks(itemsByType.tasks, ownerUUID, skipPersist);
    latestNote = NotesService.setNotes(itemsByType.notes, ownerUUID, skipPersist);
    latestItem = ItemsService.setItems(itemsByType.items, ownerUUID, skipPersist);
    var latestModified = null;
    if (latestTag || latestList || latestTask || latestNote || latestItem) {
      // Set latest modified
      latestModified = getLatestModified(latestTag, latestList, latestTask, latestNote, latestItem);
    }
    UserSessionService.setLatestModified(latestModified, ownerUUID);
  }

  function updateItemArrays(response, ownerUUID){
    // Update all arrays with archived values
    var latestTag, latestList, latestTask, latestItem, latestNote;
    latestTag = TagsService.updateTags(response.tags, ownerUUID);
    latestList = ListsService.updateLists(response.lists, ownerUUID);
    latestTask = TasksService.updateTasks(response.tasks, ownerUUID);
    latestNote = NotesService.updateNotes(response.notes, ownerUUID);
    latestItem = ItemsService.updateItems(response.items, ownerUUID);
    var latestModified;
    if (latestTag || latestList || latestTask || latestNote || latestItem) {
      // Set latest modified
      latestModified = getLatestModified(latestTag, latestList, latestTask, latestNote, latestItem);
      UserSessionService.setLatestModified(latestModified, ownerUUID);
    }
  }

  function getAllItemsOnline(ownerUUID) {
    return BackendClientService.getSecondary('/api/' +
                                             ownerUUID +
                                             '/items', getItemsRegex,
                                             undefined, true).then(function(response) {
      setItemArrays(response, ownerUUID);
      if (UserSessionService.isOfflineEnabled()) UserSessionService.setPersistentDataLoaded(true);
      return response;
    });
  }

  function synchronize(ownerUUID) {
    function doSynchronizeDelta(url, latestModified, deferred){
      if (latestModified) {
        url += '?modified=' + latestModified + '&deleted=true&archived=true&completed=true';
      }
      if (UserSessionService.isOfflineEnabled()) {
        // Push request to offline buffer
        BackendClientService.getSecondary(url, getItemsRegex, {owner: ownerUUID});
        deferred.resolve();
      } else {
        BackendClientService.getSecondary(url, getItemsRegex, undefined, true).then(function(response) {
          processSynchronizeUpdateResult(ownerUUID, response);
          deferred.resolve(false);
        }, function(error) {
          if (error.type === 'forbidden') {
            // Go to login
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
    }

    var deferred = $q.defer();
    var latestModified = UserSessionService.getLatestModified(ownerUUID);
    var url = '/api/' + ownerUUID + '/items';

    if (UserSessionService.isFakeUser()){
      deferred.resolve();
    }else if (latestModified !== undefined) {
      if (UserSessionService.isPersistentStorageEnabled() && !UserSessionService.isPersistentDataLoaded()){
        // Load items from the database
        PersistentStorageService.getAll().then(function(itemInfos){
          // Sort items by owner and type
          if (itemInfos && itemInfos.length){

            var itemsByOwner = {};
            for (var i=0, len=itemInfos.length; i<len; i++){
              var arrayType = itemInfos[i].itemType + 's';
              if (!itemsByOwner[itemInfos[i].ownerUUID]) itemsByOwner[itemInfos[i].ownerUUID] = {};
              if (!itemsByOwner[itemInfos[i].ownerUUID][arrayType])
                itemsByOwner[itemInfos[i].ownerUUID][arrayType] = [];
              itemsByOwner[itemInfos[i].ownerUUID][arrayType].push(itemInfos[i].item);
            }
            for (var ownerUUID in itemsByOwner){
              if (itemsByOwner.hasOwnProperty(ownerUUID)){
                // set but don't persist as these already are persisted
                setItemArrays(itemsByOwner[ownerUUID], ownerUUID, true);
              }
            }
          }
          $rootScope.syncState = 'persistent';

          // After that, synchronize
          doSynchronizeDelta(url, latestModified, deferred);
        });
        UserSessionService.setPersistentDataLoaded(true);
      }else{
        doSynchronizeDelta(url, latestModified, deferred);
      }
    } else {
      getAllOnline(ownerUUID, getAllItemsOnline, deferred);
    }
    return deferred.promise;
  }

  function getAllArchivedAndCompletedOnline(ownerUUID) {
    return BackendClientService.getSecondary('/api/' +
                                             ownerUUID +
                                             '/items?archived=true&completed=true&active=false',
                                             getItemsRegex, undefined, true).then(function(response) {
      updateItemArrays(response, ownerUUID);
      return response;
    });
  }

  function getAllDeletedOnline(ownerUUID) {
    return BackendClientService.getSecondary('/api/' +
                                             ownerUUID +
                                             '/items?deleted=true&active=false',
                                             getItemsRegex, undefined, true).then(function(response) {
      updateItemArrays(response, ownerUUID);
      return response;
    });
  }

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
    synchronizeUser: function() {
      var deferred = $q.defer();

      if (UserSessionService.isOfflineEnabled()) {
        // Offline
        BackendClientService.getBeforeLast('/api/account',
         UserService.getAccountRegex);
        deferred.resolve();
      } else {
        // Online
        BackendClientService.getBeforeLast('/api/account',
         UserService.getAccountRegex, undefined, true).then(function(response) {
          storeUserAccountResponse(response);
          deferred.resolve();
        });
      }
      return deferred.promise;
    },
    getModifiedItems: function(itemType, ownerUUID) {
      switch(itemType) {
      case 'item':
        return ItemsService.getModifiedItems(ownerUUID);
      case 'task':
        return TasksService.getModifiedTasks(ownerUUID);
      case 'note':
        return NotesService.getModifiedNotes(ownerUUID);
      case 'list':
        return ListsService.getModifiedLists(ownerUUID);
      case 'tag':
        return TagsService.getModifiedTags(ownerUUID);
      }
    },
    clearData: function(){
      if (UserSessionService.isPersistentStorageEnabled()){
        PersistentStorageService.destroyAll();
      }
      ItemsService.clearItems();
      TasksService.clearTasks();
      NotesService.clearNotes();
      ListsService.clearLists();
      TagsService.clearTags();
    },
    // Regular expressions for item requests
    getItemsRegex: getItemsRegex
  };
}

SynchronizeService['$inject'] = ['$q', '$rootScope', 'BackendClientService', 'ItemLikeService',
'ItemsService', 'ListsService', 'NotesService', 'PersistentStorageService', 'TagsService', 'TasksService',
'UserService', 'UserSessionService'];
angular.module('em.main').factory('SynchronizeService', SynchronizeService);
