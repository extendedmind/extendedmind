/*global angular */
'use strict';

function ListsService(BackendClientService, UserSessionService, ArrayService, TagsService){
  var lists = [];
  var deletedLists = [];
  var arhivedLists = [];

  var listRegex = /\/list/;
  var listSlashRegex = /\/list\//;
  var archiveRegex = /\/archive/;

  var itemArchiveCallbacks = {};

  return {
    setLists : function(listsResponse) {
      ArrayService.setArrays(listsResponse, lists, deletedLists, arhivedLists, 'archived');
    },
    updateLists: function(listsResponse) {
      ArrayService.updateArrays(listsResponse, lists, deletedLists, arhivedLists, 'archived');
    },
    getLists : function() {
      return lists;
    },
    getListByUUID : function(uuid) {
      return lists.findFirstObjectByKeyValue('uuid', uuid);
    },
    saveList : function(list) {
      if (list.uuid){
        // Existing list
        BackendClientService.put('/api/' + UserSessionService.getActiveUUID() + '/list/' + list.uuid,
                 this.putExistingListRegex, list).then(function(result) {
          if (result.data){
            list.modified = result.data.modified;
            ArrayService.updateItem(list, lists, deletedLists, arhivedLists, 'archived');
          }
        });
      }else{
        // New list
        BackendClientService.put('/api/' + UserSessionService.getActiveUUID() + '/list',
                 this.putNewListRegex, list).then(function(result) {
          if (result.data){
            list.uuid = result.data.uuid;
            list.modified = result.data.modified;
            ArrayService.setItem(list, lists, deletedLists, arhivedLists, 'archived');
          }
        });
      }
    },
    deleteList : function(list) {
      BackendClientService.delete('/api/' + UserSessionService.getActiveUUID() + '/list/' + list.uuid,
               this.deleteListRegex).then(function(result) {
        if (result.data){
          list.deleted = result.data.deleted;
          list.modified = result.data.result.modified;
          ArrayService.updateItem(list, lists, deletedLists, arhivedLists, 'archived');
        }
      });
    },
    undeleteList : function(list) {
      BackendClientService.post('/api/' + UserSessionService.getActiveUUID() + '/list/' + list.uuid + '/undelete',
               this.deleteListRegex).then(function(result) {
        if (result.data){
          delete list.deleted;
          list.modified = result.data.modified;
          ArrayService.updateItem(list, lists, deletedLists, arhivedLists, 'archived');
        }
      });
    },
    archiveList : function(list) {
      BackendClientService.post('/api/' + UserSessionService.getActiveUUID() + '/list/' + list.uuid + '/archive',
               this.deleteListRegex).then(function(result) {
        if (result.data){
          list.archived = result.data.archived;
          list.modified = result.data.modified;
          ArrayService.updateItem(list, lists, deletedLists, arhivedLists, 'archived');
          // Add generated tag to the tag array
          TagsService.setGeneratedTag(result.data.history);
          // Call child callbacks
          if (result.data.children){
            for (var id in itemArchiveCallbacks) {
              itemArchiveCallbacks[id](result.data.children, result.data.archived);
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
    registerItemArchiveCallback : function (itemArchiveCallback, id){
      itemArchiveCallbacks[id] = itemArchiveCallback;
    }
  };
}
  
ListsService.$inject = ['BackendClientService', 'UserSessionService', 'ArrayService', 'TagsService'];
angular.module('em.services').factory('ListsService', ListsService);