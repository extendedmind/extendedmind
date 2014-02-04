/*global angular */
'use strict';

function ListsService($q, BackendClientService, UserSessionService, ArrayService, TagsService){
  var lists = [];
  var deletedLists = [];
  var archivedLists = [];
  var otherArrays = [{array: archivedLists, id: 'archived'}];

  var listRegex = /\/list/;
  var listSlashRegex = /\/list\//;
  var archiveRegex = /\/archive/;

  var itemArchiveCallbacks = {};

  return {
    setLists: function(listsResponse) {
      return ArrayService.setArrays(listsResponse, lists, deletedLists, otherArrays);
    },
    updateLists: function(listsResponse) {
      return ArrayService.updateArrays(listsResponse, lists, deletedLists, otherArrays);
    },
    getLists: function() {
      return lists;
    },
    getArchivedLists: function() {
      return archivedLists;
    },
    getListByUUID: function(uuid) {
      return lists.findFirstObjectByKeyValue('uuid', uuid);
    },
    saveList: function(list) {
      var deferred = $q.defer();      
      if (list.uuid){
        // Existing list
        BackendClientService.put('/api/' + UserSessionService.getActiveUUID() + '/list/' + list.uuid,
                 this.putExistingListRegex, list).then(function(result) {
          if (result.data){
            list.modified = result.data.modified;
            ArrayService.updateItem(list, lists, deletedLists, otherArrays);
            deferred.resolve(list);
          }
        });
      }else{
        // New list
        BackendClientService.put('/api/' + UserSessionService.getActiveUUID() + '/list',
                 this.putNewListRegex, list).then(function(result) {
          if (result.data){
            list.uuid = result.data.uuid;
            list.modified = result.data.modified;
            ArrayService.setItem(list, lists, deletedLists, otherArrays);
            deferred.resolve(list);
          }
        });
      }
      return deferred.promise;      
    },
    deleteList: function(list) {
      BackendClientService.delete('/api/' + UserSessionService.getActiveUUID() + '/list/' + list.uuid,
               this.deleteListRegex).then(function(result) {
        if (result.data){
          list.deleted = result.data.deleted;
          list.modified = result.data.result.modified;
          ArrayService.updateItem(list, lists, deletedLists, otherArrays);
        }
      });
    },
    undeleteList: function(list) {
      BackendClientService.post('/api/' + UserSessionService.getActiveUUID() + '/list/' + list.uuid + '/undelete',
               this.deleteListRegex).then(function(result) {
        if (result.data){
          delete list.deleted;
          list.modified = result.data.modified;
          ArrayService.updateItem(list, lists, deletedLists, otherArrays);
        }
      });
    },
    archiveList: function(list) {
      BackendClientService.post('/api/' + UserSessionService.getActiveUUID() + '/list/' + list.uuid + '/archive',
               this.deleteListRegex).then(function(result) {
        if (result.data){
          list.archived = result.data.archived;
          list.modified = result.data.result.modified;
          ArrayService.updateItem(list, lists, deletedLists, otherArrays);
          var latestModified = list.modified;

          // Add generated tag to the tag array
          var tagModified = TagsService.setGeneratedTag(result.data.history);
          if (tagModified > latestModified) latestModified = tagModified;
          // Call child callbacks
          if (result.data.children){
            for (var id in itemArchiveCallbacks) {
              var itemModified = itemArchiveCallbacks[id](result.data.children, result.data.archived);
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
    registerItemArchiveCallback: function (itemArchiveCallback, id){
      itemArchiveCallbacks[id] = itemArchiveCallback;
    }
  };
}
  
ListsService.$inject = ['$q', 'BackendClientService', 'UserSessionService', 'ArrayService', 'TagsService'];
angular.module('em.services').factory('ListsService', ListsService);