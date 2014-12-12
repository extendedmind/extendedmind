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
                       TagsService) {

  var listFieldInfos = ItemLikeService.getFieldInfos(
    [ // TODO
      // due,
      // assignee,
      // assigner,
      // visibility,
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

  function getOtherArrays(ownerUUID) {
    return [{array: lists[ownerUUID].archivedLists, id: 'archived'}];
  }

  function updateList(list, ownerUUID) {
    ItemLikeService.resetTrans(list, 'list', ownerUUID, listFieldInfos);
    return ArrayService.updateItem(list,
                                   lists[ownerUUID].activeLists,
                                   lists[ownerUUID].deletedLists,
                                   getOtherArrays(ownerUUID));
  }

  function setList(list, ownerUUID) {
    initializeArrays(ownerUUID);
    ItemLikeService.resetTrans(list, 'list', ownerUUID, listFieldInfos);
    ArrayService.setItem(list,
                         lists[ownerUUID].activeLists,
                         lists[ownerUUID].deletedLists,
                         getOtherArrays(ownerUUID));
  }

  return {
    setLists: function(listsResponse, ownerUUID) {
      initializeArrays(ownerUUID);
      ItemLikeService.resetTrans(listsResponse, 'list', ownerUUID, listFieldInfos);
      return ArrayService.setArrays(listsResponse,
                                    lists[ownerUUID].activeLists,
                                    lists[ownerUUID].deletedLists,
                                    getOtherArrays(ownerUUID));
    },
    updateLists: function(listsResponse, ownerUUID) {
      initializeArrays(ownerUUID);
      ItemLikeService.resetTrans(listsResponse, 'list', ownerUUID, listFieldInfos);
      var latestModified = ArrayService.updateArrays(listsResponse,
                                                     lists[ownerUUID].activeLists,
                                                     lists[ownerUUID].deletedLists,
                                                     getOtherArrays(ownerUUID));

      if (latestModified) {
        // Go through response to see if something was deleted
        for (var i=0, len=listsResponse.length; i<len; i++) {
          if (listsResponse[i].deleted) {
            for (var id in listDeletedCallbacks) {
              listDeletedCallbacks[id](listsResponse[i], ownerUUID);
            }
          }
        }
      }
      return latestModified;
    },
    getLists: function(ownerUUID) {
      initializeArrays(ownerUUID);
      return lists[ownerUUID].activeLists;
    },
    getArchivedLists: function(ownerUUID) {
      initializeArrays(ownerUUID);
      return lists[ownerUUID].archivedLists;
    },
    getDeletedLists: function(ownerUUID) {
      initializeArrays(ownerUUID);
      return lists[ownerUUID].deletedLists;
    },
    getListInfo: function(uuid, ownerUUID) {
      initializeArrays(ownerUUID);
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
    },
    saveList: function(list, ownerUUID) {
      initializeArrays(ownerUUID);
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
    getListStatus: function(list, ownerUUID) {
      initializeArrays(ownerUUID);
      var arrayInfo = ArrayService.getActiveArrayInfo(list,
                                                      lists[ownerUUID].activeLists,
                                                      lists[ownerUUID].deletedLists,
                                                      getOtherArrays(ownerUUID));

      if (arrayInfo) return arrayInfo.type;
    },
    addList: function(list, ownerUUID) {
      initializeArrays(ownerUUID);
      // Check that list is not deleted before trying to add
      if (this.getListStatus(list, ownerUUID) === 'deleted') return;
      setList(list, ownerUUID);
    },
    removeList: function(list, ownerUUID) {
      initializeArrays(ownerUUID);
      ArrayService.removeFromArrays(list,
                                    lists[ownerUUID].activeLists,
                                    lists[ownerUUID].deletedLists,
                                    getOtherArrays(ownerUUID));
    },
    deleteList: function(list, ownerUUID) {
      initializeArrays(ownerUUID);
      // Check if list has already been deleted
      if (this.getListStatus(list, ownerUUID) === 'deleted') return;
      return BackendClientService.deleteOnline('/api/' + ownerUUID + '/list/' + list.uuid,
                                               this.deleteListRegex)
      .then(function(result) {
        if (result.data) {
          list.deleted = result.data.deleted;
          list.modified = result.data.result.modified;
          updateList(list, ownerUUID);

          for (var id in listDeletedCallbacks) {
            listDeletedCallbacks[id](list, ownerUUID);
          }
        }
      });
    },
    undeleteList: function(list, ownerUUID) {
      initializeArrays(ownerUUID);
      // Check that list is deleted before trying to undelete
      if (this.getListStatus(list, ownerUUID) !== 'deleted') return;
      BackendClientService.postOnline('/api/' + ownerUUID + '/list/' + list.uuid + '/undelete',
                                      this.deleteListRegex)
      .then(function(result) {
        if (result.data) {
          delete list.deleted;
          list.modified = result.data.modified;
          updateList(list, ownerUUID);

          for (var id in listDeletedCallbacks) {
            listDeletedCallbacks[id](list, ownerUUID, true);
          }
        }
      });
    },
    archiveList: function(list, ownerUUID) {
      initializeArrays(ownerUUID);
      // Check that list is active before trying to archive
      var deferred = $q.defer();
      if (lists[ownerUUID].activeLists.indexOf(list) === -1) {
        deferred.reject();
      } else {
        BackendClientService.postOnline('/api/' + ownerUUID + '/list/' + list.uuid + '/archive',
                                        this.deleteListRegex)
        .then(function(result) {
          if (result.data) {
            list.archived = result.data.archived;
            ItemLikeService.updateObjectWithSetResult(list, result.data.result);
            updateList(list, ownerUUID);
            var latestModified = list.modified;

            // Add generated tag to the tag array
            var tagModified = TagsService.setGeneratedTag(result.data.history, ownerUUID);
            if (tagModified > latestModified) latestModified = tagModified;
            // Call child callbacks
            if (result.data.children) {
              for (var id in itemArchiveCallbacks) {
                var itemModified = itemArchiveCallbacks[id](result.data.children, result.data.archived,
                                                            ownerUUID);
                if (itemModified && itemModified > latestModified) latestModified = itemModified;
              }
            }
            deferred.resolve();
          }
        });
      }

      return deferred.promise;
    },

    // Regular expressions for list requests

    putNewListRegex: ItemLikeService.getPutNewRegex('list'),
    putExistingListRegex: ItemLikeService.getPutExistingRegex('list'),
    deleteListRegex: ItemLikeService.getDeleteRegex('list'),
    undeleteListRegex: ItemLikeService.getUndeleteRegex('list'),
    archiveListRegex: new RegExp(BackendClientService.apiPrefixRegex.source +
                                 BackendClientService.uuidRegex.source +
                                 listSlashRegex.source +
                                 BackendClientService.uuidRegex.source +
                                 archiveRegex.source),

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
      for (var i = 0, len = items.length; i < len; i++) {
        if (items[i].relationships) {
          if (items[i].relationships.parent === deletedList.uuid) {
            delete items[i].relationships.parent;
          }
        }
        if (items[i].trans) {
          if (items[i].trans.list === deletedList.uuid) {
            delete items[i].trans.list;
          }
        }
      }
    }
  };
}

ListsService['$inject'] = ['$q', 'ArrayService', 'BackendClientService', 'ExtendedItemService',
                           'ItemLikeService', 'TagsService'];
angular.module('em.lists').factory('ListsService', ListsService);
