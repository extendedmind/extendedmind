/*global angular */
'use strict';

function ListsService(BackendClientService, UserSessionService){
  var lists = [];
  var listRegex = /\/list/;
  var listSlashRegex = /\/list\//;

  return {
    // Called by ItemsService to initialize with existing data
    setLists : function(listsResponse) {
      lists.length = 0;
      if (listsResponse) {
        var i = 0;
        while (listsResponse[i]) {
          lists.push(listsResponse[i]);
          i++;
        }
      }
    },
    getLists : function() {
      return lists;
    },
    getListByUUID : function(uuid) {
      return lists.findFirstObjectByKeyValue('uuid', uuid);
    },
    updateListByUUID : function(uuid, list) {
      var index = lists.findFirstIndexByKeyValue('uuid', uuid);
      lists[index] = list;
    },
    saveList : function(list) {
      if (list.uuid){
        var thisService = this;
        // Existing list
        BackendClientService.put('/api/' + UserSessionService.getActiveUUID() + '/list/' + list.uuid,
                 this.putExistingListRegex, list).then(function(result) {
          if (result.data){
            list.modified = result.data.modified;
            thisService.updateListByUUID(list.uuid, list);
          }
        });
      }else{
        // New list
        BackendClientService.put('/api/' + UserSessionService.getActiveUUID() + '/list',
                 this.putNewListRegex, list).then(function(result) {
          if (result.data){
            list.uuid = result.data.uuid;
            list.modified = result.data.modified;
            lists.push(list);
          }
        });
      }
    },
    // Regular expressions used in tests
    putNewListRegex :
        new RegExp(BackendClientService.apiPrefixRegex.source +
                   BackendClientService.uuidRegex.source +
                   listRegex.source),
    putExistingListRegex:
        new RegExp(BackendClientService.apiPrefixRegex.source +
                   BackendClientService.uuidRegex.source +
                   listSlashRegex.source +
                   BackendClientService.uuidRegex.source)

  };
}
  
ListsService.$inject = ['BackendClientService', 'UserSessionService'];
angular.module('em.services').factory('ListsService', ListsService);