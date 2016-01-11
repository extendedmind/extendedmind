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
 'use strict';

 function TagsController($rootScope, $scope, $timeout, AnalyticsService, ArrayService, TagsService,
                         UISessionService, UserService, UserSessionService) {


  if (angular.isFunction($scope.registerArrayChangeCallback)) {
    $scope.registerArrayChangeCallback('tag', ['active'], invalidateTagsArrays,
                                       'TagsController');
  }

  var cachedTagsArrays = {};

  /*
  * Invalidate cached active tag arrays.
  */
  function invalidateTagsArrays(tags, modifiedTag, tagsType, ownerUUID) {
    // Tags are special in that we want the arrays for all collectives to be valid right away
    // as owners can have links to other owners
    if (!cachedTagsArrays[ownerUUID]) cachedTagsArrays[ownerUUID] = {};

    // First invalidate this owner
    invalidateTagsArraysForOwner(cachedTagsArrays[ownerUUID], ownerUUID);

    // Second, invalidate other owners' tags as they might have a parent from this owner
    var additionalOwnerUUIDs = UserSessionService.getCollectiveUUIDs(ownerUUID);
    var userUUID = UserSessionService.getUserUUID();
    if (userUUID !== ownerUUID) additionalOwnerUUIDs.push(userUUID);

    for (var i=0; i<additionalOwnerUUIDs.length; i++){
      if (cachedTagsArrays[additionalOwnerUUIDs[i]]) {
        invalidateTagsArraysForOwner(cachedTagsArrays[additionalOwnerUUIDs[i]], additionalOwnerUUIDs[i]);
      }
    }
  }

  function invalidateTagsArraysForOwner(cachedTags, ownerUUID){
    updateAllTags(cachedTags, ownerUUID);
    cachedTags['contexts'] = undefined;
    cachedTags['contextsParentless'] = undefined;
    cachedTags['collectiveContexts'] = undefined;
    cachedTags['keywords'] = undefined;
    cachedTags['keywordsParentless'] = undefined;
    cachedTags['collectiveKeywords'] = undefined;
  }

  function caseInsensitiveTitleCompare(a, b) {
    var aValue = a.trans['title'].toLowerCase();
    var bValue = b.trans['title'].toLowerCase();
    if (aValue < bValue) {
      return -1;
    } else if (aValue > bValue) {
      return 1;
    }
    return 0;
  }

  function updateAllTags(cachedTags, ownerUUID) {
    var activeTags = TagsService.getTags(ownerUUID);
    cachedTags['all'] = [];
    if (activeTags && activeTags.length){
      for (var i = 0; i < activeTags.length; i++) {
        // Contexts and keywords are sorted everywhere in alphabetical order
        ArrayService.insertItemToArray(activeTags[i], cachedTags['all'], caseInsensitiveTitleCompare);
      }
    }
  }

  function updateContexts(cachedTags, ownerUUID) {
    if (!cachedTags['all']) updateAllTags(cachedTags, ownerUUID);
    cachedTags['contexts'] = [];
    // Own contexts
    var i;
    for (i = 0; i < cachedTags['all'].length; i++) {
      if (cachedTags['all'][i].trans.tagType === 'context'){
        cachedTags['contexts'].push(cachedTags['all'][i]);
      }
    }
    var collectiveTags = getCollectiveTags('contexts', ownerUUID);
    if (collectiveTags.usedByOwner && collectiveTags.usedByOwner.length){
      cachedTags['contexts'] = cachedTags['contexts'].concat(collectiveTags.usedByOwner);
    }
    var sortedContexts = ArrayService.sortAlphabeticallyWithParent(cachedTags['contexts'], 'parent');
    cachedTags['contexts'] = sortedContexts;
    return cachedTags['contexts'];
  }

  function updateContextsParentless(cachedTags, ownerUUID) {
    if (!cachedTags['contexts']) updateContexts(cachedTags, ownerUUID);
    cachedTags['contextsParentless'] = [];
    for (var i = 0; i < cachedTags['contexts'].length; i++) {
      if (!cachedTags['contexts'][i].trans.parent) {
        cachedTags['contextsParentless'].push(cachedTags['contexts'][i]);
      }
    }
    return cachedTags['contextsParentless'];
  }

  function updateKeywords(cachedTags, ownerUUID) {
    if (!cachedTags['all']) updateAllTags(cachedTags, ownerUUID);
    cachedTags['keywords'] = [];
    for (var i = 0; i < cachedTags['all'].length; i++) {
      if (cachedTags['all'][i].trans.tagType === 'keyword'){
        cachedTags['keywords'].push(cachedTags['all'][i]);
      }
    }
    var collectiveTags = getCollectiveTags('keywords', ownerUUID);
    if (collectiveTags.usedByOwner && collectiveTags.usedByOwner.length){
      cachedTags['keywords'] = cachedTags['keywords'].concat(collectiveTags.usedByOwner);
    }

    var sortedKeywords = ArrayService.sortAlphabeticallyWithParent(cachedTags['keywords'], 'parent');
    cachedTags['keywords'] = sortedKeywords;
    return cachedTags['keywords'];
  }


  function updateCollectiveKeywords(cachedTags, ownerUUID) {
    if (!cachedTags['keywords']) updateKeywords(cachedTags, ownerUUID);
    cachedTags['collectiveKeywords'] = [];
    // Collective keywords have keywords that are not yet in the keywords array for this owner,
    // but could be added to tasks/notes/lists from the collective if the user wants.
    // NOTE: Only collective tags from the common collective are accepted, to make things
    //       simpler
    var commonOnly = true;
    var collectiveTags = getCollectiveTags('keywords', ownerUUID, commonOnly);
    setCollectiveTagsToArray(cachedTags, 'collectiveKeywords', collectiveTags);
  }

  function updateCollectiveContexts(cachedTags, ownerUUID){
    if (!cachedTags['contexts']) updateContexts(cachedTags, ownerUUID);
    cachedTags['collectiveContexts'] = [];
    // Collective contexts have contexts that are not yet in the contexts array for this owner,
    // but could be added to tasks/notes/lists from the collective if the user wants.
    // NOTE: Only collective tags from the common collective are accepted, to make things
    //       easier when selecting in listPicker lowerList
    var commonOnly = true;
    var collectiveTags = getCollectiveTags('contexts', ownerUUID, commonOnly);
    setCollectiveTagsToArray(cachedTags, 'collectiveContexts', collectiveTags);
  }

  function setCollectiveTagsToArray(cachedTags, cachedTagArrayName, collectiveTags){
    var i, j;
    if (collectiveTags.unUsedByOwner && collectiveTags.unUsedByOwner.length){
      for (i=0; i<collectiveTags.unUsedByOwner.length; i++){
        var collectiveData;
        for (j=0; j<cachedTags[cachedTagArrayName]; j++){
          if (cachedTags[cachedTagArrayName][j].uuid === collectiveTags.unUsedByOwner[i].trans.owner){
            collectiveData = cachedTags[cachedTagArrayName][j];
            break;
          }
        }
        if (!collectiveData){
          collectiveData = {uuid: collectiveTags.unUsedByOwner[i].trans.owner,
                     name: UserSessionService.getCollectiveName(collectiveTags.unUsedByOwner[i].trans.owner),
                     array: []};
          cachedTags[cachedTagArrayName].push(collectiveData);
        }
        collectiveData.array.push(collectiveTags.unUsedByOwner[i]);

      }
      for (i=cachedTags[cachedTagArrayName].length-1; i>=0; i--){
        var sortedKeywords = ArrayService.sortAlphabeticallyWithParent(
                                cachedTags[cachedTagArrayName][i].array, 'parent');
        cachedTags[cachedTagArrayName][i].array = sortedKeywords;
        // Now that the keywords have been sorted by parent, remove all adopted parents from the list
        if (collectiveTags.usedByOwner && collectiveTags.usedByOwner.length){
          for (j=cachedTags[cachedTagArrayName][i].array.length-1; j>=0; j--){
            if (collectiveTags.usedByOwner.indexOf(cachedTags[cachedTagArrayName][i].array[j]) !== -1){
              cachedTags[cachedTagArrayName][i].array.splice(j, 1);
            }
          }
          if (cachedTags[cachedTagArrayName][i].array.length === 0)
            cachedTags[cachedTagArrayName].splice(i, 1);
        }
      }
    }
  }

  function getCollectiveTags(cachedTagArrayName, ownerUUID, commonOnly){
    // Get those collective contexts that are present in some extended items to one list, and others in
    // other list
    var splitTags = {};
    var additionalCollectiveUUIDs = UserSessionService.getCollectiveUUIDs(ownerUUID, commonOnly);
    for (var i=0; i<additionalCollectiveUUIDs.length; i++){
      // This is needed to make coming back from collective still find the collective tags
      if (!cachedTagsArrays[additionalCollectiveUUIDs[i]]){
        cachedTagsArrays[additionalCollectiveUUIDs[i]] = {};
        updateAllTags(cachedTagsArrays[additionalCollectiveUUIDs[i]], additionalCollectiveUUIDs[i]);
      }
      if (!cachedTagsArrays[additionalCollectiveUUIDs[i]][cachedTagArrayName]){
        if (cachedTagArrayName === 'contexts')
          updateContexts(cachedTagsArrays[additionalCollectiveUUIDs[i]], additionalCollectiveUUIDs[i]);
        else if (cachedTagArrayName === 'keywords')
          updateKeywords(cachedTagsArrays[additionalCollectiveUUIDs[i]], additionalCollectiveUUIDs[i]);
      }

      for (var j=0; j<cachedTagsArrays[additionalCollectiveUUIDs[i]][cachedTagArrayName].length; j++){
        var collectiveTag = cachedTagsArrays[additionalCollectiveUUIDs[i]][cachedTagArrayName][j];
        if (TagsService.isTagInExtendedItemCollectiveTags(
              collectiveTag, ownerUUID, additionalCollectiveUUIDs[i])){
          // This tag in this collective is present for this owner, add it to the contexts arrays
          if (!splitTags.usedByOwner) splitTags.usedByOwner = [];
          splitTags.usedByOwner.push(collectiveTag);
          if (collectiveTag.trans.parent &&
              splitTags.usedByOwner.indexOf(collectiveTag.trans.parent) === -1){
            // Also add parent of context
            splitTags.usedByOwner.push(collectiveTag.trans.parent);
          }
        }else{
          // This tag in this collective is not present (yet) for the collective, add it to the unused array
          if (!splitTags.unUsedByOwner) splitTags.unUsedByOwner = [];
          splitTags.unUsedByOwner.push(collectiveTag);
          // Only add those parents that are not already in the unUsedByOwner array
          if (collectiveTag.trans.parent &&
              splitTags.unUsedByOwner.indexOf(collectiveTag.trans.parent) === -1){
            // Also add parent of context, NOTE: Thse parent can be in both the used and unused arrays!
            // This is to make it possible to sort the array based on parent, and only after that the
            // parent is removed
            splitTags.unUsedByOwner.push(collectiveTag.trans.parent);
          }
        }
      }
    }
    return splitTags;
  }

  function updateKeywordsParentless(cachedTags, ownerUUID) {
    if (!cachedTags['keywords']) updateKeywords(cachedTags, ownerUUID);
    cachedTags['keywordsParentless'] = [];
    for (var i = 0; i < cachedTags['keywords'].length; i++) {
      if (!cachedTags['keywords'][i].trans.parent) {
        cachedTags['keywordsParentless'].push(cachedTags['keywords'][i]);
      }
    }
    return cachedTags['keywordsParentless'];
  }


  function updateFavoritedContexts(cachedTags, favoriteContextInfos){
    cachedTags['favoritedContexts'] = [];
    if (favoriteContextInfos && favoriteContextInfos.length){
      for (var i = favoriteContextInfos.length-1; i >= 0; i--) {

        var contextInfo;
        if (angular.isArray(favoriteContextInfos[i])){
          contextInfo = TagsService.getTagInfo(favoriteContextInfos[i][1], favoriteContextInfos[i][0]);
        }else{
          contextInfo = TagsService.getTagInfo(favoriteContextInfos[i], UserSessionService.getUserUUID());
        }

        if (contextInfo && contextInfo.type === 'deleted'){
          // When context is deleted, it needs to be unfavorited
          $scope.unfavoriteContext(contextInfo.tag);
        }else if (contextInfo && contextInfo.tag){
          cachedTags['favoritedContexts'].push(contextInfo.tag);
        }
      }
    }
    return cachedTags['favorited'];
  }

  function validateFavoritedContextsArray(cachedFavoritedContexts, favoriteContextInfos){
    if (!favoriteContextInfos || !favoriteContextInfos.length){
      if (cachedFavoritedContexts && cachedFavoritedContexts.length){
        // No favorite context in preferences, but favorite context in array => not valid
        return false;
      }else{
        // No favorite context in preferences and no favorite context in array => valid
        return true;
      }
    }
    if (favoriteContextInfos.length !== cachedFavoritedContexts.length){
      // Different number of favorite contexts => invalid
      return false;
    }

    // There are equal number of lists there, see if UUID's match
    for (var i=0; i<favoriteContextInfos.length; i++){
      var found = false;
      for (var j=0; j<favoriteContextInfos.length; j++){
        if (getFavoriteContextUUID(favoriteContextInfos[i]) === cachedFavoritedContexts[j].trans.uuid){
          found = true;
          break;
        }
      }
      if (!found){
        return false;
      }
    }
    return true;
  }

  function getFavoriteContextUUID(favoriteContextInfo){
    if (angular.isString(favoriteContextInfo)) return favoriteContextInfo;
    else if (angular.isObject(favoriteContextInfo)) return favoriteContextInfo.uuid;
  }

  $scope.getTagsArray = function(arrayType, info) {
    var ownerUUID = info && info.owner ? info.owner : UISessionService.getActiveUUID();
    if (!cachedTagsArrays[ownerUUID]) cachedTagsArrays[ownerUUID] = {};
    switch (arrayType) {

      case 'all':
      if (!cachedTagsArrays[ownerUUID]['all']) {
        updateAllTags(cachedTagsArrays[ownerUUID], ownerUUID);
      }
      return cachedTagsArrays[ownerUUID]['all'];

      case 'keywords':
      if (!cachedTagsArrays[ownerUUID]['keywords']) {
        updateKeywords(cachedTagsArrays[ownerUUID], ownerUUID);
      }
      return cachedTagsArrays[ownerUUID]['keywords'];

      case 'keywordsParentless':
      if (!cachedTagsArrays[ownerUUID]['keywordsParentless']) {
        updateKeywordsParentless(cachedTagsArrays[ownerUUID], ownerUUID);
      }
      return cachedTagsArrays[ownerUUID]['keywordsParentless'];

      case 'collectiveKeywords':
      if (!cachedTagsArrays[ownerUUID]['collectiveKeywords']) {
        updateCollectiveKeywords(cachedTagsArrays[ownerUUID], ownerUUID);
      }
      return cachedTagsArrays[ownerUUID]['collectiveKeywords'];

      case 'contexts':
      if (!cachedTagsArrays[ownerUUID]['contexts']) {
        updateContexts(cachedTagsArrays[ownerUUID], ownerUUID);
      }
      return cachedTagsArrays[ownerUUID]['contexts'];

      case 'contextsParentless':
      if (!cachedTagsArrays[ownerUUID]['contextsParentless']) {
        updateContextsParentless(cachedTagsArrays[ownerUUID], ownerUUID);
      }
      return cachedTagsArrays[ownerUUID]['contextsParentless'];

      case 'collectiveContexts':
      if (!cachedTagsArrays[ownerUUID]['collectiveContexts']) {
        updateCollectiveContexts(cachedTagsArrays[ownerUUID], ownerUUID);
      }
      return cachedTagsArrays[ownerUUID]['collectiveContexts'];

      case 'favoritedContexts':
      var favoriteContextInfos = UserSessionService.getUIPreference('favoriteContexts');
      if (!cachedTagsArrays['favoritedContexts'] ||
          !validateFavoritedContextsArray(cachedTagsArrays['favoritedContexts'], favoriteContextInfos)) {
        updateFavoritedContexts(cachedTagsArrays, favoriteContextInfos);
      }
      return cachedTagsArrays['favoritedContexts'];
    }
  };

  // KEYWORDS

  // SAVING

  $scope.saveKeyword = function(keyword) {
    if (keyword.trans.uuid) AnalyticsService.do('saveKeyword');
    else AnalyticsService.do('addKeyword');

    return TagsService.saveTag(keyword);
  };

  // DELETING

  $scope.deleteKeyword = function (keyword) {
    if (keyword.trans.uuid){
      AnalyticsService.do('deleteKeyword');
      return TagsService.deleteTag(keyword);
    }
  };

  $scope.undeleteKeyword = function(keyword) {
    if (keyword.trans.uuid){
      AnalyticsService.do('undeleteKeyword');
      return TagsService.undeleteTag(keyword);
    }
  };

  // CONTEXTS

  $scope.getNewContext = function() {
    return TagsService.getNewTag({tagType: 'context'}, UISessionService.getActiveUUID());
  };

  // SAVING

  $scope.saveContext = function(context) {
    if (context.trans.uuid) AnalyticsService.do('saveContext');
    else AnalyticsService.do('addContext');

    return TagsService.saveTag(context);
  };

  // DELETING

  $scope.deleteContext = function(context) {
    if (context.trans.uuid){

      UISessionService.pushDelayedNotification({
        type: 'deleted',
        itemType: 'context',
        item: context,
        undoFn: $scope.undeleteContext
      });

      $timeout(function() {
        UISessionService.activateDelayedNotifications();
      }, $rootScope.LIST_ITEM_LEAVE_ANIMATION_SPEED);

      AnalyticsService.do('deleteContext');
      return TagsService.deleteTag(context);
    }
  };

  $scope.undeleteContext = function(context) {
    if (context.trans.uuid){
      AnalyticsService.do('undeleteContext');
      return TagsService.undeleteTag(context);
    }
  };

  $scope.useContexts = function() {
    return $scope.features.tasks.getStatus('contexts') !== 'disabled';
  };

  function getFavoriteContextIndex(context, favoriteContextInfos){
    for (var i=0; i<favoriteContextInfos.length; i++){
      if ((angular.isArray(favoriteContextInfos[i]) &&
            favoriteContextInfos[i][0] === context.trans.owner &&
            favoriteContextInfos[i][1] === context.trans.uuid) ||
          (angular.isString(favoriteContextInfos[i]) && favoriteContextInfos[i] === context.trans.uuid)){
        return i;
      }
    }
  }

  function updateFavoriteContextPreferences(favoriteContextInfos){
    UserSessionService.setUIPreference('favoriteContexts', favoriteContextInfos);
    UserService.saveAccountPreferences();
  }

  $scope.favoriteContext = function(context) {
    if (context.trans.tagType === 'context') {
      var favoriteContextInfos = UserSessionService.getUIPreference('favoriteContexts');
      if (!favoriteContextInfos) favoriteContextInfos = [];
      if (getFavoriteContextIndex(context, favoriteContextInfos) === undefined){
        if (context.trans.owner === UserSessionService.getUserUUID()){
          favoriteContextInfos.push(context.trans.uuid);
        }else{
          favoriteContextInfos.push([context.trans.owner, context.trans.uuid]);
        }
        updateFavoriteContextPreferences(favoriteContextInfos);
      }
    } else {
      context.trans.favorited = true;
    }
  };

  $scope.unfavoriteContext = function(context) {
    if (context.trans.tagType === 'context') {
      var favoriteContextInfos = UserSessionService.getUIPreference('favoriteContexts');
      if (favoriteContextInfos){
        var favoriteIndex = getFavoriteContextIndex(context, favoriteContextInfos);
        if (favoriteIndex !== undefined){
          favoriteContextInfos.splice(favoriteIndex, 1);
          updateFavoriteContextPreferences(favoriteContextInfos);
        }
      }
    } else {
      delete context.trans.favorited;
    }
  };

  $scope.isFavoriteContext = function (context) {
    var favoritedContexts = $scope.getTagsArray('favoritedContexts');
    if (favoritedContexts && favoritedContexts.length &&
        favoritedContexts.indexOf(context) !== -1){
      return true;
    }
  };

  $scope.getTagItemClasses = function(tag) {
    var classes = [];
    if (tag.trans.parent && !tag.trans.parent.trans.deleted) {
      classes.push('indent');
    }
    return classes;
  };

  $scope.hasChildTags = function(tag){
    return TagsService.isTagsWithParent(tag);
  };
}

TagsController['$inject'] = ['$rootScope', '$scope', '$timeout', 'AnalyticsService', 'ArrayService',
'TagsService', 'UISessionService', 'UserService', 'UserSessionService'];
angular.module('em.base').controller('TagsController', TagsController);
