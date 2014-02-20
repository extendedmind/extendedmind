/*global angular */
'use strict';

function ListsService($q, BackendClientService, ArrayService, TagsService){

  // An object containing lists for every owner
  var lists = {};

  var listRegex = /\/list/;
  var listSlashRegex = /\/list\//;
  var archiveRegex = /\/archive/;

  var itemArchiveCallbacks = {};

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
      return ArrayService.updateArrays(
        listsResponse,
        lists[ownerUUID].activeLists,
        lists[ownerUUID].deletedLists,
        getOtherArrays(ownerUUID));
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
      var deferred = $q.defer();
      if (list.uuid){
        // Existing list
        BackendClientService.putOnline('/api/' + ownerUUID + '/list/' + list.uuid,
                 this.putExistingListRegex, list).then(function(result) {
          if (result.data){
            list.modified = result.data.modified;
            initializeArrays(ownerUUID);
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
            list.modified = result.data.modified;
            initializeArrays(ownerUUID);
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
        }
      });
    },
    undeleteList: function(list, ownerUUID) {
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
    }
  };
}
  
ListsService.$inject = ['$q', 'BackendClientService', 'ArrayService', 'TagsService'];
angular.module('em.services').factory('ListsService', ListsService);