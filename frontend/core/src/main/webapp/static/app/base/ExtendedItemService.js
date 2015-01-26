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

 function ExtendedItemService(TagsService) {

  var getListInfoCallback;
  function copyParentToList(origin, extendedItem, ownerUUID) {
    if (origin && origin.parent) {
      var listInfo = getListInfoCallback(origin.parent, ownerUUID);
      if (listInfo){
        extendedItem.trans.list = listInfo.list;
      }
    }
  }

  function copyTransListToModParent(extendedItem) {
    if (extendedItem.trans.hasOwnProperty('list')){
      if (!extendedItem.trans.list){
        if (!extendedItem.mod.relationships) extendedItem.mod.relationships = undefined;
        else extendedItem.mod.relationships.parent = undefined;
      } else{
        if (!extendedItem.mod.relationships) extendedItem.mod.relationships = {};
        extendedItem.mod.relationships.parent = extendedItem.trans.list.trans.uuid;
        // Remove deletedList from history history
        if (extendedItem.hist && extendedItem.hist.deletedList !== extendedItem.trans.list.trans.uuid){
          delete extendedItem.hist.deletedList;
          if (jQuery.isEmptyObject(extendedItem.hist)){
            delete extendedItem.hist;
          }
        }
      }
    }
  }

  function copyTagsToTrans(origin, extendedItem, ownerUUID) {
    if (origin && origin.tags) {
      for (var i = 0, len = origin.tags.length; i < len; i++) {
        var tagInfo = TagsService.getTagInfo(origin.tags[i], ownerUUID);
        if (tagInfo) {
          if (tagInfo.tag.trans.tagType === 'context') {
            extendedItem.trans.context = tagInfo.tag;
            break;
          } else if (tagInfo.tag.trans.tagType === 'keyword') {
            if (!extendedItem.trans.keywords) extendedItem.trans.keywords = [];
            if (extendedItem.trans.keywords.indexOf(tagInfo.tag) === -1) {
              // Push keyword if it does not exist in transient keywords.
              extendedItem.trans.keywords.push(tagInfo.tag);
            }
          }
        }
      }
    }
  }

  function copyKeywordsToTags(origin, destination, ownerUUID) {
    if (origin.keywords) {
      // Item has persistent tags.
      if (destination.relationships && destination.relationships.tags) {
        destination.relationships.tags = filterRemovedTransientKeywordsFromTags()
        .concat(addNewTransientKeywordsToTags());
      }
      // Item does not have persistend tags
      //  * copy transient keyword UUIDs to tags
      else {
        if (!destination.relationships) destination.relationships = {};
        destination.relationships.tags = [];
        for (var i = 0, len = origin.keywords.length; i < len; i++) {
          destination.relationships.tags.push(origin.keywords[i].trans.uuid);
        }
      }
    }
    // Transient keywords has been removed from item, delete persistent values
    else {
      if (destination.relationships && destination.relationships.tags) {
        destination.relationships.tags = filterKeywordsFromTags();
        // Remove tags array if the result yielded an empty array
        if (destination.relationships.tags.length === 0) delete destination.relationships.tags;
      }
    }

    function filterRemovedTransientKeywordsFromTags() {
      var filteredTags = [];
      // Filter persistent tags.
      //  * remove persistent keyword if it is not found from transient keywords.
      for (var i = 0, len = destination.relationships.tags.length; i < len; i++) {
        // Find tag
        var tagInfo = TagsService.getTagInfo(destination.relationships.tags[i], ownerUUID);
        if (tagInfo) {
          if (tagInfo.tag.trans.tagType === 'context') filteredTags.push(destination.relationships.tags[i]);
          else if (tagInfo.tag.trans.tagType === 'keyword') {
            // Find persistent keyword from transient keywords
            var persistentKeyword = origin.keywords
            .findFirstObjectByKeyValue('uuid', destination.relationships.tags[i]);

            if (persistentKeyword !== undefined) {
              filteredTags.push(destination.relationships.tags[i]);
            }
          }
        }
      }
      return filteredTags;
    }

    function addNewTransientKeywordsToTags() {
      // Iterate transient keywords.
      //  * add transient keyword if it is not found from persistent keywords.
      var filteredTags = [];
      for (var i = 0, len = origin.keywords.length; i < len; i++) {
        var transientKeyword = origin.keywords[i];
        if (destination.relationships.tags.indexOf(transientKeyword.trans.uuid) === -1) {
          filteredTags.push(transientKeyword.trans.uuid);
        }
      }
      return filteredTags;
    }

    function filterKeywordsFromTags() {
      // Filter persistent tags.
      //  * remove persistent tag if it's type is 'keyword'.
      var filteredTags = [];
      for (var i = 0, len = destination.relationships.tags.length; i < len; i++) {
        // Find tag
        var tagInfo = TagsService.getTagInfo(destination.relationships.tags[i], ownerUUID);
        if (tagInfo) {
          if (tagInfo.tag.trans.tagType === 'context') filteredTags.push(destination.relationships.tags[i]);
        }
      }
      return filteredTags;
    }
  }

  function copyTransContextToModTags(extendedItem, ownerUUID) {
    var previousContextIndex;

    if (extendedItem.trans.hasOwnProperty('context')) {

      // Transient context exists
      if (extendedItem.trans.context){

        var foundCurrentTag = false;
        var contextUUID = extendedItem.trans.context.trans.uuid;

        if (extendedItem.mod.relationships) {
          if (extendedItem.mod.relationships.tags) {
            for (var i = 0, len = extendedItem.mod.relationships.tags.length; i < len; i++) {
              var tagInfo = TagsService.getTagInfo(extendedItem.mod.relationships.tags[i], ownerUUID);
              if (tagInfo && tagInfo.tag.trans.tagType === 'context') {
                if (tagInfo.tag.trans.uuid === contextUUID) foundCurrentTag = true;
                else previousContextIndex = i;
              }
            }
            // remove old tag
            if (previousContextIndex !== undefined)
              extendedItem.mod.relationships.tags.splice(previousContextIndex, 1);
          }
        }
        // copy new context to tag
        if (!foundCurrentTag) {
          if (!extendedItem.mod.relationships) extendedItem.mod.relationships = {};
          if (!extendedItem.mod.relationships.tags) extendedItem.mod.relationships.tags = [contextUUID];
          else extendedItem.mod.relationships.tags.push(contextUUID);
        }
      }
      // context has been removed from item, delete persistent value.
      else {
        if (extendedItem.mod.relationships){
          if (extendedItem.mod.relationships.tags) {
            previousContextIndex = undefined;
            for (var j = 0; j < extendedItem.mod.relationships.tags.length; j++) {
              var jTagInfo = TagsService.getTagInfo(extendedItem.mod.relationships.tags[j], ownerUUID);
              if (jTagInfo && jTagInfo.tag.trans.tagType === 'context') previousContextIndex = j;
            }
            if (previousContextIndex !== undefined)
              extendedItem.mod.relationships.tags.splice(previousContextIndex, 1);
          }else{
            extendedItem.mod.relationships.tags = undefined;
          }
        }else{
          extendedItem.mod.relationships = undefined;
        }
      }
    }
  }

  return {
    getRelationshipsFieldInfo: function(){
      return {
        name: 'relationships',
        isEdited: this.isRelationshipsEdited,
        validate: this.validateRelatioships,
        copyTransToMod: this.copyRelationshipsTransToMod,
        resetTrans: this.resetRelationshipsTrans
      };
    },
    isRelationshipsEdited: function(extendedItem /*, ownerUUID*/){
      if (extendedItem.trans.list || extendedItem.trans.context || extendedItem.trans.keywords){

        if (!extendedItem.relationships && (!extendedItem.mod || !extendedItem.mod.relationships)){
          // Relationships are in trans but not in mod nor database
          return true;
        }

        // Check list
        if (extendedItem.trans.list){
          if (extendedItem.mod && extendedItem.mod.relationships){
            if (extendedItem.mod.relationships.parent !== extendedItem.trans.list.trans.uuid)
              return true;
          }else if (extendedItem.relationships &&
                    (extendedItem.relationships.parent !== extendedItem.trans.list.trans.uuid)){
            return true;
          }
        }else if ((extendedItem.relationships && extendedItem.relationships.parent) ||
                  (extendedItem.mod && extendedItem.mod.relationships
                   && extendedItem.mod.relationships.parent)){
          return true;
        }

        // Check context
        var hasContext = false;
        if (extendedItem.trans.context){
          if (extendedItem.mod && extendedItem.mod.relationships){
            if (!extendedItem.mod.relationships.tags ||
                extendedItem.mod.relationships.tags.indexOf(extendedItem.trans.context.trans.uuid) === -1){
              return true;
            }
          }else if (extendedItem.relationships){
            if (!extendedItem.relationships.tags || 
                extendedItem.relationships.tags.indexOf(extendedItem.trans.context.trans.uuid) === -1){
              return true;
            }
          }
          hasContext = true;
        }

        // Keywords
        if (extendedItem.trans.keywords && extendedItem.trans.keywords.length){
          var expectedLength = hasContext ? extendedItem.trans.keywords.length + 1 :
                                            extendedItem.trans.keywords.length;
          if (extendedItem.mod && extendedItem.mod.relationships){
            if (!extendedItem.mod.relationships.tags ||
                extendedItem.mod.relationships.tags.length !== expectedLength){
              return true;
            }
            // Check that every keyword is found in mod.relationship.tags array
            for (var i=0, len=extendedItem.trans.keywords.length; i<len; i++){
              if (extendedItem.mod.relationships.tags.indexOf(extendedItem.trans.keywords[i].trans.uuid) === -1)
                return true;
            }
          }else if (extendedItem.relationships){
            if (!extendedItem.relationships.tags ||
                extendedItem.relationships.tags.length !== expectedLength){
              return true;
            }
            // Check that every keyword is found in relationship.tags array
            for (var i=0, len=extendedItem.trans.keywords.length; i<len; i++){
              if (extendedItem.relationships.tags.indexOf(extendedItem.trans.keywords[i].trans.uuid) === -1)
                return true;
            }
          }
        }else if (extendedItem.mod && extendedItem.mod.relationships){
          if (extendedItem.mod.relationships.tags){
            // No keywords but still tags in mod
            if (!hasContext) return true;
            if (hasContext && extendedItem.mod.relationships.tags.length !== 1) return true;
          }
        }else if (extendedItem.relationships && extendedItem.relationships.tags){
          // No keywords but still tags
          if (!hasContext) return true;
          if (hasContext && extendedItem.relationships.tags.length !== 1) return true;
        }
      }else if (extendedItem.relationships &&
                (extendedItem.relationships.parent || extendedItem.relationships.tags)){
        return true;
      }
    },
    validateRelationships: function(/*extendedItem, ownerUUID*/){
      // TODO: Actually validate this
    },
    copyRelationshipsTransToMod: function(extendedItem, ownerUUID){
      copyTransListToModParent(extendedItem);
      copyKeywordsToTags(extendedItem.trans, extendedItem.mod, ownerUUID);
      copyTransContextToModTags(extendedItem, ownerUUID);
    },
    resetRelationshipsTrans: function(extendedItem, ownerUUID){
      if (extendedItem.mod && extendedItem.mod.relationships &&
          extendedItem.mod.relationships.parent !== undefined){
        copyParentToList(extendedItem.mod.relationships, extendedItem, ownerUUID);
      }else if (extendedItem.relationships && extendedItem.relationships.parent !== undefined){
        copyParentToList(extendedItem.relationships, extendedItem, ownerUUID);
      }else if (extendedItem.trans.list !== undefined){
        delete extendedItem.trans.list;
      }
      if (extendedItem.mod && extendedItem.mod.relationships &&
          extendedItem.mod.relationships.tags !== undefined){
        copyTagsToTrans(extendedItem.mod.relationships, extendedItem, ownerUUID);
      }else if (extendedItem.relationships && extendedItem.relationships.tags !== undefined){
        copyTagsToTrans(extendedItem.relationships, extendedItem, ownerUUID);
      }else if (extendedItem.trans.keywords !== undefined){
        delete extendedItem.trans.keywords;
      }
    },
    registerGetListInfoCallback: function(callback){
      getListInfoCallback = callback;
    }
  };
}

ExtendedItemService['$inject'] = ['TagsService'];
angular.module('em.main').factory('ExtendedItemService', ExtendedItemService);
