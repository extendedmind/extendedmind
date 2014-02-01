/*global angular */
'use strict';

function ItemsService(BackendClientService, UserSessionService, ArrayService){
  var items = [];
  var itemRegex = /\/item/;
  var itemSlashRegex = /\/item\//;
  var deletedItems = [];

  return {
    setItems : function(itemsResponse) {
      ArrayService.setArrays(itemsResponse, items, deletedItems);
    },
    updateItems: function(itemsResponse) {
      ArrayService.updateArrays(itemsResponse, items, deletedItems);
    },
    getItems : function() {
      return items;
    },
    getItemByUUID : function(uuid) {
      return items.findFirstObjectByKeyValue('uuid', uuid);
    },
    saveItem : function(item) {
      if (item.uuid){
        // Existing item
        BackendClientService.put('/api/' + UserSessionService.getActiveUUID() + '/item/' + item.uuid,
                 this.putExistingItemRegex, item).then(function(result) {
          if (result.data){
            item.modified = result.data.modified;
            ArrayService.updateItem(item, items, deletedItems);
          }
        });
      }else{
        // New item
        BackendClientService.put('/api/' + UserSessionService.getActiveUUID() + '/item',
                 this.putNewItemRegex, item).then(function(result) {
          if (result.data){
            item.uuid = result.data.uuid;
            item.modified = result.data.modified;
            ArrayService.setItem(item, items, deletedItems);
          }
        });
      }
    },
    deleteItem : function(item) {
      BackendClientService.delete('/api/' + UserSessionService.getActiveUUID() + '/item/' + item.uuid,
               this.deleteItemRegex).then(function(result) {
        if (result.data){
          item.deleted = result.data.deleted;
          item.modified = result.data.result.modified;
          ArrayService.updateItem(item, items, deletedItems);
        }
      });
    },
    undeleteItem : function(item) {
      BackendClientService.post('/api/' + UserSessionService.getActiveUUID() + '/item/' + item.uuid + '/undelete',
               this.deleteItemRegex).then(function(result) {
        if (result.data){
          delete item.deleted;
          item.modified = result.data.modified;
          ArrayService.updateItem(item, items, deletedItems);
        }
      });
    },
    // Regular expressions for item requests
    putNewItemRegex :
        new RegExp(BackendClientService.apiPrefixRegex.source +
                   BackendClientService.uuidRegex.source +
                   itemRegex.source),
    putExistingItemRegex:
        new RegExp(BackendClientService.apiPrefixRegex.source +
                   BackendClientService.uuidRegex.source +
                   itemSlashRegex.source +
                   BackendClientService.uuidRegex.source),
    deleteItemRegex:
        new RegExp(BackendClientService.apiPrefixRegex.source +
                   BackendClientService.uuidRegex.source +
                   itemSlashRegex.source +
                   BackendClientService.uuidRegex.source),
    undeleteItemRegex:
        new RegExp(BackendClientService.apiPrefixRegex.source +
                   BackendClientService.uuidRegex.source +
                   itemSlashRegex.source +
                   BackendClientService.uuidRegex.source  +
                   BackendClientService.undeleteRegex.source),
  };
}
  
ItemsService.$inject = ['BackendClientService', 'UserSessionService', 'ArrayService'];
angular.module('em.services').factory('ItemsService', ItemsService);