/*global angular */
'use strict';

function ListsService($q, BackendClientService, ArrayService, TagsService){

  // An object containing lists for every owner
  var lists = {};

  var listRegex = /\/list/;
  var listSlashRegex = /\/list\//;
  var archiveRegex = /\/archive/;

  var itemArchiveCallbacks = {};
  var listDeletedCallbacks = {};

  function initializeArrays(ownerUUID){
    if (!lists[ownerUUID]){
      lists[ownerUUID] = {
        activeLists: [],
        deletedLists: [],
        archivedLists: []
      };
    }
  }

  function getOtherArrays(ownerUUID){
    return [{array: lists[ownerUUID].archivedLists, id: 'archived'}];
  }

  return {
    setLists: function(listsResponse, ownerUUID) {
      initializeArrays(ownerUUID);
      return ArrayService.setArrays(
        listsResponse,
        lists[ownerUUID].activeLists,
        lists[ownerUUID].deletedLists,
        getOtherArrays(ownerUUID));
    },
    updateLists: function(listsResponse, ownerUUID) {
      initializeArrays(ownerUUID);

      var latestModified = ArrayService.updateArrays(
        listsResponse,
        lists[ownerUUID].activeLists,
        lists[ownerUUID].deletedLists,
        getOtherArrays(ownerUUID));

      if (latestModified){
        // Go through response to see if something was deleted
        for (var i=0, len=listsResponse.length; i<len; i++) {
          if (listsResponse[i].deleted){
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
    getListByUUID: function(uuid, ownerUUID) {
      return lists[ownerUUID].activeLists.findFirstObjectByKeyValue('uuid', uuid);
    },
    saveList: function(list, ownerUUID) {
      initializeArrays(ownerUUID);
      var deferred = $q.defer();
      // Check that list is not deleted before trying to save
      if (lists[ownerUUID].deletedLists.indexOf(list) > -1){
        deferred.reject(list);
      }else if (list.uuid){
        // Existing list
        BackendClientService.putOnline('/api/' + ownerUUID + '/list/' + list.uuid,
                 this.putExistingListRegex, list).then(function(result) {
          if (result.data){
            list.modified = result.data.modified;
            ArrayService.updateItem(
              list,
              lists[ownerUUID].activeLists,
              lists[ownerUUID].deletedLists,
              getOtherArrays(ownerUUID));
            deferred.resolve(list);
          }
        });
      }else{
        // New list
        BackendClientService.putOnline('/api/' + ownerUUID + '/list',
                 this.putNewListRegex, list).then(function(result) {
          if (result.data){
            list.uuid = result.data.uuid;
            list.created = result.data.created;
            list.modified = result.data.modified;
            ArrayService.setItem(
              list,
              lists[ownerUUID].activeLists,
              lists[ownerUUID].deletedLists,
              getOtherArrays(ownerUUID));
            deferred.resolve(list);
          }
        });
      }
      return deferred.promise;
    },
    deleteList: function(list, ownerUUID) {
      initializeArrays(ownerUUID);
      // Check if list has already been deleted
      if (lists[ownerUUID].deletedLists.indexOf(list) > -1){
        return;
      }
      BackendClientService.deleteOnline('/api/' + ownerUUID + '/list/' + list.uuid,
               this.deleteListRegex).then(function(result) {
        if (result.data){
          list.deleted = result.data.deleted;
          list.modified = result.data.result.modified;
          ArrayService.updateItem(
            list,
            lists[ownerUUID].activeLists,
            lists[ownerUUID].deletedLists,
            getOtherArrays(ownerUUID));

          for (var id in listDeletedCallbacks) {
            listDeletedCallbacks[id](list, ownerUUID);
          }
        }
      });
    },
    undeleteList: function(list, ownerUUID) {
      initializeArrays(ownerUUID);
      // Check that list is deleted before trying to undelete
      if (lists[ownerUUID].deletedLists.indexOf(list) === -1){
        return;
      }
      BackendClientService.postOnline('/api/' + ownerUUID + '/list/' + list.uuid + '/undelete',
               this.deleteListRegex).then(function(result) {
        if (result.data){
          delete list.deleted;
          list.modified = result.data.modified;
          ArrayService.updateItem(
            list,
            lists[ownerUUID].activeLists,
            lists[ownerUUID].deletedLists,
            getOtherArrays(ownerUUID));
        }
      });
    },
    archiveList: function(list, ownerUUID) {
      initializeArrays(ownerUUID);
      // Check that list is active before trying to archive
      if (lists[ownerUUID].activeLists.indexOf(list) === -1){
        return;
      }
      BackendClientService.postOnline('/api/' + ownerUUID + '/list/' + list.uuid + '/archive',
               this.deleteListRegex).then(function(result) {
        if (result.data){
          list.archived = result.data.archived;
          list.modified = result.data.result.modified;
          ArrayService.updateItem(
            list,
            lists[ownerUUID].activeLists,
            lists[ownerUUID].deletedLists,
            getOtherArrays(ownerUUID));
          var latestModified = list.modified;

          // Add generated tag to the tag array
          var tagModified = TagsService.setGeneratedTag(result.data.history, ownerUUID);
          if (tagModified > latestModified) latestModified = tagModified;
          // Call child callbacks
          if (result.data.children){
            for (var id in itemArchiveCallbacks) {
              var itemModified = itemArchiveCallbacks[id](result.data.children, result.data.archived, ownerUUID);
              if (itemModified && itemModified > latestModified) latestModified = itemModified;
            }
          }
        }
      });
    },
    // Regular expressions for list requests
    putNewListRegex :
        new RegExp(BackendClientService.apiPrefixRegex.source +
                   BackendClientService.uuidRegex.source +
                   listRegex.source),
    putExistingListRegex:
        new RegExp(BackendClientService.apiPrefixRegex.source +
                   BackendClientService.uuidRegex.source +
                   listSlashRegex.source +
                   BackendClientService.uuidRegex.source),
    deleteListRegex:
        new RegExp(BackendClientService.apiPrefixRegex.source +
                   BackendClientService.uuidRegex.source +
                   listSlashRegex.source +
                   BackendClientService.uuidRegex.source),
    undeleteListRegex:
        new RegExp(BackendClientService.apiPrefixRegex.source +
                   BackendClientService.uuidRegex.source +
                   listSlashRegex.source +
                   BackendClientService.uuidRegex.source  +
                   BackendClientService.undeleteRegex.source),
    archiveListRegex:
        new RegExp(BackendClientService.apiPrefixRegex.source +
                   BackendClientService.uuidRegex.source +
                   listSlashRegex.source +
                   BackendClientService.uuidRegex.source  +
                   archiveRegex.source),
    // Register callbacks that are fired for implicit archiving of
    // elements. Callback must return the latest modified value it
    // stores to its arrays.
    registerItemArchiveCallback: function (itemArchiveCallback, id) {
      itemArchiveCallbacks[id] = itemArchiveCallback;
    },
    registerListDeletedCallback: function (listDeletedCallback, id) {
      listDeletedCallbacks[id] = listDeletedCallback;
    },
    removeDeletedListFromItems: function(items, deletedList) {
      for (var i=0, len=items.length; i<len; i++) {
        if (items[i].relationships){
          if (items[i].relationships.parent === deletedList.uuid){
            delete items[i].relationships.parent;
          }
          if (items[i].relationships.list === deletedList.uuid){
            delete items[i].relationships.list;
          }
        }
      }
    }
  };
}

ListsService.$inject = ['$q', 'BackendClientService', 'ArrayService', 'TagsService'];
angular.module('em.services').factory('ListsService', ListsService);