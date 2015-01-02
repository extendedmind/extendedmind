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

 /*global angular */
 'use strict';

 function ListsService($q, ArrayService, BackendClientService, ExtendedItemService, ItemLikeService,
                       TagsService, UserSessionService) {

  var listFieldInfos = ItemLikeService.getFieldInfos(
    [ 'due',
      // TODO
      // 'assignee',
      // 'assigner',
      // 'visibility',
      ExtendedItemService.getRelationshipsFieldInfo()
    ]
  );

  // An object containing lists for every owner
  var lists = {};

  var listSlashRegex = /\/list\//;
  var archiveRegex = /\/archive/;

  var itemArchiveCallbacks = {};
  var listDeletedCallbacks = {};

  function initializeArrays(ownerUUID) {
    if (!lists[ownerUUID]) {
      lists[ownerUUID] = {
        activeLists: [],
        deletedLists: [],
        archivedLists: []
      };
    }
  }
  UserSessionService.registerNofifyOwnerCallback(initializeArrays, 'ListsService');


  function getListInfo(uuid, ownerUUID){
    var list = lists[ownerUUID].activeLists.findFirstObjectByKeyValue('uuid', uuid, 'trans');
    if (list){
      return {
        type: 'active',
        list: list
      };
    }
    list = lists[ownerUUID].deletedLists.findFirstObjectByKeyValue('uuid', uuid, 'trans');
    if (list){
      return {
        type: 'deleted',
        list: list
      };
    }
    list = lists[ownerUUID].archivedLists.findFirstObjectByKeyValue('uuid', uuid, 'trans');
    if (list){
      return {
        type: 'archived',
        list: list
      };
    }
  }
  ExtendedItemService.registerGetListInfoCallback(getListInfo);

  function getOtherArrays(ownerUUID) {
    return [{array: lists[ownerUUID].archivedLists, id: 'archived'}];
  }

  function updateList(list, ownerUUID, oldUUID) {
    ItemLikeService.persistAndReset(list, 'list', ownerUUID, listFieldInfos, oldUUID);
    return ArrayService.updateItem(list,
                                   lists[ownerUUID].activeLists,
                                   lists[ownerUUID].deletedLists,
                                   getOtherArrays(ownerUUID));
  }

  function setList(list, ownerUUID) {
    ItemLikeService.persistAndReset(list, 'list', ownerUUID, listFieldInfos);
    ArrayService.setItem(list,
                         lists[ownerUUID].activeLists,
                         lists[ownerUUID].deletedLists,
                         getOtherArrays(ownerUUID));
  }

  return {
    getNewList: function(initialValues, ownerUUID) {
      return ItemLikeService.getNew(initialValues, 'list', ownerUUID, listFieldInfos);
    },
    setLists: function(listsResponse, ownerUUID, skipPersist) {
      if (skipPersist){
        ItemLikeService.resetTrans(listsResponse, 'list', ownerUUID, listFieldInfos);
      }else{
        ItemLikeService.persistAndReset(listsResponse, 'list', ownerUUID, listFieldInfos);
      }
      return ArrayService.setArrays(listsResponse,
                                    lists[ownerUUID].activeLists,
                                    lists[ownerUUID].deletedLists,
                                    getOtherArrays(ownerUUID));
    },
    updateLists: function(listsResponse, ownerUUID) {
      if (listsResponse && listsResponse.length){
        // Go through listsResponse, and add .mod values if the fields in the current .mod do not match
        // the values in the persistent response
        var updatedLists = [];
        for (var i=0, len=listsResponse.length; i<len; i++){
          var listInfo = this.getListInfo(listsResponse[i].uuid, ownerUUID);
          if (listInfo){
            updatedLists.push(ItemLikeService.evaluateMod(
                                listsResponse[i], listInfo.list, 'list', ownerUUID, listFieldInfos));
          }else{
            updatedLists.push(listsResponse[i]);
          }
        }
        ItemLikeService.persistAndReset(updatedLists, 'list', ownerUUID, listFieldInfos);
        var latestModified = ArrayService.updateArrays(updatedLists,
                                                       lists[ownerUUID].activeLists,
                                                       lists[ownerUUID].deletedLists,
                                                       getOtherArrays(ownerUUID));
        if (latestModified) {
          // Go through response to see if something was deleted
          for (var i=0, len=updatedLists.length; i<len; i++) {
            if (updatedLists[i].deleted) {
              for (var id in listDeletedCallbacks) {
                listDeletedCallbacks[id](updatedLists[i], ownerUUID);
              }
            }
          }
        }
        return latestModified;
      }
    },
    updateListModProperties: function(uuid, properties, ownerUUID) {
      var listInfo = this.getListInfo(uuid, ownerUUID);
      if (listInfo){
        if (!properties){
          if (listInfo.list.mod){
            delete listInfo.list.mod;
            updateList(listInfo.list, ownerUUID);
          }
        }else{
          if (!listInfo.list.mod) listInfo.list.mod = {};
          ItemLikeService.updateObjectProperties(listInfo.list.mod, properties);
          updateList(listInfo.list, ownerUUID, properties.uuid ? uuid : undefined);
        }
        return listInfo.list;
      }
    },
    updateListHistProperties: function(uuid, properties, ownerUUID) {
      var listInfo = this.getListInfo(uuid, ownerUUID);
      if (listInfo && properties){
        if (!listInfo.list.hist) listInfo.list.hist = {};
        ItemLikeService.updateObjectProperties(listInfo.list.hist, properties);
        updateList(listInfo.list, ownerUUID, properties.uuid ? uuid : undefined);
        return listInfo.list;
      }
    },
    getLists: function(ownerUUID) {
      return lists[ownerUUID].activeLists;
    },
    getArchivedLists: function(ownerUUID) {
      return lists[ownerUUID].archivedLists;
    },
    getDeletedLists: function(ownerUUID) {
      return lists[ownerUUID].deletedLists;
    },
    getModifiedLists: function(ownerUUID) {
      return ArrayService.getModifiedItems(lists[ownerUUID].activeLists,
                                            lists[ownerUUID].deletedLists,
                                            getOtherArrays(ownerUUID))
    },
    getListInfo: function(uuid, ownerUUID) {
      return getListInfo(uuid, ownerUUID);
    },
    saveList: function(list, ownerUUID) {
      var deferred = $q.defer();
      if (lists[ownerUUID].deletedLists.findFirstObjectByKeyValue('uuid', list.trans.uuid, 'trans')) {
        deferred.reject({type: 'deleted'});
      } else {
        ItemLikeService.save(list, 'list', ownerUUID, listFieldInfos).then(
          function(result){
            if (result === 'new') setList(list, ownerUUID);
            else if (result === 'existing') updateList(list, ownerUUID);
            deferred.resolve(result);
          }, function(failure){
            deferred.reject(failure);
          }
        );
      }
      return deferred.promise;
    },
    isListEdited: function(list, ownerUUID) {
      return ItemLikeService.isEdited(list, 'list', ownerUUID, listFieldInfos);
    },
    resetList: function(list, ownerUUID) {
      return ItemLikeService.resetTrans(list, 'list', ownerUUID, listFieldInfos);
    },
    getListStatus: function(list, ownerUUID) {
      var arrayInfo = ArrayService.getActiveArrayInfo(list,
                                                      lists[ownerUUID].activeLists,
                                                      lists[ownerUUID].deletedLists,
                                                      getOtherArrays(ownerUUID));

      if (arrayInfo) return arrayInfo.type;
    },
    addList: function(list, ownerUUID) {
      setList(list, ownerUUID);
    },
    removeList: function(uuid, ownerUUID) {
      var listInfo = this.getListInfo(uuid, ownerUUID);
      if (listInfo) {
        // Notify others that this list will be removed => same callback as in when it is deleted
        for (var id in listDeletedCallbacks) {
          listDeletedCallbacks[id](listInfo.list, ownerUUID);
        }
        var listIndex;
        if (listInfo.type === 'active') {
          listIndex = lists[ownerUUID].activeLists.indexOf(listInfo.list);
          ItemLikeService.remove(listInfo.list.trans.uuid);
          lists[ownerUUID].activeLists.splice(listIndex, 1);
        } else if (listInfo.type === 'deleted') {
          listIndex = lists[ownerUUID].deletedLists.indexOf(listInfo.list);
          ItemLikeService.remove(listInfo.list.trans.uuid);
          lists[ownerUUID].deletedLists.splice(listIndex, 1);
        } else if (listInfo.type === 'archived') {
          listIndex = lists[ownerUUID].archivedLists.indexOf(listInfo.list);
          ItemLikeService.remove(listInfo.list.trans.uuid);
          lists[ownerUUID].archivedLists.splice(listIndex, 1);
        }
      }

    },
    deleteList: function(list, ownerUUID) {
      var deferred = $q.defer();
      if (lists[ownerUUID].deletedLists.findFirstObjectByKeyValue('uuid', list.trans.uuid, 'trans')) {
        deferred.resolve('unmodified');
      }else{
        ItemLikeService.processDelete(list, 'list', ownerUUID, listFieldInfos).then(
          function(){
            updateList(list, ownerUUID);
            for (var id in listDeletedCallbacks) {
              listDeletedCallbacks[id](list, ownerUUID);
            }
            deferred.resolve(list);
          }, function(failure){
            deferred.reject(failure);
          }
        );
      }
      return deferred.promise;
    },
    undeleteList: function(list, ownerUUID) {
      var deferred = $q.defer();
      if (!lists[ownerUUID].deletedLists.findFirstObjectByKeyValue('uuid', list.trans.uuid, 'trans')) {
        deferred.resolve('unmodified');
      }else{
        ItemLikeService.undelete(list, 'list', ownerUUID, listFieldInfos).then(
          function(){
            updateList(list, ownerUUID);
            for (var id in listDeletedCallbacks) {
              listDeletedCallbacks[id](list, ownerUUID, true);
            }
            deferred.resolve(list);
          }, function(failure){
            deferred.reject(failure);
          }
        );
      }
      return deferred.promise;
    },
    archiveList: function(list, ownerUUID) {
      function getArchiveUrl(params){
        return params.prefix + params.list.trans.uuid + '/archive';
      }
      // Check that list is active before trying to archive
      var deferred = $q.defer();
      if (lists[ownerUUID].deletedLists.findFirstObjectByKeyValue('uuid', list.trans.uuid, 'trans')) {
        deferred.reject({type: 'deleted'});
      }else if (lists[ownerUUID].archivedLists.findFirstObjectByKeyValue('uuid', list.trans.uuid, 'trans')) {
        deferred.resolve('unmodified');
      } else {
        BackendClientService.postOnline({ value: '/api/' + ownerUUID + '/list/' +
                                                 list.trans.uuid + '/archive',
                                          refresh: getArchiveUrl,
                                          params: {
                                            prefix: '/api/' + ownerUUID + '/list/',
                                            list: list }},
                                        this.archiveListRegex)
        .then(function(response) {
          list.archived = response.archived;
          ItemLikeService.updateObjectProperties(list, response.result);
          updateList(list, ownerUUID);

          // Add generated tag to the tag array
          TagsService.setGeneratedTag(response.history, ownerUUID);
          // Call child callbacks
          if (response.children) {
            for (var id in itemArchiveCallbacks) {
              itemArchiveCallbacks[id](response.children, response.archived, ownerUUID);
            }
          }
          deferred.resolve();
        },function(error){
          deferred.reject(error);
        });
      }
      return deferred.promise;
    },
    clearLists: function() {
      lists = {};
    },

    // Regular expressions for list requests

    putNewListRegex: ItemLikeService.getPutNewRegex('list'),
    putExistingListRegex: ItemLikeService.getPutExistingRegex('list'),
    deleteListRegex: ItemLikeService.getDeleteRegex('list'),
    undeleteListRegex: ItemLikeService.getUndeleteRegex('list'),
    archiveListRegex: new RegExp('^' +
                                 BackendClientService.apiPrefixRegex.source +
                                 BackendClientService.uuidRegex.source +
                                 listSlashRegex.source +
                                 BackendClientService.uuidRegex.source +
                                 archiveRegex.source +
                                 '$'),

    // Register callbacks that are fired for implicit archiving of
    // elements. Callback must return the latest modified value it
    // stores to its arrays.
    registerItemArchiveCallback: function(itemArchiveCallback, id) {
      itemArchiveCallbacks[id] = itemArchiveCallback;
    },
    registerListDeletedCallback: function(listDeletedCallback, id) {
      listDeletedCallbacks[id] = listDeletedCallback;
    },
    removeDeletedListFromItems: function(items, deletedList) {
      var modifiedItems = [];
      for (var i = 0, len = items.length; i < len; i++) {
        if (items[i].relationships) {
          if (items[i].relationships.parent === deletedList.trans.uuid) {
            delete items[i].relationships.parent;
            if (!items[i].relationships.tags) delete items[i].relationships;
            modifiedItems.push(items[i]);
          }
        }
      }
      return modifiedItems;
    }
  };
}

ListsService['$inject'] = ['$q', 'ArrayService', 'BackendClientService', 'ExtendedItemService',
                           'ItemLikeService', 'TagsService', 'UserSessionService'];
angular.module('em.lists').factory('ListsService', ListsService);
