/*global angular */
'use strict';

function TagsService($q, BackendClientService, ArrayService){

  // An object containing tags for every owner
  var tags = {};
  var tagRegex = /\/tag/;
  var tagSlashRegex = /\/tag\//;
 
  function initializeArrays(ownerUUID){
    if (!tags[ownerUUID]){
      tags[ownerUUID] = {
        activeTags: [],
        deletedTags: []
      };
    }    
  }

  return {
    setTags : function(tagsResponse, ownerUUID) {
      initializeArrays(ownerUUID);
      return ArrayService.setArrays(
        tagsResponse,
        tags[ownerUUID].activeTags,
        tags[ownerUUID].deletedTags);
    },
    updateTags: function(tagsResponse, ownerUUID) {
      initializeArrays(ownerUUID);
      return ArrayService.updateArrays(
        tagsResponse,
        tags[ownerUUID].activeTags,
        tags[ownerUUID].deletedTags);
    },
    getTags : function(ownerUUID) {
      initializeArrays(ownerUUID);
      return tags[ownerUUID].activeTags;
    },
    getTagByUUID : function(uuid, ownerUUID) {
      initializeArrays(ownerUUID);      
      return tags[ownerUUID].activeTags.findFirstObjectByKeyValue('uuid', uuid);
    },
    saveTag : function(tag, ownerUUID) {
      var deferred = $q.defer();      
      if (tag.uuid){
        // Existing tag
        BackendClientService.putOnline('/api/' + ownerUUID + '/tag/' + tag.uuid,
                 this.putExistingTagRegex, tag).then(function(result) {
          if (result.data){
            tag.modified = result.data.modified;
            initializeArrays(ownerUUID);            
            ArrayService.updateItem(
              tag,
              tags[ownerUUID].activeTags,
              tags[ownerUUID].deletedTags);
            deferred.resolve(tag);            
          }
        });
      }else{
        // New tag
        BackendClientService.putOnline('/api/' + ownerUUID + '/tag',
                 this.putNewTagRegex, tag).then(function(result) {
          if (result.data){
            tag.uuid = result.data.uuid;
            tag.modified = result.data.modified;
            initializeArrays(ownerUUID);
            ArrayService.setItem(
              tag,
              tags[ownerUUID].activeTags,
              tags[ownerUUID].deletedTags);
            deferred.resolve(tag);            
          }
        });
      }
      return deferred.promise;      
    },
    deleteTag : function(tag, ownerUUID) {
      BackendClientService.deleteOnline('/api/' + ownerUUID + '/tag/' + tag.uuid,
               this.deleteTagRegex).then(function(result) {
        if (result.data){
          tag.deleted = result.data.deleted;
          tag.modified = result.data.result.modified;
          ArrayService.updateItem(
              tag,
              tags[ownerUUID].activeTags,
              tags[ownerUUID].deletedTags);
        }
      });
    },
    undeleteTag : function(tag, ownerUUID) {
      BackendClientService.postOnline('/api/' + ownerUUID + '/tag/' + tag.uuid + '/undelete',
               this.deleteTagRegex).then(function(result) {
        if (result.data){
          delete tag.deleted;
          tag.modified = result.data.modified;
          ArrayService.updateItem(
              tag,
              tags[ownerUUID].activeTags,
              tags[ownerUUID].deletedTags);
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
    setGeneratedTag : function(tag, ownerUUID) {
      initializeArrays(ownerUUID);
      return ArrayService.setItem(
              tag,
              tags[ownerUUID].activeTags,
              tags[ownerUUID].deletedTags);
    }
  };
}
  
TagsService.$inject = ['$q', 'BackendClientService', 'ArrayService'];
angular.module('em.services').factory('TagsService', TagsService);