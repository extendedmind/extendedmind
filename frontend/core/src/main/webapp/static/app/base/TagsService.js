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

 function TagsService($q, ArrayService, BackendClientService, ItemLikeService, PersistentStorageService,
                      UserSessionService) {

  var tagFieldInfos = ItemLikeService.getFieldInfos(
    ['tagType',
    // TODO
    //'parent',
    //'visibility'
    ]
  );

  // An object containing tags for every owner
  var tags = {};

  var tagDeletedCallbacks = {};

  function initializeArrays(ownerUUID) {
    if (!tags[ownerUUID]) {
      tags[ownerUUID] = {
        activeTags: [],
        deletedTags: []
      };
    }
  }
  UserSessionService.registerNofifyOwnerCallback(initializeArrays, 'TagsService');

  function updateTag(tag, ownerUUID, oldUUID) {
    ItemLikeService.persistAndReset(tag, 'tag', ownerUUID, tagFieldInfos, oldUUID);
    return ArrayService.updateItem(tag,
                                   tags[ownerUUID].activeTags,
                                   tags[ownerUUID].deletedTags);
  }

  function setTag(tag, ownerUUID) {
    ItemLikeService.persistAndReset(tag, 'tag', ownerUUID, tagFieldInfos);
    return ArrayService.setItem(tag,
                                tags[ownerUUID].activeTags,
                                tags[ownerUUID].deletedTags);
  }

  return {
    getNewTag: function(initialValues, ownerUUID) {
      return ItemLikeService.getNew(initialValues, 'tag', ownerUUID, tagFieldInfos);
    },
    setTags: function(tagsResponse, ownerUUID) {
      ItemLikeService.persistAndReset(tagsResponse, 'tag', ownerUUID, tagFieldInfos);
      return ArrayService.setArrays(tagsResponse,
                                    tags[ownerUUID].activeTags,
                                    tags[ownerUUID].deletedTags);
    },
    updateTags: function(tagsResponse, ownerUUID) {
      ItemLikeService.persistAndReset(tagsResponse, 'tag', ownerUUID, tagFieldInfos);
      var latestModified = ArrayService.updateArrays(tagsResponse,
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
    updateTagModProperties: function(uuid, properties, ownerUUID) {
      var tagInfo = this.getNoteInfo(uuid, ownerUUID);
      if (tagInfo){
        if (properties === null){
          if (listInfo.list.mod){
            delete tagInfo.tag.mod;
            updateTag(tagInfo.tag, ownerUUID);
          }
        }else if (properties !== undefined){
          if (!tagInfo.tag.mod) tagInfo.tag.mod = {};
          ItemLikeService.updateObjectProperties(tagInfo.tag.mod, properties);
          updateTag(tagInfo.tag, ownerUUID, properties.uuid ? uuid : undefined);
        }
        return tagInfo.tag;
      }
    },
    getTags: function(ownerUUID) {
      return tags[ownerUUID].activeTags;
    },
    getDeletedTags: function(ownerUUID) {
      return tags[ownerUUID].deletedTags;
    },
    getTagInfo: function(uuid, ownerUUID) {
      var tag = tags[ownerUUID].activeTags.findFirstObjectByKeyValue('uuid', uuid, 'trans');
      if (tag){
        return {
          type: 'active',
          tag: tag
        };
      }
      tag = tags[ownerUUID].deletedTags.findFirstObjectByKeyValue('uuid', uuid, 'trans');
      if (tag){
        return {
          type: 'deleted',
          tag: tag
        };
      }
    },
    saveTag: function(tag, ownerUUID) {
      var deferred = $q.defer();
      if (tags[ownerUUID].deletedTags.findFirstObjectByKeyValue('uuid', tag.trans.uuid, 'trans')) {
        deferred.reject({type: 'deleted'});
      } else {
        ItemLikeService.save(tag, 'tag', ownerUUID, tagFieldInfos).then(
          function(result){
            if (result === 'new') setTag(tag, ownerUUID);
            else if (result === 'existing') updateTag(tag, ownerUUID);
            deferred.resolve(result);
          }, function(failure){
            deferred.reject(failure);
          }
        );
      }
      return deferred.promise;
    },
    isTagEdited: function(tag, ownerUUID) {
      return ItemLikeService.isEdited(tag, 'tag', ownerUUID, tagFieldInfos);
    },
    resetTag: function(tag, ownerUUID) {
      return ItemLikeService.resetTrans(tag, 'tag', ownerUUID, tagFieldInfos);
    },
    deleteTag: function(tag, ownerUUID) {
      var deferred = $q.defer();
      if (tags[ownerUUID].deletedTags.findFirstObjectByKeyValue('uuid', tag.trans.uuid, 'trans')) {
        deferred.resolve('unmodified');
      }else{
        ItemLikeService.processDelete(tag, 'tag', ownerUUID, tagFieldInfos).then(
          function(){
            updateTag(tag, ownerUUID);
            for (var id in tagDeletedCallbacks) {
              tagDeletedCallbacks[id](tag, ownerUUID);
            }
            deferred.resolve(tag);
          }, function(failure){
            deferred.reject(failure);
          }
        );
      }
      return deferred.promise;
    },
    undeleteTag: function(tag, ownerUUID) {
      var deferred = $q.defer();
      if (!tags[ownerUUID].deletedTags.findFirstObjectByKeyValue('uuid', tag.trans.uuid, 'trans')) {
        deferred.resolve('unmodified');
      }else{
        ItemLikeService.undelete(tag, 'tag', ownerUUID, tagFieldInfos).then(
          function(){
            updateTag(tag, ownerUUID);
            for (var id in tagDeletedCallbacks) {
              tagDeletedCallbacks[id](tag, ownerUUID, true);
            }
            deferred.resolve(tag);
          }, function(failure){
            deferred.reject(failure);
          }
        );
      }
      return deferred.promise;
    },
    // Regular expressions for tag requests
    putNewTagRegex: ItemLikeService.getPutNewRegex('tag'),
    putExistingTagRegex: ItemLikeService.getPutExistingRegex('tag'),
    deleteTagRegex: ItemLikeService.getDeleteRegex('tag'),
    undeleteTagRegex: ItemLikeService.getUndeleteRegex('tag'),

    // Special method used by ListsService to insert a generated
    // history tag to the tags array
    setGeneratedTag: function(tag, ownerUUID) {
      setTag(tag, ownerUUID);
    },
    // Register callbacks that are fired on tag deletion.
    registerTagDeletedCallback: function(tagDeletedCallback, id) {
      tagDeletedCallbacks[id] = tagDeletedCallback;
    },
    removeDeletedTagFromItems: function(items, deletedTag) {
      var modifiedItems = [];
      for (var i = 0, len = items.length; i < len; i++) {
        if (items[i].relationships && items[i].relationships.tags) {
          for (var j = 0, jlen = items[i].relationships.tags.length; j < jlen; j++) {
            if (items[i].relationships.tags[j] === deletedTag.uuid) {
              items[i].relationships.tags.splice(j, 1);
              modifiedItems.push(items[i]);
            }
          }
        }
      }
      return modifiedItems;
    }
  };
}

TagsService['$inject'] = ['$q', 'ArrayService', 'BackendClientService', 'ItemLikeService',
                          'PersistentStorageService', 'UserSessionService'];
angular.module('em.base').factory('TagsService', TagsService);
