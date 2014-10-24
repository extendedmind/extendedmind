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

 function ItemsController($rootScope, $scope, $timeout, AnalyticsService, ItemsService, UISessionService) {

  // SAVING

  $scope.saveItem = function(item) {
    if (item.title && item.title.length > 0) {

      if (!item.uuid){
        // when adding issue a 500ms lock to prevent leave animation for tasks below this
        // in the list
        UISessionService.lock('leaveAnimation', 500);
      }

      return ItemsService.saveItem(item, UISessionService.getActiveUUID());
    }
  };

  // DELETING

  $scope.deleteItem = function(item) {
    if (item.uuid) {

      UISessionService.pushDelayedNotification({
        type: 'deleted',
        itemType: 'item', // NOTE: Same as item.transientProperties.itemType
        item: item,
        undoFn: $scope.undeleteItem
      });

      $timeout(function() {
        UISessionService.activateDelayedNotifications();
      }, $rootScope.LIST_ITEM_LEAVE_ANIMATION_SPEED);

      AnalyticsService.do('deleteItem');
      return ItemsService.deleteItem(item, UISessionService.getActiveUUID());
    }
  };

  $scope.undeleteItem = function(item) {
    if (item.uuid) {
      AnalyticsService.do('undeleteItem');
      return ItemsService.undeleteItem(item, UISessionService.getActiveUUID());
    }
  };
}

ItemsController['$inject'] = [
'$rootScope', '$scope', '$timeout',
'AnalyticsService', 'ItemsService', 'UISessionService'
];
angular.module('em.main').controller('ItemsController', ItemsController);
