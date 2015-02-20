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

 function TrashController($scope, AnalyticsService, ArrayService, ItemsService, ListsService, NotesService,
                          TagsService, TasksService, UISessionService) {
  AnalyticsService.visit('trash');

  // INITIALIZING
  if (angular.isFunction($scope.registerArrayChangeCallback)) {
    $scope.registerArrayChangeCallback('items', ['deleted'], invalidateDeleted,
                                       'TrashController');
    $scope.registerArrayChangeCallback('lists', ['deleted'], invalidateDeleted,
                                       'TrashController');
    $scope.registerArrayChangeCallback('notes', ['deleted'], invalidateDeleted,
                                       'TrashController');
    $scope.registerArrayChangeCallback('tags', ['deleted'], invalidateDeleted,
                                       'TrashController');
    $scope.registerArrayChangeCallback('tasks', ['deleted'], invalidateDeleted,
                                       'TrashController');
  }

  var cachedDeletedItems = {};
  function invalidateDeleted(data, modifiedData, dataType, ownerUUID) {
    if (cachedDeletedItems[ownerUUID]) {
      if ($scope.getActiveFeature() === 'trash') {
        // invalidate
        cachedDeletedItems[ownerUUID] = updateDeleted(ownerUUID);
      } else {
        // clear
        delete cachedDeletedItems[ownerUUID];
      }
    }
  }

  $scope.getDeletedArray = function() {
    var ownerUUID = UISessionService.getActiveUUID();
    if (!cachedDeletedItems[ownerUUID]) cachedDeletedItems[ownerUUID] = updateDeleted(ownerUUID);
    return cachedDeletedItems[ownerUUID];
  };

  function updateDeleted(ownerUUID) {
    var allDeleted = ItemsService.getDeletedItems(ownerUUID).concat(ListsService.getDeletedLists(ownerUUID),
                                                                    NotesService.getDeletedNotes(ownerUUID),
                                                                    TagsService.getDeletedTags(ownerUUID),
                                                                    TasksService.getDeletedTasks(ownerUUID));

    cachedDeletedItems[ownerUUID] = [];
    for (var i = 0; i < allDeleted.length; i++) {
      ArrayService.insertItemToArray(allDeleted[i], cachedDeletedItems[ownerUUID], 'deleted', true);
    }
    return cachedDeletedItems[ownerUUID];
  }

}
TrashController['$inject'] = ['$scope', 'AnalyticsService', 'ArrayService', 'ItemsService', 'ListsService',
'NotesService', 'TagsService', 'TasksService', 'UISessionService'];
angular.module('em.main').controller('TrashController', TrashController);
