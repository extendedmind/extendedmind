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

 /*global angular, jQuery */
 'use strict';

 function TagsService($q, ArrayService, BackendClientService, ItemLikeService, UserSessionService) {
  var TAG_TYPE = 'tag';

  var tagFieldInfos = ItemLikeService.getFieldInfos(
    ['tagType'
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
    ItemLikeService.persistAndReset(tag, TAG_TYPE, ownerUUID, tagFieldInfos, oldUUID);
    return ArrayService.updateItem(ownerUUID, TAG_TYPE, tag,
                                   tags[ownerUUID].activeTags,
                                   tags[ownerUUID].deletedTags);
  }

  function setTag(tag, ownerUUID) {
    ItemLikeService.persistAndReset(tag, TAG_TYPE, ownerUUID, tagFieldInfos);
    return ArrayService.setItem(ownerUUID, TAG_TYPE, tag,
                                tags[ownerUUID].activeTags,
                                tags[ownerUUID].deletedTags);
  }

  return {
    getNewTag: function(initialValues, ownerUUID) {
      return ItemLikeService.getNew(initialValues, TAG_TYPE, ownerUUID, tagFieldInfos);
    },
    setTags: function(tagsResponse, ownerUUID, skipPersist, addToExisting) {
      if (skipPersist){
        ItemLikeService.resetTrans(tagsResponse, TAG_TYPE, ownerUUID, tagFieldInfos);
      }else{
        ItemLikeService.persistAndReset(tagsResponse, TAG_TYPE, ownerUUID, tagFieldInfos);
      }
      if (addToExisting){
        return ArrayService.updateArrays(ownerUUID, TAG_TYPE, tagsResponse,
                                    tags[ownerUUID].activeTags,
                                    tags[ownerUUID].deletedTags);
      }else{
        return ArrayService.setArrays(ownerUUID, TAG_TYPE, tagsResponse,
                                    tags[ownerUUID].activeTags,
                                    tags[ownerUUID].deletedTags);
      }
    },
    updateTags: function(tagsResponse, ownerUUID) {
      if (tagsResponse && tagsResponse.length){
        // Go through tagsResponse, and add .mod values if the fields in the current .mod do not match
        // the values in the persistent response
        var updatedTags = [], locallyDeletedTags = [], i, id;
        for (i=0; i<tagsResponse.length; i++){
          var tagInfo = this.getTagInfo(tagsResponse[i].uuid, ownerUUID);
          if (tagInfo){
            if (tagInfo.tag.trans.deleted) locallyDeletedTags.push(tagInfo.tag);
            ItemLikeService.evaluateMod(tagsResponse[i], tagInfo.tag, TAG_TYPE, ownerUUID, tagFieldInfos);

            updatedTags.push(tagInfo.tag);
          }else{
            updatedTags.push(tagsResponse[i]);
          }
        }

        ItemLikeService.persistAndReset(updatedTags, TAG_TYPE, ownerUUID, tagFieldInfos);
        var latestModified = ArrayService.updateArrays(ownerUUID, TAG_TYPE, updatedTags,
                                                       tags[ownerUUID].activeTags,
                                                       tags[ownerUUID].deletedTags);
        if (latestModified) {
          // Go through response to see if something was deleted or undeleted
          for (i=0; i<updatedTags.length; i++) {
            if (updatedTags[i].deleted) {
              for (id in tagDeletedCallbacks) {
                tagDeletedCallbacks[id](updatedTags[i], ownerUUID);
              }
            }else if (locallyDeletedTags.indexOf(updatedTags[i]) !== -1){
              // Undeleted in another client
              for (id in tagDeletedCallbacks) {
                tagDeletedCallbacks[id](updatedTags[i], ownerUUID, true);
              }
            }
          }
        }
        return latestModified;
      }
    },
    updateTag: updateTag,
    updateTagModProperties: function(uuid, properties, ownerUUID) {
      var tagInfo = this.getTagInfo(uuid, ownerUUID);
      if (tagInfo){
        if (!properties){
          if (tagInfo.tag.mod){
            delete tagInfo.tag.mod;
            updateTag(tagInfo.tag, ownerUUID);
          }
        }else{
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
    getModifiedTags: function(ownerUUID) {
      return ArrayService.getModifiedItems(tags[ownerUUID].activeTags,
                                           tags[ownerUUID].deletedTags);
    },
    getTagInfo: function(value, ownerUUID, searchField) {
      var field = searchField ? searchField : 'uuid';
      var tag = tags[ownerUUID].activeTags.findFirstObjectByKeyValue(field, value, 'trans');
      if (tag){
        return {
          type: 'active',
          tag: tag
        };
      }
      tag = tags[ownerUUID].deletedTags.findFirstObjectByKeyValue(field, value, 'trans');
      if (tag){
        return {
          type: 'deleted',
          tag: tag
        };
      }
    },
    saveTag: function(tag) {
      var deferred = $q.defer();
      var ownerUUID = tag.trans.owner;
      if (tags[ownerUUID].deletedTags.findFirstObjectByKeyValue('uuid', tag.trans.uuid, 'trans')) {
        deferred.reject({type: 'deleted'});
      } else {
        ItemLikeService.save(tag, TAG_TYPE, ownerUUID, tagFieldInfos).then(
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
    isTagEdited: function(tag) {
      var ownerUUID = tag.trans.owner;
      return ItemLikeService.isEdited(tag, TAG_TYPE, ownerUUID, tagFieldInfos);
    },
    resetTag: function(tag) {
      var ownerUUID = tag.trans.owner;
      return ItemLikeService.resetTrans(tag, TAG_TYPE, ownerUUID, tagFieldInfos);
    },
    deleteTag: function(tag) {
      var ownerUUID = tag.trans.owner;
      var deferred = $q.defer();
      if (tags[ownerUUID].deletedTags.findFirstObjectByKeyValue('uuid', tag.trans.uuid, 'trans')) {
        deferred.resolve('unmodified');
      }else{
        ItemLikeService.processDelete(tag, TAG_TYPE, ownerUUID, tagFieldInfos).then(
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
    undeleteTag: function(tag) {
      var ownerUUID = tag.trans.owner;
      var deferred = $q.defer();
      if (!tags[ownerUUID].deletedTags.findFirstObjectByKeyValue('uuid', tag.trans.uuid, 'trans')) {
        deferred.resolve('unmodified');
      }else{
        ItemLikeService.undelete(tag, TAG_TYPE, ownerUUID, tagFieldInfos).then(
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
    clearTags: function() {
      tags = {};
    },
    changeOwnerUUID: function(oldUUID, newUUID){
      if (tags[oldUUID]){
        tags[newUUID] = tags[oldUUID];
        delete tags[oldUUID];
        ItemLikeService.persistAndReset(tags[newUUID].activeTags, TAG_TYPE, newUUID, tagFieldInfos);
        ItemLikeService.persistAndReset(tags[newUUID].deletedTags, TAG_TYPE, newUUID, tagFieldInfos);
      }
    },
    // Regular expressions for tag requests
    putNewTagRegex: ItemLikeService.getPutNewRegex(TAG_TYPE),
    putExistingTagRegex: ItemLikeService.getPutExistingRegex(TAG_TYPE),
    deleteTagRegex: ItemLikeService.getDeleteRegex(TAG_TYPE),
    undeleteTagRegex: ItemLikeService.getUndeleteRegex(TAG_TYPE),

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
      var modifiedItems = [], i, deletedTagIndex;

      for (i = 0; i < items.length; i++) {
        var found = false;
        if (items[i].relationships && items[i].relationships.tags){
          deletedTagIndex = items[i].relationships.tags.indexOf(deletedTag.trans.uuid);
          if (deletedTagIndex !== -1) {
            found = true;
            items[i].relationships.tags.splice(deletedTagIndex, 1);
            if (items[i].relationships.tags.length === 0){
              delete items[i].relationships.tags;
            }
          }
        }
        if (items[i].mod && items[i].mod.relationships &&
            items[i].mod.relationships.tags){

          deletedTagIndex = items[i].mod.relationships.tags.indexOf(deletedTag.trans.uuid);
          if (deletedTagIndex !== -1) {
            found = true;
            items[i].mod.relationships.tags.splice(deletedTagIndex, 1);
            if (items[i].mod.relationships.tags.length === 0){
              items[i].mod.relationships.tags = undefined;
            }
          }
        }
        if (found){
          // Add deleted tag to item history
          if (!items[i].hist) items[i].hist = {};
          if (!items[i].hist.deletedTags) items[i].hist.deletedTags = [];
          items[i].hist.deletedTags.push(deletedTag.trans.uuid);
          modifiedItems.push(items[i]);
        }
      }
      return modifiedItems;
    },
    addUndeletedTagToItems: function(items, deletedTag) {
      var modifiedItems = [];
      for (var i = 0, len = items.length; i < len; i++) {
        if (items[i].hist && items[i].hist.deletedTags){
          var deletedTagIndex = items[i].hist.deletedTags.indexOf(deletedTag.trans.uuid);
          if (deletedTagIndex !== -1){
            // Only add to mod if not already in persistent fields
            if (!items[i].relationships || !items[i].relationships.tags ||
                items[i].relationships.tags.indexOf(deletedTag.trans.uuid) === -1){
              if (!items[i].mod) items[i].mod = {};
              if (!items[i].mod.relationships) items[i].mod.relationships = {};
              if (!items[i].mod.relationships.tags) items[i].mod.relationships.tags = [];
              items[i].mod.relationships.tags.push(deletedTag.trans.uuid);
            }
            items[i].hist.deletedTags.splice(deletedTagIndex, 1);
            if (items[i].hist.deletedTags.length === 0){
              delete items[i].hist.deletedTags;
              if (jQuery.isEmptyObject(items[i].hist)) delete items[i].hist;
            }
            modifiedItems.push(items[i]);
          }
        }
      }
      return modifiedItems;
    }
  };
}

TagsService['$inject'] = ['$q', 'ArrayService', 'BackendClientService', 'ItemLikeService',
'UserSessionService'];
angular.module('em.base').factory('TagsService', TagsService);
