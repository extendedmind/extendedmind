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

 function TagsController($rootScope, $scope, $timeout, AnalyticsService, TagsService, UISessionService) {

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

TagsController['$inject'] = [
'$rootScope', '$scope', '$timeout',
'AnalyticsService', 'TagsService', 'UISessionService'
];
angular.module('em.base').controller('TagsController', TagsController);
