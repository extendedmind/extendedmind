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
 'use strict';

 function TagsController($rootScope, $scope, $timeout, AnalyticsService, ArrayService, TagsService,
                         UISessionService) {


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
      cachedTagsArrays[ownerUUID]['keywords'] = undefined;
    }
  }

  function updateAllTags(cachedTags, ownerUUID) {
    var activeTags = TagsService.getTags(ownerUUID);
    cachedTags['all'] = [];
    if (activeTags && activeTags.length){
      for (var i = 0; i < activeTags.length; i++) {
        // Contexts and keywords are sorted everywhere in alphabetical order
        ArrayService.insertItemToArray(activeTags[i], cachedTags['all'], 'title');
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

      case 'contexts':
      if (!cachedTagsArrays[ownerUUID]['contexts']) {
        updateContexts(cachedTagsArrays[ownerUUID], ownerUUID);
      }
      return cachedTagsArrays[ownerUUID]['contexts'];
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
}

TagsController['$inject'] = ['$rootScope', '$scope', '$timeout', 'AnalyticsService', 'ArrayService',
'TagsService', 'UISessionService'];
angular.module('em.base').controller('TagsController', TagsController);
