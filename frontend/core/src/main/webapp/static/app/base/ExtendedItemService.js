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

 function ExtendedItemService(TagsService) {

  function copyParentToList(origin, extendedItem) {
    if (origin && origin.parent) {
      if (!extendedItem.trans) extendedItem.trans = {};
      extendedItem.trans.list = origin.parent;
    }
  }

  function copyListToParent(origin, destination) {
    if (origin.list) {
      if (!destination.relationships) destination.relationships = {};
      if (!destination.relationships.parent) destination.relationships.parent = {};
      destination.relationships.parent = origin.list;
    }
    // List has been removed, delete value
    else if (destination.relationships && destination.relationships.parent) {
      delete destination.relationships.parent;
    }
    // AngularJS sets transient property to 'null' if it is used in ng-model data-binding and no value is set.
    if (origin.list === null)
      delete origin.list;
  }

  function copyTagsToTrans(origin, extendedItem, ownerUUID) {
    if (origin && origin.tags) {
      for (var i = 0, len = origin.tags.length; i < len; i++) {
        var tagInfo = TagsService.getTagInfo(origin.tags[i], ownerUUID);
        if (tagInfo) {
          if (!extendedItem.trans) extendedItem.trans = {};
          if (tagInfo.tag.tagType === 'context') {
            extendedItem.trans.context = tagInfo.tag.uuid;
            break;
          } else if (tagInfo.tag.tagType === 'keyword') {
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
          destination.relationships.tags.push(origin.keywords[i].uuid);
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
          if (tagInfo.tag.tagType === 'context') filteredTags.push(destination.relationships.tags[i]);
          else if (tagInfo.tag.tagType === 'keyword') {
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
        if (destination.relationships.tags.indexOf(transientKeyword.uuid) === -1) {
          filteredTags.push(transientKeyword.uuid);
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
          if (tagInfo.tag.tagType === 'context') filteredTags.push(destination.relationships.tags[i]);
        }
      }
      return filteredTags;
    }
  }

  function copyContextToTags(origin, destination, ownerUUID) {
    var previousContextIndex;

    // Transient context exists
    if (origin.context) {
      var foundCurrentTag = false;
      var context = origin.context;

      if (destination.relationships) {
        if (destination.relationships.tags) {
          for (var i = 0, len = destination.relationships.tags.length; i < len; i++) {
            var tagInfo = TagsService.getTagInfo(destination.relationships.tags[i], ownerUUID);
            if (tagInfo && tagInfo.tag.tagType === 'context') {
              if (tagInfo.tag.uuid === context) foundCurrentTag = true;
              else previousContextIndex = i;
            }
          }
          // remove old tag
          if (previousContextIndex !== undefined)
            destination.relationships.tags.splice(previousContextIndex, 1);
        }
      }
      // copy new context to tag
      if (!foundCurrentTag) {
        if (!destination.relationships) destination.relationships = {};
        if (!destination.relationships.tags) destination.relationships.tags = [context];
        else destination.relationships.tags.push(context);
      }
    }
    // Tag has been removed from item, delete persistent value.
    else if (destination.relationships && destination.relationships.tags) {
      previousContextIndex = undefined;
      for (var j = 0, jLen = destination.relationships.tags.length; j < jLen; j++) {
        var jTagInfo = TagsService.getTagInfo(destination.relationships.tags[j], ownerUUID);
        if (jTagInfo && jTagInfo.tag.tagType === 'context') previousContextIndex = j;
      }
      if (previousContextIndex !== undefined) destination.relationships.tags.splice(previousContextIndex, 1);
    }
  }

  return {
    getRelationshipsFieldInfo: function(){
      return {
        name: 'relationships',
        isEdited: this.isRelationshipsEdited,
        validate: this.validateRelatioships,
        copyTransToMod: this.copyRelationshipsTransToMod,
        resetTrans: this.resetRelationshipsTrans,
      }
    },
    isRelationshipsEdited: function(extendedItem, ownerUUID){
      if (extendedItem.trans.list || extendedItem.trans.context || extendedItem.trans.keywords){
        if (!extendedItem.relationships) return true;
        if (extendedItem.trans.list !== extendedItem.parent) return true;
        var hasContext = false;
        if (extendedItem.trans.context){
          if (!angular.isArray(extendedItem.relationships.tags)) return true;
          if (extendedItem.relationships.tags.indexOf(extendedItem.trans.context.trans.uuid) === -1){
            return true;
          }
          hasContext = true;
        }
        if (extendedItem.trans.keywords && extendedItem.trans.keywords.length){
          if (!angular.isArray(extendedItem.relationships.tags)) return true;
          var expectedLength = hasContext ? extendedItem.trans.keywords.length + 1 :
                                            extendedItem.trans.keywords.length;
          if (extendedItem.relationships.tags.length !== expectedLength) return true;

          for (var i=0, len=extendedItem.trans.keywords.length; i<len; i++){
            if (extendedItem.relationships.tags.indexOf(extendedItem.trans.keywords[i].uuid) === -1)
              return true;
          }
        }else if (extendedItem.relationships.tags){
          // No keywords but still tags
          if (!hasContext) return true;
          if (hasContext && extendedItem.relationships.tags.length !== 1) return true;
        }
      }else if (extendedItem.relationships &&
                (extendedItem.relationships.parent || extendedItem.relationships.tags)){
        return true;
      }
    },
    validateRelationships: function(extendedItem, ownerUUID){
      // TODO: Actually validate this
    },
    copyRelationshipsTransToMod: function(extendedItem, ownerUUID){
      copyListToParent(extendedItem.trans, extendedItem.mod);
      copyKeywordsToTags(extendedItem.trans, extendedItem.mod);
      copyContextToTags(extendedItem.trans, extendedItem.mod);
    },
    resetRelationshipsTrans: function(extendedItem, ownerUUID){
      if (extendedItem.mod && extendedItem.mod.parent !== undefined){
        copyParentToList(extendedItem.mod, extendedItem);
      }else if (extendedItem.relationships && extendedItem.relationships.parent !== undefined){
        copyParentToList(extendedItem.relationships.parent, extendedItem);
      }else if (extendedItem.trans.list !== undefined){
        delete extendedItem.trans.list;
      }

      if (extendedItem.mod && extendedItem.mod.tags !== undefined){
        copyTagsToTrans(extendedItem.mod, extendedItem, ownerUUID);
      }else if (extendedItem.relationships && extendedItem.relationships.tags !== undefined){
        copyTagsToTrans(extendedItem.relationships, extendedItem, ownerUUID);
      }else if (extendedItem.trans.keywords !== undefined){
        delete extendedItem.trans.keywords;
      }
    },
  };
}

ExtendedItemService['$inject'] = ['TagsService'];
angular.module('em.main').factory('ExtendedItemService', ExtendedItemService);
