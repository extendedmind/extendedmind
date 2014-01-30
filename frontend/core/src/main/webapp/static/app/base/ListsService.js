/*jslint eqeq: true, white: true */
'use strict';

function ListsService(BackendClientService, UserSessionService){
  var lists = [];

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
      return lists.findFirstObjectByKeyValue('uuid', uuid)
    },
    updateListByUUID : function(uuid, list) {
      var index = lists.findFirstIndexByKeyValue('uuid', uuid);
      lists[index] = list;
    },
    saveList : function(list) {
      var result;
      if (list.uuid){
        // Existing list
        result = BackendClientService.put('/api/' 
                 + UserSessionService.getActiveUUID() 
                 + '/list/' + list.uuid, 
                 this.putExistingListRegex, list);
        if (result){
          list.modified = result.modified;
          lists.updateListByUUID(list.uuid, list);
        }
      }else{
        // New list
        result = BackendClientService.put('/api/' 
                 + UserSessionService.getActiveUUID() 
                 + '/list', 
                 this.putNewListRegex, list);
        if (result){
          list.uuid = result.uuid;
          list.modified = result.modified;
          lists.push(list);
        }
      }
    },
    // Regular expressions used in tests
    putNewListRegex : 
        new RegExp(BackendClientService.apiPrefixRegex.source 
                   + BackendClientService.uuidRegex.source
                   + "/list"),
    putExistingListRegex : 
        new RegExp(BackendClientService.apiPrefixRegex.source 
                   + BackendClientService.uuidRegex.source
                   + "/list/"
                   + BackendClientService.uuidRegex.source)

  };
};
  
ListsService.$inject = ['BackendClientService', 'UserSessionService'];
angular.module('em.services').factory('ListsService', ListsService);