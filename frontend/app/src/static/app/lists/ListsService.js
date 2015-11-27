/* Copyright 2013-2015 Extended Mind Technologies Oy
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

 /*global angular, jQuery */
 'use strict';

 function ListsService($q, ArrayService, BackendClientService, ExtendedItemService, ItemLikeService,
                       TagsService, UserSessionService, UUIDService) {
  var LIST_TYPE = 'list';

  var archivedFieldInfo = {
        name: 'archived',
        skipTransport: true,
        isEdited: function(){
          // Changing archived should not save list. Archiving is done with separate functions.
          return false;
        },
        resetTrans: function(list){
          if (list.mod && list.mod.hasOwnProperty('archived')){
            if (!list.mod.archived && list.trans.archived !== undefined) delete list.trans.archived;
            else list.trans.archived = list.mod.archived;
          }
          else if (list.archived !== undefined) list.trans.archived = list.archived;
          else if (list.trans.archived !== undefined) delete list.trans.archived;
        }
      };

  var listFieldInfos = ItemLikeService.getFieldInfos(
    [ 'due',
      archivedFieldInfo,
      {
        name: 'visibility',
        skipTransport: true,
        /*
        * trans !== mod || persistent
        */
        isEdited: function(list, ownerUUID, compareValues) {
          if (list.trans.visibility) {
            if (!compareValues) {
              if ((!list.mod || !list.mod.visibility) && !list.visibility) {
                // Not in mod nor in database.
                return true;
              }

              if (list.mod && list.mod.visibility) {
                if (!angular.equals(list.trans.visibility, list.mod.visibility)) {
                  // Trans does not match with mod.
                  return true;
                }
              } else if (list.visibility) {
                if (!angular.equals(list.trans.visibility, list.visibility)) {
                  // Trans does not match with database.
                  return true;
                }
              }
            } else {
              if (!compareValues.visibility) {
                return true;
              } else {
                if (!angular.equals(list.trans.visibility, compareValues.visibility)) {
                  // Trans does not match with compare values.
                  return true;
                }
              }
            }
          } else {
            if (!compareValues) {
              if (list.mod && list.mod.visibility) {
                // Not in trans but in mod.
                return true;
              } else if (list.visibility) {
                // Not in trans but in database.
                return true;
              }
            } else if (compareValues.visibility) {
              return true;
            }
          }
        },
        copyTransToMod: function(list) {
          if (list.trans.visibility) {
            // http://stackoverflow.com/a/23481096
            list.mod.visibility = JSON.parse(JSON.stringify(list.trans.visibility));
          } else {
            list.mod.visibility = undefined;
          }
        },
        /*
        * mod || persistent !== trans
        *
        * mod > persistent
        */
        resetTrans: function(list) {
          if (list.mod && list.mod.hasOwnProperty('visibility')) {
            if (!list.mod.visibility && list.trans.visibility !== undefined) {
              delete list.trans.visibility;
            } else if (list.mod.visibility !== undefined) {
              // Copy mod to trans.
              // http://stackoverflow.com/a/23481096
              list.trans.visibility = JSON.parse(JSON.stringify(list.mod.visibility));
            }
          } else if (list.visibility) {
            // Copy persistent to mod.
            // http://stackoverflow.com/a/23481096
            list.trans.visibility = JSON.parse(JSON.stringify(list.visibility));
          } else if (list.trans.visibility) {
            delete list.trans.visibility;
          }
        }
      },
      // TODO
      // 'assignee',
      // 'assigner',
      ExtendedItemService.getRelationshipsFieldInfo()
    ]
  );

  // Minimal field infos that are needed to sort lists in arrays
  var listMinimalFieldInfos = [
    'uuid',
    'created',
    'deleted',
    'title',
    archivedFieldInfo];

  // An object containing lists for every owner
  var lists = {};

  var listSlashRegex = /\/list\//;
  var archiveRegex = /\/archive/;
  var unarchiveRegex = /\/unarchive/;
  var agreementRegex = /agreement/;
  var agreementSlashRegex = /agreement\//;
  var acceptRegex = /\/accept/;
  var accessSlashRegex = /\/access\//;
  var resendRegex = /\/resend/;
  var oneOrTwoRegex = /[1-2]/;

  // PUT /api/agreement
  var putNewAgreementRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    agreementRegex.source +
    /$/.source
  );

  // POST /api/agreement/HEX/accept
  var postAcceptShareListRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    agreementSlashRegex.source +
    BackendClientService.hexCodeRegex.source +
    acceptRegex.source +
    /$/.source
  );

  // DELETE /api/agreement/UUID/
  var deleteAgreementRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    agreementSlashRegex.source +
    BackendClientService.uuidRegex.source +
    /$/.source
  );

  // POST /api/agreement/UUID/access/#
  var postChangeAgreementAccessRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    agreementSlashRegex.source +
    BackendClientService.uuidRegex.source +
    accessSlashRegex.source +
    oneOrTwoRegex.source +
    /$/.source
  );

  // POST /api/agreement/UUID/resend
  var postResendAgreementRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    agreementSlashRegex.source +
    BackendClientService.uuidRegex.source +
    resendRegex.source +
    /$/.source
  );

  var archiveListRegexp = new RegExp('^' +
    BackendClientService.apiPrefixRegex.source +
    BackendClientService.uuidRegex.source +
    listSlashRegex.source +
    BackendClientService.uuidRegex.source +
    archiveRegex.source +
    '$');

  var unarchiveListRegexp = new RegExp('^' +
    BackendClientService.apiPrefixRegex.source +
    BackendClientService.uuidRegex.source +
    listSlashRegex.source +
    BackendClientService.uuidRegex.source +
    unarchiveRegex.source +
    '$')

  var putNewListRegexp = ItemLikeService.getPutNewRegex(LIST_TYPE);
  var putExistingListRegexp = ItemLikeService.getPutExistingRegex(LIST_TYPE);

  var itemArchiveCallbacks = {};
  var listDeletedCallbacks = {};
  var listUUIDChangedCallbacks = {};

  function initializeArrays(ownerUUID) {
    if (!lists[ownerUUID]) {
      lists[ownerUUID] = {
        activeLists: [],
        deletedLists: [],
        archivedLists: []
      };
    }
  }
  function notifyOwners(userUUID, collectives, sharedLists) {
    var extraOwners = ItemLikeService.processOwners(userUUID, collectives, sharedLists,
                                                    lists, initializeArrays);
    for (var i=0; i < extraOwners.length; i++){
      // Need to destroy data from this owner
      ItemLikeService.destroyPersistentItems(
        lists[extraOwners[i]].activeLists.concat(
            lists[extraOwners[i]].deletedLists).concat(lists[extraOwners[i]].archivedLists));
      delete lists[extraOwners[i]];
    }
  }
  UserSessionService.registerNofifyOwnersCallback(notifyOwners, 'ListsService');


  // Setup callback for tags
  var tagDeletedCallback = function(deletedTag, ownerUUID, undelete) {
    if (lists[ownerUUID] && deletedTag) {
      var modifiedItems, i;
      if (!undelete){
        // Remove tags from existing parents
        modifiedItems = TagsService.removeDeletedTagFromItems(lists[ownerUUID].activeLists,
                                                                  deletedTag);
        modifiedItems.concat(TagsService.removeDeletedTagFromItems(lists[ownerUUID].deletedLists,
                                                                   deletedTag));
        modifiedItems.concat(TagsService.removeDeletedTagFromItems(lists[ownerUUID].archivedLists,
                                                                   deletedTag));
        for (i=0;i<modifiedItems.length;i++){
          updateList(modifiedItems[i], ownerUUID);
        }
      }else{
        // Add tag back to items on undelete
        modifiedItems = TagsService.addUndeletedTagToItems(lists[ownerUUID].activeLists,
                                                                    deletedTag);
        modifiedItems.concat(TagsService.addUndeletedTagToItems(lists[ownerUUID].deletedLists,
                                                                     deletedTag));
        modifiedItems.concat(TagsService.addUndeletedTagToItems(lists[ownerUUID].archivedLists,
                                                                     deletedTag));
        for (i=0;i<modifiedItems.length;i++){
          updateList(modifiedItems[i], ownerUUID);
        }
      }
    }
  };
  TagsService.registerTagDeletedCallback(tagDeletedCallback, 'ListsService');

  // Setup callback for collective tag sync
  var collectiveTagsSyncedCallback = function(updatedTags, listInfos, collectiveUUID) {
    if (listInfos && listInfos.length){
      for (var i=0; i<listInfos.length; i++){
        var listInfo = getListInfo(listInfos[i].uuid, listInfos[i].owner);
        if (listInfo){
          ItemLikeService.resetTrans(listInfo.note, LIST_TYPE, listInfo.note.trans.owner, listFieldInfos);
        }
      }
    }
  };
  TagsService.registerCollectiveTagsSyncedCallback(collectiveTagsSyncedCallback, LIST_TYPE);

  function getListInfo(value, ownerUUID, searchField){
    if (value !== undefined && ownerUUID !== undefined){
      var field = searchField ? searchField : 'uuid';
      var list = lists[ownerUUID].activeLists.findFirstObjectByKeyValue(field, value, 'trans');
      if (list){
        return {
          type: 'active',
          list: list
        };
      }
      list = lists[ownerUUID].deletedLists.findFirstObjectByKeyValue(field, value, 'trans');
      if (list){
        return {
          type: 'deleted',
          list: list
        };
      }
      list = lists[ownerUUID].archivedLists.findFirstObjectByKeyValue(field, value, 'trans');
      if (list){
        return {
          type: 'archived',
          list: list
        };
      }
    }
  }
  ExtendedItemService.registerGetListInfoCallback(getListInfo);

  function getOtherArrays(ownerUUID) {
    return [{array: lists[ownerUUID].archivedLists, id: 'archived'}];
  }

  function updateList(list, ownerUUID, oldItemUUID, propertiesToReset) {
    ItemLikeService.persistAndReset(list, LIST_TYPE, ownerUUID,
                                    listFieldInfos, oldItemUUID, propertiesToReset);
    return ArrayService.updateItem(ownerUUID, LIST_TYPE, list,
                                   lists[ownerUUID].activeLists,
                                   lists[ownerUUID].deletedLists,
                                   getOtherArrays(ownerUUID));
  }

  function setList(list, ownerUUID) {
    ItemLikeService.persistAndReset(list, LIST_TYPE, ownerUUID, listFieldInfos);
    ArrayService.setItem(ownerUUID, LIST_TYPE, list,
                         lists[ownerUUID].activeLists,
                         lists[ownerUUID].deletedLists,
                         getOtherArrays(ownerUUID));
  }

  function saveListOnline(list){
    var ownerUUID = list.trans.owner;
    if (!list.trans.uuid)
      list.trans.id = UUIDService.getShortIdFromFakeUUID(UUIDService.generateFakeUUID());
    var transportList = ItemLikeService.prepareTransport(list, LIST_TYPE, ownerUUID, listFieldInfos);
    var putUrl = list.trans.uuid ? '/api/' + ownerUUID + '/list/' + list.trans.uuid :
                                   '/api/' + ownerUUID + '/list';
    var putRegex = !list.trans.uuid ? putNewListRegexp : putExistingListRegexp;
    return BackendClientService.putOnline(putUrl, putRegex, transportList).then(
      function(response) {
        var propertiesToUpdate = {modified: response.modified};
        if (response.uuid){
          propertiesToUpdate.uuid = response.uuid;
        }
        if (response.created){
          propertiesToUpdate.created = response.created;
        }
        ItemLikeService.updateObjectProperties(list.mod, propertiesToUpdate);
        if (propertiesToUpdate.uuid){
          // Set new list
          setList(list, ownerUUID);
        }else{
          // Update existing list
          updateList(list, ownerUUID, undefined, propertiesToUpdate);
        }
        return response;
      },function(error){
        error.onSave = true;
        return $q.reject(error);
      });
  }

  return {
    getNewList: function(initialValues, ownerUUID) {
      return ItemLikeService.getNew(initialValues, LIST_TYPE, ownerUUID, listFieldInfos);
    },

    setLists: function(listsResponse, ownerUUID, skipPersist, addToExisting) {
      // To avoid problems with parent list not resetting to trans, we first store the response
      // to the arrays using minimal trans, then properly reset trans

      var listsToSave = ItemLikeService.resetAndPruneOldDeleted(listsResponse, LIST_TYPE,
                                                            ownerUUID, listMinimalFieldInfos);
      var latestModified;
      if (addToExisting){
        latestModified = ArrayService.updateArrays(ownerUUID, LIST_TYPE, listsToSave,
                                                       lists[ownerUUID].activeLists,
                                                       lists[ownerUUID].deletedLists,
                                                       getOtherArrays(ownerUUID));

      }else{
        latestModified = ArrayService.setArrays(ownerUUID, LIST_TYPE, listsToSave,
                                    lists[ownerUUID].activeLists,
                                    lists[ownerUUID].deletedLists,
                                    getOtherArrays(ownerUUID));
      }

      if (skipPersist){
        ItemLikeService.resetTrans(listsToSave, LIST_TYPE, ownerUUID, listFieldInfos);
      }else{
        ItemLikeService.persistAndReset(listsToSave, LIST_TYPE, ownerUUID, listFieldInfos);
      }
      // Without this, sorting lists fails, as the arrays are never re-evaluated
      ArrayService.evaluateArrays(ownerUUID, LIST_TYPE,
                                  lists[ownerUUID].activeLists,
                                  lists[ownerUUID].deletedLists,
                                  getOtherArrays(ownerUUID));
      return latestModified;
    },
    updateLists: function(listsResponse, ownerUUID) {
      if (listsResponse && listsResponse.length){
        // Go through listsResponse, and add .mod values if the fields in the current .mod do not match
        // the values in the persistent response
        var updatedLists = [], locallyDeletedLists = [], i, id;
        for (i=0; i<listsResponse.length; i++){
          var listInfo = this.getListInfo(listsResponse[i].uuid, ownerUUID);
          if (listInfo){
            if (listInfo.list.trans.deleted) locallyDeletedLists.push(listInfo.list);
            ItemLikeService.evaluateMod(listsResponse[i], listInfo.list,
                                        LIST_TYPE, ownerUUID, listFieldInfos);
            updatedLists.push(listInfo.list);
          }else{
            updatedLists.push(listsResponse[i]);
          }
        }

        // To avoid problems with parent list not resetting to trans, we first store the response
        // to the arrays using minimal trans, then properly reset trans
        ItemLikeService.resetTrans(updatedLists, LIST_TYPE, ownerUUID, listMinimalFieldInfos);
        var latestModified = ArrayService.updateArrays(ownerUUID, LIST_TYPE, updatedLists,
                                                       lists[ownerUUID].activeLists,
                                                       lists[ownerUUID].deletedLists,
                                                       getOtherArrays(ownerUUID));
        ItemLikeService.persistAndReset(updatedLists, LIST_TYPE, ownerUUID, listFieldInfos);

        // When creating multiple hierarchical lists in another client, without this, they would be
        // in the wrong order
        ArrayService.evaluateArrays(ownerUUID, LIST_TYPE,
                                  lists[ownerUUID].activeLists,
                                  lists[ownerUUID].deletedLists,
                                  getOtherArrays(ownerUUID));
        if (latestModified) {
          // Go through response to see if something was deleted
          for (i=0; i<updatedLists.length; i++) {
            if (updatedLists[i].deleted) {
              for (id in listDeletedCallbacks) {
                listDeletedCallbacks[id](updatedLists[i], ownerUUID);
              }
            }else if (locallyDeletedLists.indexOf(updatedLists[i]) !== -1){
              // Undeleted in another client
              for (id in listDeletedCallbacks) {
                listDeletedCallbacks[id](updatedLists[i], ownerUUID, true);
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
          if (properties.associated) {
            // Delete associated array before update.
            delete properties.associated;
          }
          ItemLikeService.updateObjectProperties(listInfo.list.mod, properties);
          if (properties.uuid){
            updateList(listInfo.list, ownerUUID, uuid, properties);
            for (var id in listUUIDChangedCallbacks) {
              listUUIDChangedCallbacks[id](uuid, properties.uuid, ownerUUID);
            }
          }else{
            updateList(listInfo.list, ownerUUID, undefined, properties);
          }
        }
        return listInfo.list;
      }
    },
    updateListHistProperties: function(uuid, properties, ownerUUID) {
      var listInfo = this.getListInfo(uuid, ownerUUID);
      if (listInfo){
        if (!properties){
          if (listInfo.list.hist){
            delete listInfo.list.hist;
            updateList(listInfo.list, ownerUUID);
          }
        }else{
          if (!listInfo.list.hist) listInfo.list.hist = {};
          ItemLikeService.updateObjectProperties(listInfo.list.hist, properties);
          // Last parameter is to prevent unnecessary resetting of trans
          updateList(listInfo.list, ownerUUID, undefined, {});
          return listInfo.list;
        }
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
                                            getOtherArrays(ownerUUID));
    },
    getListInfo: function(value, ownerUUID, searchField) {
      return getListInfo(value, ownerUUID, searchField);
    },
    saveList: function(list) {
      var deferred = $q.defer();
      var ownerUUID = list.trans.owner;
      if (lists[ownerUUID].deletedLists.findFirstObjectByKeyValue('uuid', list.trans.uuid, 'trans')) {
        deferred.reject({type: 'deleted'});
      } else {
        ItemLikeService.save(list, LIST_TYPE, ownerUUID, listFieldInfos).then(
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
    saveAndArchiveList: function(list){
      var deferred = $q.defer();
      var thisService = this;
      saveListOnline(list).then(
        function(){
          // Then, archive list
          thisService.archiveList(list).then(
            function(success){
              deferred.resolve(success);
            },function(error){
              deferred.reject(error);
            }
          );
        }, function(error){
          deferred.reject(error);
        });
      return deferred.promise;
    },
    saveAndUnarchiveList: function(list){
      var deferred = $q.defer();
      var thisService = this;
      saveListOnline(list).then(
        function(){
          // Then, unarchive list
          thisService.unarchiveList(list).then(
            function(success){
              deferred.resolve(success);
            },function(error){
              deferred.reject(error);
            }
          );
        }, function(error){
          deferred.reject(error);
        });
      return deferred.promise;
    },
    isListEdited: function(list) {
      var ownerUUID = list.trans.owner;
      return ItemLikeService.isEdited(list, LIST_TYPE, ownerUUID, listFieldInfos);
    },
    resetList: function(list) {
      var ownerUUID = list.trans.owner;
      return ItemLikeService.resetTrans(list, LIST_TYPE, ownerUUID, listFieldInfos);
    },
    getListStatus: function(list) {
      var ownerUUID = list.trans.owner;
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
        ItemLikeService.remove(listInfo.list.trans.uuid);
        ArrayService.removeFromArrays(ownerUUID, listInfo.list, LIST_TYPE,
                                      lists[ownerUUID].activeLists,
                                      lists[ownerUUID].deletedLists,
                                      getOtherArrays(ownerUUID));
        return listInfo.list.hist ? listInfo.list.hist : {};
      }
    },
    deleteList: function(list) {
      var ownerUUID = list.trans.owner;
      var deferred = $q.defer();
      if (lists[ownerUUID].deletedLists.findFirstObjectByKeyValue('uuid', list.trans.uuid, 'trans')) {
        deferred.resolve('unmodified');
      }else{
        ItemLikeService.processDelete(list, LIST_TYPE, ownerUUID, listFieldInfos).then(
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
    undeleteList: function(list) {
      var ownerUUID = list.trans.owner;
      var deferred = $q.defer();
      if (!lists[ownerUUID].deletedLists.findFirstObjectByKeyValue('uuid', list.trans.uuid, 'trans')) {
        deferred.resolve('unmodified');
      }else{
        ItemLikeService.undelete(list, LIST_TYPE, ownerUUID, listFieldInfos).then(
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
    archiveList: function(list) {
      function getArchiveUrl(params){
        return params.prefix + params.list.trans.uuid + '/archive';
      }
      var ownerUUID = list.trans.owner;
      // Check that list is active before trying to archive
      var deferred = $q.defer();
      if (lists[ownerUUID].deletedLists.findFirstObjectByKeyValue('uuid', list.trans.uuid, 'trans')) {
        deferred.reject({type: 'deleted'});
      }else if (lists[ownerUUID].archivedLists.findFirstObjectByKeyValue('uuid', list.trans.uuid, 'trans')) {
        deferred.resolve('unmodified');
      } else {
        var payload = list.trans.archiveParent ? {parent: list.trans.archiveParent.trans.uuid} : undefined;
        BackendClientService.postOnline({ value: '/api/' + ownerUUID + '/list/' +
                                                 list.trans.uuid + '/archive',
                                          refresh: getArchiveUrl,
                                          params: {
                                            prefix: '/api/' + ownerUUID + '/list/',
                                            list: list }},
                                        archiveListRegexp, payload)
        .then(function(response) {
          if (!list.mod) list.mod = {};
          var propertiesToReset = {
            archived: response.archived,
            modified: response.result.modified
          };
          if (list.mod.relationships) propertiesToReset.relationships = list.mod.relationships;
          else if (list.relationships) propertiesToReset.relationships = list.relationships;
          else propertiesToReset.relationships = {};
          if (!propertiesToReset.relationships.tags) propertiesToReset.relationships.tags = [];

          if (payload && payload.parent){
            propertiesToReset.relationships.parent = payload.parent;
            delete list.trans.archiveParent;
          }else {
            // Parent is removed on archive if it a new one isn't given as parameter
            propertiesToReset.relationships.parent = undefined;
          }

          // Add generated tag to the tag array
          TagsService.setGeneratedTag(response.history, ownerUUID);

          // Add generated tag to list tags array
          propertiesToReset.relationships.tags.push(response.history.uuid);

          // Add properties to .mod and update list
          ItemLikeService.updateObjectProperties(list.mod, propertiesToReset);
          updateList(list, ownerUUID, undefined, propertiesToReset);

          // Call child callbacks
          if (response.children) {
            for (var id in itemArchiveCallbacks) {
              itemArchiveCallbacks[id](response.children, response.archived, response.history, ownerUUID);
            }
          }
          deferred.resolve(response);
        },function(error){
          deferred.reject(error);
        });
      }
      return deferred.promise;
    },
    unarchiveList: function(list) {
      function getUnarchiveUrl(params){
        return params.prefix + params.list.trans.uuid + '/unarchive';
      }
      var ownerUUID = list.trans.owner;
      // Check that list is archived before trying to unarchive
      var deferred = $q.defer();
      if (lists[ownerUUID].deletedLists.findFirstObjectByKeyValue('uuid', list.trans.uuid, 'trans')) {
        deferred.reject({type: 'deleted'});
      }else if (lists[ownerUUID].activeLists.findFirstObjectByKeyValue('uuid', list.trans.uuid, 'trans')) {
        deferred.resolve('unmodified');
      } else {
        var payload = list.trans.activeParent ? {parent: list.trans.activeParent.trans.uuid} : undefined;
        BackendClientService.postOnline({ value: '/api/' + ownerUUID + '/list/' +
                                                 list.trans.uuid + '/unarchive',
                                          refresh: getUnarchiveUrl,
                                          params: {
                                            prefix: '/api/' + ownerUUID + '/list/',
                                            list: list }},
                                        unarchiveListRegexp, payload)
        .then(function(response) {
          if (!list.mod) list.mod = {};
          var propertiesToReset = {
            archived: undefined,
            modified: response.result.modified
          };
          if (list.mod.relationships) propertiesToReset.relationships = list.mod.relationships;
          else if (list.relationships) propertiesToReset.relationships = list.relationships;
          else propertiesToReset.relationships = {};

          if (payload && payload.parent){
            propertiesToReset.relationships.parent = payload.parent;
            delete list.trans.activeParent;
          }else {
            // Parent is removed on unarchive if it a new one isn't given as parameter
            propertiesToReset.relationships.parent = undefined;
          }

          ItemLikeService.updateObjectProperties(list.mod, propertiesToReset);
          updateList(list, ownerUUID, undefined, propertiesToReset);

          // Update the history tag
          var historyTag = TagsService.getTagInfo(response.history.result.uuid, ownerUUID);
          if (historyTag){
            if (!historyTag.tag.mod) historyTag.tag.mod = {};
            historyTag.tag.mod.deleted = response.history.deleted;
            historyTag.tag.mod.modified = response.history.result.modified;
            TagsService.updateTag(historyTag.tag, ownerUUID);
          }

          // Call child callbacks with unarchive=true
          if (response.children) {
            for (var id in itemArchiveCallbacks) {
              itemArchiveCallbacks[id](response.children, undefined,
                                       historyTag.tag ? historyTag.tag : undefined, ownerUUID, true);
            }
          }
          deferred.resolve(response);
        },function(error){
          deferred.reject(error);
        });
      }
      return deferred.promise;
    },
    shareList: function(list, newAgreement) {
      return BackendClientService.putOnline('/api/agreement', putNewAgreementRegexp, newAgreement)
      .then(function(response) {
        var ownerUUID = list.trans.owner;
        if (!list.mod) list.mod = {};
        var propertiesToReset = {
          visibility: list.trans.visibility ? list.trans.visibility : {}
        };
        if (!propertiesToReset.visibility.agreements) propertiesToReset.visibility.agreements = [];
        newAgreement.uuid = response.uuid;
        propertiesToReset.visibility.agreements.push(newAgreement);
        // Set modified to list, created is ignored, as it isn't returned with the list
        propertiesToReset.modified = response.modified;
        ItemLikeService.updateObjectProperties(list.mod, propertiesToReset);
        updateList(list, ownerUUID, undefined, propertiesToReset);

        return response;
      });
    },
    unshareList: function(list, agreementUUID) {
      return BackendClientService.deleteOnline('/api/agreement/' + agreementUUID, deleteAgreementRegexp)
      .then(function(response) {
        var ownerUUID = list.trans.owner;
        if (!list.mod) list.mod = {};
        var propertiesToReset = {
          visibility: list.trans.visibility
        };
        var agreementIndex = propertiesToReset.visibility.agreements.findFirstIndexByKeyValue('uuid',
                                                                                              agreementUUID);
        if (agreementIndex !== undefined) {
          propertiesToReset.visibility.agreements.splice(agreementIndex, 1);
        }
        // Set modified to the list, not the agreement
        propertiesToReset.modified = response.modified;
        ItemLikeService.updateObjectProperties(list.mod, propertiesToReset);
        updateList(list, ownerUUID, undefined, propertiesToReset);
        return;
      });
    },
    updateExistingListShareAccess: function(list, agreementUUID, agreementAccess) {
      return BackendClientService.postOnline('/api/agreement/' + agreementUUID + '/access/' +
                                             agreementAccess, postChangeAgreementAccessRegexp)
      .then(function(response) {
        var ownerUUID = list.trans.owner;
        if (!list.mod) list.mod = {};
        var propertiesToReset = {
          visibility: list.trans.visibility
        };

        var agreementIndex = propertiesToReset.visibility.agreements.findFirstIndexByKeyValue('uuid',
                                                                                              agreementUUID);
        if (agreementIndex !== undefined) {
          var agreement = propertiesToReset.visibility.agreements[agreementIndex];
          agreement.access = agreementAccess;
          // Set modified to the list, not the agreement
          propertiesToReset.modified = response.modified;
          ItemLikeService.updateObjectProperties(list.mod, propertiesToReset);
          updateList(list, ownerUUID, undefined, propertiesToReset);
        }
        return response;
      });
    },
    resendListShare: function(agreementUUID) {
      return BackendClientService.postOnline('/api/agreement/' + agreementUUID + '/resend',
                                             postResendAgreementRegexp);
    },
    clearLists: function() {
      lists = {};
    },
    changeOwnerUUID: function(oldUUID, newUUID){
      if (lists[oldUUID]){
        lists[newUUID] = lists[oldUUID];
        delete lists[oldUUID];
        ItemLikeService.persistAndReset(lists[newUUID].activeLists, LIST_TYPE, newUUID, listFieldInfos);
        ItemLikeService.persistAndReset(lists[newUUID].archivedLists, LIST_TYPE, newUUID, listFieldInfos);
        ItemLikeService.persistAndReset(lists[newUUID].deletedLists, LIST_TYPE, newUUID, listFieldInfos);
      }
    },
    /*
    * Check active and archived arrays for lists with the given parentList as parent.
    */
    isListsWithParent: function(parentList) {
      var ownerUUID = parentList.trans.owner;
      var i;
      for (i = 0; i < lists[ownerUUID].activeLists.length; i++) {
        if (lists[ownerUUID].activeLists[i].trans.list &&
            lists[ownerUUID].activeLists[i].trans.list.uuid === parentList.trans.uuid)
        {
          return true;
        }
      }
      for (i = 0; i < lists[ownerUUID].archivedLists.length; i++){
        if (lists[ownerUUID].archivedLists[i].trans.list &&
            lists[ownerUUID].archivedLists[i].trans.list.uuid === parentList.trans.uuid)
        {
          return true;
        }
      }
    },
    resetOwnerData: function(ownerUUID){
      if (lists[ownerUUID]){
        ItemLikeService.destroyPersistentItems(
          lists[ownerUUID].activeLists.concat(
            lists[ownerUUID].deletedLists).concat(lists[ownerUUID].archivedLists));
        initializeArrays(ownerUUID);
      }
    },
    listFieldInfos: listFieldInfos,
    // Regular expressions for list requests
    putNewListRegex: putNewListRegexp,
    putExistingListRegex: putExistingListRegexp,
    deleteListRegex: ItemLikeService.getDeleteRegex(LIST_TYPE),
    undeleteListRegex: ItemLikeService.getUndeleteRegex(LIST_TYPE),
    archiveListRegex: archiveListRegexp,
    unarchiveListRegex: unarchiveListRegexp,
    putNewAgreementRegex: putNewAgreementRegexp,
    postAcceptShareListRegex: postAcceptShareListRegexp,
    deleteAgreementRegex: deleteAgreementRegexp,
    postChangeAgreementAccessRegex: postChangeAgreementAccessRegexp,
    postResendAgreementRegex: postResendAgreementRegexp,

    // Register callbacks that are fired for implicit archiving of
    // elements. Callback must return the latest modified value it
    // stores to its arrays.
    registerItemArchiveCallback: function(itemArchiveCallback, id) {
      itemArchiveCallbacks[id] = itemArchiveCallback;
    },
    registerListDeletedCallback: function(listDeletedCallback, id) {
      listDeletedCallbacks[id] = listDeletedCallback;
    },
    registerListUUIDChangedCallback: function(listUUIDChangedCallback, id) {
      listUUIDChangedCallbacks[id] = listUUIDChangedCallback;
    },
    removeDeletedListFromItems: function(items, deletedList) {
      var modifiedItems = [];
      for (var i = 0, len = items.length; i < len; i++) {
        var found = false;
        if (items[i].relationships && items[i].relationships.parent === deletedList.trans.uuid) {
          found = true;
          delete items[i].relationships.parent;
          if (jQuery.isEmptyObject(items[i].relationships)){
            delete items[i].relationships;
          }

        }
        if (items[i].mod && items[i].mod.relationships &&
                  items[i].mod.relationships.parent === deletedList.trans.uuid){
          found = true;
          items[i].mod.relationships.parent = undefined;
        }
        if (found){
          // Add deleted list to item history
          if (!items[i].hist) items[i].hist = {};
          items[i].hist.deletedList = deletedList.trans.uuid;
          modifiedItems.push(items[i]);
        }
      }
      return modifiedItems;
    },
    addUndeletedListToItems: function(items, deletedList) {
      var modifiedItems = [];
      for (var i = 0, len = items.length; i < len; i++) {
        if (items[i].hist && items[i].hist.deletedList === deletedList.trans.uuid) {
          // Only add to mod if not already in persistent fields
          if (!items[i].relationships || items[i].relationships.parent !== deletedList.trans.uuid){
            if (!items[i].mod) items[i].mod = {};
            if (!items[i].mod.relationships) items[i].mod.relationships = {};
            items[i].mod.relationships.parent = deletedList.trans.uuid;
          }
          delete items[i].hist.deletedList;
          if (jQuery.isEmptyObject(items[i].hist)) delete items[i].hist;
          modifiedItems.push(items[i]);
        }
      }
      return modifiedItems;
    }
  };
}

ListsService['$inject'] = ['$q', 'ArrayService', 'BackendClientService', 'ExtendedItemService',
                           'ItemLikeService', 'TagsService', 'UserSessionService', 'UUIDService'];
angular.module('em.lists').factory('ListsService', ListsService);
