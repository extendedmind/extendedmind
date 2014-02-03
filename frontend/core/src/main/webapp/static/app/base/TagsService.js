/*global angular */
'use strict';

function TagsService(BackendClientService, UserSessionService, ArrayService){
  var tags = [];
  var tagRegex = /\/tag/;
  var tagSlashRegex = /\/tag\//;
  var deletedTags = [];

  return {
    setTags : function(tagsResponse) {
      return ArrayService.setArrays(tagsResponse, tags, deletedTags);
    },
    updateTags: function(tagsResponse) {
      return ArrayService.updateArrays(tagsResponse, tags, deletedTags);
    },
    getTags : function() {
      return tags;
    },
    getTagByUUID : function(uuid) {
      return tags.findFirstObjectByKeyValue('uuid', uuid);
    },
    saveTag : function(tag) {
      if (tag.uuid){
        // Existing tag
        BackendClientService.put('/api/' + UserSessionService.getActiveUUID() + '/tag/' + tag.uuid,
                 this.putExistingTagRegex, tag).then(function(result) {
          if (result.data){
            tag.modified = result.data.modified;
            ArrayService.updateItem(tag, tags, deletedTags);
          }
        });
      }else{
        // New tag
        BackendClientService.put('/api/' + UserSessionService.getActiveUUID() + '/tag',
                 this.putNewTagRegex, tag).then(function(result) {
          if (result.data){
            tag.uuid = result.data.uuid;
            tag.modified = result.data.modified;
            ArrayService.setItem(tag, tags, deletedTags);
          }
        });
      }
    },
    deleteTag : function(tag) {
      BackendClientService.delete('/api/' + UserSessionService.getActiveUUID() + '/tag/' + tag.uuid,
               this.deleteTagRegex).then(function(result) {
        if (result.data){
          tag.deleted = result.data.deleted;
          tag.modified = result.data.result.modified;
          ArrayService.updateItem(tag, tags, deletedTags);
        }
      });
    },
    undeleteTag : function(tag) {
      BackendClientService.post('/api/' + UserSessionService.getActiveUUID() + '/tag/' + tag.uuid + '/undelete',
               this.deleteTagRegex).then(function(result) {
        if (result.data){
          delete tag.deleted;
          tag.modified = result.data.modified;
          ArrayService.updateItem(tag, tags, deletedTags);
        }
      });
    },
    // Regular expressions for tag requests
    putNewTagRegex :
        new RegExp(BackendClientService.apiPrefixRegex.source +
                   BackendClientService.uuidRegex.source +
                   tagRegex.source),
    putExistingTagRegex:
        new RegExp(BackendClientService.apiPrefixRegex.source +
                   BackendClientService.uuidRegex.source +
                   tagSlashRegex.source +
                   BackendClientService.uuidRegex.source),
    deleteTagRegex:
        new RegExp(BackendClientService.apiPrefixRegex.source +
                   BackendClientService.uuidRegex.source +
                   tagSlashRegex.source +
                   BackendClientService.uuidRegex.source),
    undeleteTagRegex:
        new RegExp(BackendClientService.apiPrefixRegex.source +
                   BackendClientService.uuidRegex.source +
                   tagSlashRegex.source +
                   BackendClientService.uuidRegex.source  +
                   BackendClientService.undeleteRegex.source),
    // Special method used by ListsService to insert a generated
    // history tag to the tags array
    setGeneratedTag : function(tag) {
      return ArrayService.setItem(tag, tags, deletedTags);
    }        
  };
}
  
TagsService.$inject = ['BackendClientService', 'UserSessionService', 'ArrayService'];
angular.module('em.services').factory('TagsService', TagsService);