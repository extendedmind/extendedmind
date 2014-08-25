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

  return {
    addTransientProperties: function(extendedItemsArray, ownerUUID, addExtraTransientPropertyFn) {

      function copyParentToList(extendedItem) {
        if (extendedItem.relationships && extendedItem.relationships.parent) {
          if (!extendedItem.transientProperties) extendedItem.transientProperties = {};
          extendedItem.transientProperties.list = extendedItem.relationships.parent;
        }
      }

      function copyTagToContext(extendedItem, ownerUUID) {
        if (extendedItem.relationships && extendedItem.relationships.tags) {
          for (var i = 0, len = extendedItem.relationships.tags.length; i < len; i++) {
            var tag = TagsService.getTagByUUID(extendedItem.relationships.tags[i], ownerUUID);
            if (tag && tag.tagType === 'context') {
              if (!extendedItem.transientProperties) extendedItem.transientProperties = {};
              extendedItem.transientProperties.context = tag.uuid;
              break;
            }
          }
        }
      }

      if (extendedItemsArray) {
        var hasAddExtraTransientPropertyCopyFunction = typeof addExtraTransientPropertyFn === 'function';

        extendedItemsArray.forEach(function(extendedItem) {
          copyParentToList(extendedItem);
          copyTagToContext(extendedItem, ownerUUID);
          if (hasAddExtraTransientPropertyCopyFunction) addExtraTransientPropertyFn(extendedItem, ownerUUID);
        });
      }
    },
    attachTransientProperties: function(extendedItem, transientProperties) {
      if (transientProperties) extendedItem.transientProperties = transientProperties;
    },
    detachTransientProperties: function(extendedItem, ownerUUID, detachExtraPropertyFn) {

      function copyContextToTag(extendedItem, ownerUUID) {
        var previousContextIndex;

        // Transient context exists
        if (extendedItem.transientProperties && extendedItem.transientProperties.context) {
          var foundCurrentTag = false;
          var context = extendedItem.transientProperties.context;

          if (extendedItem.relationships) {
            if (extendedItem.relationships.tags) {
              extendedItem.relationships.tags.forEach(function(tagUUID, index) {
                var tag = TagsService.getTagByUUID(tagUUID, ownerUUID);
                if (tag && tag.tagType === 'context' && tag.uuid === context) {
                  if (tag.uuid === context) foundCurrentTag = true;
                  else previousContextIndex = index;
                }
              });
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
          extendedItem.relationships.tags.forEach(function(tagUUID, index) {
            var tag = TagsService.getTagByUUID(tagUUID, ownerUUID);
            if (tag && tag.tagType === 'context') previousContextIndex = index;
          });
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

      // copy transient values into persistent values
      copyContextToTag(extendedItem, ownerUUID);
      copyListToParent(extendedItem);
      if (typeof detachExtraPropertyFn === 'function') detachExtraPropertyFn(extendedItem, ownerUUID);

      // Check that transientProperties object is not empty
      // http://stackoverflow.com/a/4994244
      if (extendedItem.transientProperties && Object.getOwnPropertyNames(extendedItem.transientProperties).length > 0) {
        // store transient values into variable and delete transient object from item
        var transients = extendedItem.transientProperties;
        delete extendedItem.transientProperties;

        return transients;
      } else {
        delete extendedItem.transientProperties;
      }
    }
  };
}

ExtendedItemService['$inject'] = ['TagsService'];
angular.module('em.main').factory('ExtendedItemService', ExtendedItemService);
