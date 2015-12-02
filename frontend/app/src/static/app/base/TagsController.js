/* Copyright 2013-2015 Extended Mind Technologies Oy
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
    if (cachedTagsArrays[ownerUUID]) {
      updateAllTags(cachedTagsArrays[ownerUUID], ownerUUID);
      cachedTagsArrays[ownerUUID]['contexts'] = undefined;
      cachedTagsArrays[ownerUUID]['contextsParentless'] = undefined;
      cachedTagsArrays[ownerUUID]['keywords'] = undefined;
      cachedTagsArrays[ownerUUID]['keywordsParentless'] = undefined;
    }
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
    for (var i = 0; i < cachedTags['all'].length; i++) {
      if (cachedTags['all'][i].trans.tagType === 'context'){
        cachedTags['contexts'].push(cachedTags['all'][i]);
      }
    }
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
    return cachedTags['keywords'];
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
            favoriteContextInfos[i][0] === context.trans.owner && favoriteContextInfos[i][1] === context.trans.uuid) ||
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
}

TagsController['$inject'] = ['$rootScope', '$scope', '$timeout', 'AnalyticsService', 'ArrayService',
'TagsService', 'UISessionService', 'UserService', 'UserSessionService'];
angular.module('em.base').controller('TagsController', TagsController);
