/* Copyright 2013-2016 Extended Mind Technologies Oy
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
        // Remove deletedList from history
        if (extendedItem.hist && extendedItem.hist.deletedList !== extendedItem.trans.list.trans.uuid){
          delete extendedItem.hist.deletedList;
          if (jQuery.isEmptyObject(extendedItem.hist)){
            delete extendedItem.hist;
          }
        }
      }
    }
  }

  function copyTransAssigneeToMod(extendedItem) {
    if (extendedItem.trans.hasOwnProperty('assignee')){
      if (!extendedItem.trans.assignee){
        if (!extendedItem.mod.relationships) extendedItem.mod.relationships = undefined;
        else extendedItem.mod.relationships.assignee = undefined;
      } else{
        if (!extendedItem.mod.relationships) extendedItem.mod.relationships = {};
        extendedItem.mod.relationships.assignee = extendedItem.trans.assignee;
      }
    }
  }

  function copyTagsToTrans(origin, extendedItem, ownerUUID) {
    if (origin) {
      var hasContext = false;
      var hasKeywords = false;
      var hasHistory = false;
      var i;
      if (origin.tags){
        for (i = 0; i < origin.tags.length; i++) {
          switch(copyTagWithUUIDToTrans(origin.tags[i], ownerUUID, extendedItem)){
            case 'context': hasContext = true; break;
            case 'keyword': hasKeywords = true; break;
            case 'history': hasHistory = true; break;
          }
        }
      }
      if (origin.collectiveTags){
        for (i = 0; i<origin.collectiveTags.length; i++) {
          var collectiveUUID = origin.collectiveTags[i][0];
          // We want to notify TagsService about every extended item with collective tags, so that time
          // it can get give callbacks to update tags that are not yet synced
          TagsService.notifyExtendedItemWithCollectiveTags(extendedItem.trans.owner,
                                                           collectiveUUID,
                                                           origin.collectiveTags[i][1],
                                                           extendedItem.trans.uuid,
                                                           extendedItem.trans.itemType);
          for (var j=0; j<origin.collectiveTags[i][1].length; j++) {
            switch(copyTagWithUUIDToTrans(origin.collectiveTags[i][1][j], collectiveUUID, extendedItem)){
              case 'context': hasContext = true; break;
              case 'keyword': hasKeywords = true; break;
              case 'history': hasHistory = true; break;
            }
          }
        }
      }
      // Add collective keywords
      if (!hasContext && extendedItem.trans.context !== undefined) delete extendedItem.trans.context;
      if (!hasKeywords && extendedItem.trans.keywords !== undefined) delete extendedItem.trans.keywords;
      if (!hasHistory && extendedItem.trans.history !== undefined) delete extendedItem.trans.history;
    }
  }

  function copyTagWithUUIDToTrans(tagUUID, tagOwnerUUID, extendedItem){
    var tagInfo = TagsService.getTagInfo(tagUUID, tagOwnerUUID);
    if (tagInfo) {
      if (tagInfo.tag.trans.tagType === 'context') {
        extendedItem.trans.context = tagInfo.tag;
      } else if (tagInfo.tag.trans.tagType === 'keyword') {
        if (!extendedItem.trans.keywords) extendedItem.trans.keywords = [];
        if (extendedItem.trans.keywords.indexOf(tagInfo.tag) === -1) {
          // Push keyword if it does not exist in transient keywords.
          extendedItem.trans.keywords.push(tagInfo.tag);
        }
      } else if (tagInfo.tag.trans.tagType === 'history') {
        if (!extendedItem.trans.history) extendedItem.trans.history = [];
        if (extendedItem.trans.history.indexOf(tagInfo.tag) === -1) {
          // Push history tag if it does not exist in transient history.
          extendedItem.trans.history.push(tagInfo.tag);
        }
      }
      return tagInfo.tag.trans.tagType;
    }
  }

  function copyTransTagsToMod(extendedItem) {
    if (!extendedItem.mod) extendedItem.mod = {};
    var ownerUUID = extendedItem.trans.owner;
    var keywordsRemoved = (!extendedItem.trans.keywords || !extendedItem.trans.keywords.length) &&
                          extendedItem.trans.hasOwnProperty('keywords');
    var contextRemoved = !extendedItem.trans.context && extendedItem.trans.hasOwnProperty('context');

    // Combine keywords and contexts to common tags array
    // NOTE: history tags are ignored when copying to mod, because they can't be modified using PUT,
    //       and can thus be removed transport items
    var transTags = extendedItem.trans.keywords ? extendedItem.trans.keywords.slice() : [];
    if (extendedItem.trans.context) transTags.push(extendedItem.trans.context);

    // Split tags into own and collective tags
    var transOwnerTags = getOwnerTags(transTags, ownerUUID);
    var transCollectiveTags = getCollectiveTags(transTags, ownerUUID);

    var i;
    if (transOwnerTags.length){
      if (!extendedItem.mod.relationships) extendedItem.mod.relationships = {};
      extendedItem.mod.relationships.tags = [];
      for (i=0; i<transOwnerTags.length; i++){
        extendedItem.mod.relationships.tags.push(transOwnerTags[i].trans.uuid);
      }
    }

    if (transCollectiveTags.length){
      if (!extendedItem.mod.relationships) extendedItem.mod.relationships = {};
      extendedItem.mod.relationships.collectiveTags = [];
      for (i=0; i<transCollectiveTags.length; i++){
        var collectiveTagOwnerUUID = transCollectiveTags[i].trans.owner;
        var collectiveTagUUID = transCollectiveTags[i].trans.uuid;
        var alreadyExists = false;
        // Check if this collective already has an array
        for (var j=0; j<extendedItem.mod.relationships.collectiveTags.length; j++){
          if (extendedItem.mod.relationships.collectiveTags[j][0] === collectiveTagOwnerUUID){
            extendedItem.mod.relationships.collectiveTags[j][1].push(collectiveTagUUID);
            alreadyExists = true;
            break;
          }
        }
        if (!alreadyExists){
          extendedItem.mod.relationships.collectiveTags.push([collectiveTagOwnerUUID, [collectiveTagUUID]]);
        }
      }
    }

    // Make sure that if context or keywords was removed, empty values in .mod override
    // the persistent fields, when doing resetTrans and when creating transport item
    if (keywordsRemoved || contextRemoved){
      if (!extendedItem.mod.relationships) extendedItem.mod.relationships = {};
      if (!extendedItem.mod.relationships.tags){
        extendedItem.mod.relationships.tags = undefined;
      }
      if (!extendedItem.mod.relationships.collectiveTags){
        extendedItem.mod.relationships.collectiveTags = undefined;
      }
    }
  }

  function tagsAndRelationshipsMatch(context, keywords, relationships, ownerUUID){
    if (!context && (!keywords || keywords.length === 0)){
      if ((relationships.tags && relationships.tags.length) ||
           (relationships.collectiveTags && relationships.collectiveTags.length)) return false;
    }
    var i;
    var tags = keywords && keywords.length ? keywords.slice() : [];
    if (context) tags.push(context);

    // Split tags into own and collective tags
    var ownerTags = getOwnerTags(tags, ownerUUID);
    var collectiveTags = getCollectiveTags(tags, ownerUUID);

    // Check that ówner tags match
    if (ownerTags.length > 0){
      // First check that length matches
      if (!relationships.tags || relationships.tags.length !== ownerTags.length) return false;
      // Then check that every owner tag is in tags array
      for (i=0; i<ownerTags.length; i++){
        if (relationships.tags.indexOf(ownerTags[i].trans.uuid) === -1) return false;
      }
    }else if (relationships.tags && relationships.tags.length){
      return false;
    }

    // Check that collective tags match
    if (collectiveTags.length > 0){
      if (!relationships.collectiveTags || !relationships.collectiveTags.length) return false;
      for (i=0; i<collectiveTags.length; i++){
        for (var j=0; j<relationships.collectiveTags.length; j++){
          if (relationships.collectiveTags[j][0] === collectiveTags[i].trans.owner){
            if (relationships.collectiveTags[j][1].indexOf(collectiveTags[i].trans.uuid) === -1){
              return false;
            }
            break;
          }
        }
      }
    }else if (relationships.collectiveTags && relationships.collectiveTags.length){
      return false;
    }
    return true;
  }

  function getOwnerTags(tags, ownerUUID){
    var ownerTags = [];
    for (var i=0; i<tags.length; i++){
      if (tags[i].trans.owner === ownerUUID){
        ownerTags.push(tags[i]);
      }
    }
    return ownerTags;
  }

  function getCollectiveTags(tags, ownerUUID){
    var collectiveTags = [];
    for (var i=0; i<tags.length; i++){
      if (tags[i].trans.owner !== ownerUUID){
        collectiveTags.push(tags[i]);
      }
    }
    return collectiveTags;
  }

  return {
    getRelationshipsFieldInfo: function(){
      return {
        name: 'relationships',
        isEdited: this.isRelationshipsEdited,
        validate: this.validateRelationships,
        copyTransToMod: this.copyRelationshipsTransToMod,
        resetTrans: this.resetRelationshipsTrans
      };
    },
    getRevisionFieldInfo: function(){
      return {
        name: 'revision',
        isEdited: function(){return false;},
        skipTransport: true,
        resetTrans: function(){},
        copyTransToMod: function(){}
      };
    },
    isRelationshipsEdited: function(extendedItem, ownerUUID, compareValues){
      if (extendedItem.trans.list || extendedItem.trans.context || extendedItem.trans.keywords){
        if (!compareValues){
          if (!extendedItem.relationships && (!extendedItem.mod || !extendedItem.mod.relationships)){
            // Relationships are in trans but not in mod nor database
            return true;
          }
        }else if (!compareValues.relationships){
          // Relationships are in trans but not in compare values
          return true;
        }

        // Check list
        if (extendedItem.trans.list){
          if (!compareValues){
            if (extendedItem.mod && extendedItem.mod.relationships){
              if (extendedItem.mod.relationships.parent !== extendedItem.trans.list.trans.uuid)
                return true;
            }else if (extendedItem.relationships &&
                      (extendedItem.relationships.parent !== extendedItem.trans.list.trans.uuid)){
              return true;
            }
          }else if (compareValues.relationships.parent !== extendedItem.trans.list.trans.uuid){
            return true;
          }
        }else{
          if (!compareValues){
            if ((extendedItem.relationships && extendedItem.relationships.parent) ||
                    (extendedItem.mod && extendedItem.mod.relationships &&
                     extendedItem.mod.relationships.parent)){
              return true;
            }
          }else if (compareValues.relationships.parent){
            return true;
          }
        }

        // Check assignee
        if (extendedItem.trans.assignee){
          if (!compareValues){
            if (extendedItem.mod && extendedItem.mod.relationships){
              if (extendedItem.mod.relationships.assignee !== extendedItem.trans.assignee)
                return true;
            }else if (extendedItem.relationships &&
                      (extendedItem.relationships.assignee !== extendedItem.trans.assignee)){
              return true;
            }
          }else if (compareValues.relationships.assignee !== extendedItem.trans.assignee){
            return true;
          }
        }else{
          if (!compareValues){
            if ((extendedItem.relationships && extendedItem.relationships.assignee) ||
                    (extendedItem.mod && extendedItem.mod.relationships &&
                     extendedItem.mod.relationships.assignee)){
              return true;
            }
          }else if (compareValues.relationships.assignee){
            return true;
          }
        }

        // Check tags
        if (!compareValues){
          if (extendedItem.mod && extendedItem.mod.relationships){
            if (!tagsAndRelationshipsMatch(extendedItem.trans.context, extendedItem.trans.keywords,
                                           extendedItem.mod.relationships, extendedItem.trans.owner)){
              return true;
            }
          }else if (extendedItem.relationships){
            if (!tagsAndRelationshipsMatch(extendedItem.trans.context, extendedItem.trans.keywords,
                                           extendedItem.relationships, extendedItem.trans.owner)){
              return true;
            }
          }
        }else{
          if (!tagsAndRelationshipsMatch(extendedItem.trans.context, extendedItem.trans.keywords,
                                         compareValues.relationships, extendedItem.trans.owner)){
            return true;
          }
        }
      }else{
        // No relationships in .trans
        if (!compareValues){
          if (extendedItem.mod && extendedItem.mod.hasOwnProperty('relationships')){
            // undefined value in .mod is allowed as it means that all relationships have been deleted
            if (extendedItem.mod.relationships){
              return true;
            }
          }else if (extendedItem.relationships){
            return true;
          }
        }else if (compareValues.relationships){
          return true;
        }
      }
    },
    validateRelationships: function(/*extendedItem, ownerUUID*/){
      // TODO: Actually validate this
    },
    copyRelationshipsTransToMod: function(extendedItem /*, ownerUUID*/){
      copyTransListToModParent(extendedItem);
      copyTransAssigneeToMod(extendedItem);
      copyTransTagsToMod(extendedItem);
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
          extendedItem.mod.relationships.assignee !== undefined){
        extendedItem.trans.assignee = extendedItem.mod.relationships.assignee;
      }else if (extendedItem.relationships && extendedItem.relationships.assignee !== undefined){
        extendedItem.trans.assignee = extendedItem.relationships.assignee;
      }else if (extendedItem.trans.assignee !== undefined){
        delete extendedItem.trans.assignee;
      }
      if (extendedItem.mod && extendedItem.mod.relationships &&
          (extendedItem.mod.relationships.tags !== undefined ||
           extendedItem.mod.relationships.collectiveTags !== undefined)){
        copyTagsToTrans(extendedItem.mod.relationships, extendedItem, ownerUUID);
      }else if (extendedItem.relationships &&
                (extendedItem.relationships.tags !== undefined ||
                 extendedItem.relationships.collectiveTags !== undefined)){
        copyTagsToTrans(extendedItem.relationships, extendedItem, ownerUUID);
      }else{
        if (extendedItem.trans.context !== undefined) delete extendedItem.trans.context;
        if (extendedItem.trans.keywords !== undefined) delete extendedItem.trans.keywords;
        if (extendedItem.trans.history !== undefined) delete extendedItem.trans.history;
      }
    },
    registerGetListInfoCallback: function(callback){
      getListInfoCallback = callback;
    }
  };
}

ExtendedItemService['$inject'] = ['TagsService'];
angular.module('em.main').factory('ExtendedItemService', ExtendedItemService);
