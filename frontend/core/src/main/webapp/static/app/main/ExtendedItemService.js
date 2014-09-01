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

  function copyParentToList(extendedItem) {
    if (extendedItem.relationships && extendedItem.relationships.parent) {
      if (!extendedItem.transientProperties) extendedItem.transientProperties = {};
      extendedItem.transientProperties.list = extendedItem.relationships.parent;
    }
  }

  function copyTagToTransientProperty(extendedItem, ownerUUID) {
    if (extendedItem.relationships && extendedItem.relationships.tags) {
      for (var i = 0, len = extendedItem.relationships.tags.length; i < len; i++) {
        var tag = TagsService.getTagByUUID(extendedItem.relationships.tags[i], ownerUUID);
        if (tag) {
          if (!extendedItem.transientProperties) extendedItem.transientProperties = {};
          if (tag.tagType === 'context') {
            extendedItem.transientProperties.context = tag.uuid;
            break;
          } else if (tag.tagType === 'keyword') {
            if (!extendedItem.transientProperties.keywords) extendedItem.transientProperties.keywords = [];
            extendedItem.transientProperties.keywords.push(tag.uuid);
          }
        }
      }
    }
  }

  function copyKeywordsToTags(extendedItem, ownerUUID) {
    // Item has transient keywords.
    if (extendedItem.transientProperties && extendedItem.transientProperties.keywords) {
      // Item has persistent tags.
      if (extendedItem.relationships && extendedItem.relationships.tags) {
        extendedItem.relationships.tags = filterRemovedTransientKeywordsFromTags()
        .concat(addNewTransientKeywordsToTags());
      }
      // Item does not have persistend tags
      //  * copy transient keywords to tags
      else {
        if (!extendedItem.relationships) extendedItem.relationships = {};
        extendedItem.relationships.tags = extendedItem.transientProperties.keywords;
      }
    }
    // Transient keywords has been removed from item, delete persistent values
    else {
      if (extendedItem.relationships && extendedItem.relationships.tags) {
        extendedItem.relationships.tags = filterKeywordsFromTags();
        // Remove tags array if the result yielded an empty array
        if (extendedItem.relationships.tags.length === 0) delete extendedItem.relationships.tags;
      }
    }

    function filterRemovedTransientKeywordsFromTags() {
      var filteredTags = [];
      // Filter persistent tags.
      //  * remove persistent keyword if it is not found from transient keywords.
      for (var i = 0, len = extendedItem.relationships.tags.length; i < len; i++) {
        // Find tag
        var tag = TagsService.getTagByUUID(extendedItem.relationships.tags[i], ownerUUID);
        if (tag) {
          if (tag.tagType === 'context') filteredTags.push(extendedItem.relationships.tags[i]);
          else if (tag.tagType === 'keyword') {
            // Find persistent keyword from transient keywords
            if (extendedItem.transientProperties.keywords.indexOf(extendedItem.relationships.tags[i]) !== -1) {
              filteredTags.push(extendedItem.relationships.tags[i]);
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
      for (var i = 0, len = extendedItem.transientProperties.keywords.length; i < len; i++) {
        if (extendedItem.relationships.tags.indexOf(extendedItem.transientProperties.keywords[i]) === -1) {
          filteredTags.push(extendedItem.transientProperties.keywords[i]);
        }
      }
      return filteredTags;
    }

    function filterKeywordsFromTags() {
      // Filter persistent tags.
      //  * remove persistent tag if it's type is 'keyword'.
      var filteredTags = [];
      for (var i = 0, len = extendedItem.relationships.tags.length; i < len; i++) {
        // Find tag
        var tag = TagsService.getTagByUUID(extendedItem.relationships.tags[i], ownerUUID);
        if (tag) {
          if (tag.tagType === 'context') filteredTags.push(extendedItem.relationships.tags[i]);
        }
      }
      return filteredTags;
    }
  }

  function copyContextToTag(extendedItem, ownerUUID) {
    var previousContextIndex;

    // Transient context exists
    if (extendedItem.transientProperties && extendedItem.transientProperties.context) {
      var foundCurrentTag = false;
      var context = extendedItem.transientProperties.context;

      if (extendedItem.relationships) {
        if (extendedItem.relationships.tags) {
          for (var i = 0, len = extendedItem.relationships.tags.length; i < len; i++) {
            var tag = TagsService.getTagByUUID(extendedItem.relationships.tags[i], ownerUUID);
            if (tag && tag.tagType === 'context') {
              if (tag.uuid === context) foundCurrentTag = true;
              else previousContextIndex = i;
            }
          }
          // remove old tag
          if (previousContextIndex !== undefined) extendedItem.relationships.tags.splice(previousContextIndex, 1);
        }
      }
      // copy new context to tag
      if (!foundCurrentTag) {
        if (!extendedItem.relationships) extendedItem.relationships = {};
        if (!extendedItem.relationships.tags) extendedItem.relationships.tags = [context];
        else extendedItem.relationships.tags.push(context);
      }
    }
    // Tag has been removed from item, delete persistent value.
    else if (extendedItem.relationships && extendedItem.relationships.tags) {
      previousContextIndex = undefined;
      for (var j = 0, jLen = extendedItem.relationships.tags.length; j < jLen; j++) {
        var jTag = TagsService.getTagByUUID(extendedItem.relationships.tags[j], ownerUUID);
        if (jTag && jTag.tagType === 'context') previousContextIndex = j;
      }
      if (previousContextIndex !== undefined) extendedItem.relationships.tags.splice(previousContextIndex, 1);
    }
  }

  function copyListToParent(extendedItem) {
    // Transient list exists.
    if (extendedItem.transientProperties && extendedItem.transientProperties.list) {
      if (!extendedItem.relationships) extendedItem.relationships = {};
      if (!extendedItem.relationships.parent) extendedItem.relationships.parent = {};
      extendedItem.relationships.parent = extendedItem.transientProperties.list;
    }
    // List has been removed from item, delete persistent value
    else if (extendedItem.relationships && extendedItem.relationships.parent) {
      delete extendedItem.relationships.parent;
    }
    // AngularJS sets transient property to 'null' if it is used in ng-model data-binding and no value is set.
    if (extendedItem.transientProperties && extendedItem.transientProperties.list === null)
      delete extendedItem.transientProperties.list;
  }

  return {
    addTransientProperties: function(extendedItemsArray, ownerUUID, addExtraTransientPropertyFn) {
      if (extendedItemsArray) {
        var hasAddExtraTransientPropertyCopyFunction;
        var hasAddExtraTransientPropertyCopyFunctions;
        if (typeof addExtraTransientPropertyFn === 'function') hasAddExtraTransientPropertyCopyFunction = true;
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
        else if (Array.isArray(addExtraTransientPropertyFn)) hasAddExtraTransientPropertyCopyFunctions = true;

        for (var i = 0, len = extendedItemsArray.length; i < len; i++) {
          var extendedItem = extendedItemsArray[i];
          copyParentToList(extendedItem);
          copyTagToTransientProperty(extendedItem, ownerUUID);
          if (hasAddExtraTransientPropertyCopyFunction) addExtraTransientPropertyFn(extendedItem, ownerUUID);
          else if (hasAddExtraTransientPropertyCopyFunctions) {
            for (var j = 0, jLen = addExtraTransientPropertyFn.length; j < jLen; j++) {
              addExtraTransientPropertyFn[j](extendedItem, ownerUUID);
            }
          }
        }
      }
    },
    attachTransientProperties: function(extendedItem, transientProperties) {
      if (transientProperties) extendedItem.transientProperties = transientProperties;
    },
    detachTransientProperties: function(extendedItem, ownerUUID, detachExtraPropertyFn) {
      // copy transient values into persistent values
      copyContextToTag(extendedItem, ownerUUID);
      copyKeywordsToTags(extendedItem, ownerUUID);
      copyListToParent(extendedItem);
      if (typeof detachExtraPropertyFn === 'function') detachExtraPropertyFn(extendedItem, ownerUUID);
      else if (Array.isArray(detachExtraPropertyFn)) {
        for (var i = 0, len = detachExtraPropertyFn.length; i < len; i++) {
          detachExtraPropertyFn[i](extendedItem, ownerUUID);
        }
      }

      // Check that transientProperties object is not empty
      // http://stackoverflow.com/a/4994244
      if (extendedItem.transientProperties && Object.getOwnPropertyNames(extendedItem.transientProperties).length > 0) {
        // store transient values into variable and delete transient object from item
        var transients = extendedItem.transientProperties;
        delete extendedItem.transientProperties;
        return transients;
      }
      else {
        // No persistent relationships. Delete relationships object.
        if (extendedItem.relationships && Object.getOwnPropertyNames(extendedItem.relationships).length === 0)
          delete extendedItem.relationships;
        delete extendedItem.transientProperties;
      }
    }
  };
}

ExtendedItemService['$inject'] = ['TagsService'];
angular.module('em.main').factory('ExtendedItemService', ExtendedItemService);
