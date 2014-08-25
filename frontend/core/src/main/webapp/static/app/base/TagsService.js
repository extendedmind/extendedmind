/* Copyright 2013-2014 Extended Mind Technologies Oy
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

 /*global angular */
 'use strict';

 function TagsService($q, ArrayService, BackendClientService) {

  // An object containing tags for every owner
  var tags = {};
  var tagRegex = /\/tag/;
  var tagSlashRegex = /\/tag\//;

  var tagDeletedCallbacks = {};

  function initializeArrays(ownerUUID) {
    if (!tags[ownerUUID]) {
      tags[ownerUUID] = {
        activeTags: [],
        deletedTags: []
      };
    }
  }

  return {
    setTags: function(tagsResponse, ownerUUID) {
      initializeArrays(ownerUUID);
      return ArrayService.setArrays(
        tagsResponse,
        tags[ownerUUID].activeTags,
        tags[ownerUUID].deletedTags);
    },
    updateTags: function(tagsResponse, ownerUUID) {
      initializeArrays(ownerUUID);
      var latestModified = ArrayService.updateArrays(
        tagsResponse,
        tags[ownerUUID].activeTags,
        tags[ownerUUID].deletedTags);
      if (latestModified) {
        // Go through response to see if something was deleted
        for (var i=0, len=tagsResponse.length; i<len; i++) {
          if (tagsResponse[i].deleted) {
            for (var id in tagDeletedCallbacks) {
              tagDeletedCallbacks[id](tagsResponse[i], ownerUUID);
            }
          }
        }
      }
      return latestModified;
    },
    getTags: function(ownerUUID) {
      initializeArrays(ownerUUID);
      return tags[ownerUUID].activeTags;
    },
    getTagByUUID: function(uuid, ownerUUID) {
      initializeArrays(ownerUUID);
      return tags[ownerUUID].activeTags.findFirstObjectByKeyValue('uuid', uuid);
    },
    saveTag: function(tag, ownerUUID) {
      initializeArrays(ownerUUID);
      var deferred = $q.defer();
      if (tags[ownerUUID].deletedTags.indexOf(tag) > -1) {
        deferred.reject(tag);
      } else if (tag.uuid) {
        // Existing tag
        BackendClientService.putOnline('/api/' + ownerUUID + '/tag/' + tag.uuid,
         this.putExistingTagRegex, tag).then(function(result) {
          if (result.data) {
            tag.modified = result.data.modified;
            ArrayService.updateItem(
              tag,
              tags[ownerUUID].activeTags,
              tags[ownerUUID].deletedTags);
            deferred.resolve(tag);
          }
        });
       } else {
        // New tag
        BackendClientService.putOnline('/api/' + ownerUUID + '/tag',
         this.putNewTagRegex, tag).then(function(result) {
          if (result.data) {
            tag.uuid = result.data.uuid;
            tag.created = result.data.created;
            tag.modified = result.data.modified;
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
     deleteTag: function(tag, ownerUUID) {
      initializeArrays(ownerUUID);
      // Check if tag has already been deleted
      if (tags[ownerUUID].deletedTags.indexOf(tag) > -1) {
        return;
      }
      BackendClientService.deleteOnline('/api/' + ownerUUID + '/tag/' + tag.uuid,
       this.deleteTagRegex).then(function(result) {
        if (result.data) {
          tag.deleted = result.data.deleted;
          tag.modified = result.data.result.modified;
          ArrayService.updateItem(
            tag,
            tags[ownerUUID].activeTags,
            tags[ownerUUID].deletedTags);

          for (var id in tagDeletedCallbacks) {
            tagDeletedCallbacks[id](tag, ownerUUID);
          }
        }
      });
     },
     undeleteTag: function(tag, ownerUUID) {
      initializeArrays(ownerUUID);
      // Check that tag is deleted before trying to undelete
      if (tags[ownerUUID].deletedTags.indexOf(tag) === -1) {
        return;
      }
      BackendClientService.postOnline('/api/' + ownerUUID + '/tag/' + tag.uuid + '/undelete',
       this.deleteTagRegex).then(function(result) {
        if (result.data) {
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
    putNewTagRegex:
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
      BackendClientService.uuidRegex.source +
      BackendClientService.undeleteRegex.source),
    // Special method used by ListsService to insert a generated
    // history tag to the tags array
    setGeneratedTag: function(tag, ownerUUID) {
      initializeArrays(ownerUUID);
      return ArrayService.setItem(
        tag,
        tags[ownerUUID].activeTags,
        tags[ownerUUID].deletedTags);
    },
    // Register callbacks that are fired on tag deletion.
    registerTagDeletedCallback: function(tagDeletedCallback, id) {
      tagDeletedCallbacks[id] = tagDeletedCallback;
    },
    removeDeletedTagFromItems: function(items, deletedTag) {
      for (var i = 0, len = items.length; i < len; i++) {
        if (items[i].relationships) {
          if (items[i].relationships.tags) {
            for (var j = 0, jlen = items[i].relationships.tags.length; j < jlen; j++) {
              if (items[i].relationships.tags[j] === deletedTag.uuid) {
                items[i].relationships.tags.splice(j, 1);
              }
            }
          }
          if (items[i].relationships.context === deletedTag.uuid) {
            delete items[i].relationships.context;
          }
        }
      }
    }
  };
}

TagsService['$inject'] = ['$q', 'ArrayService', 'BackendClientService'];
angular.module('em.base').factory('TagsService', TagsService);
