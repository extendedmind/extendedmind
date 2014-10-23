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

 function OmnibarEditorController($q, $rootScope, $scope, $timeout, ArrayService) {

  // INITIALIZE VARIABLES

  $scope.titlebar.text = '';
  $scope.searchText = {};

  // SAVING

  $scope.saveOmnibarToItem = function() {
    var item = {title: $scope.titlebar.text};
    $scope.deferEdit().then(function() {
      $scope.saveItem(item);
    });
  };

  // CONVERTING

  $scope.convertToNote = function(){
    $scope.initializeEditor('note', {title: $scope.titlebar.text});
  };

  $scope.convertToTask = function(){
    $scope.initializeEditor('task', {title: $scope.titlebar.text});
  };

  // TITLEBAR

  $scope.omnibarTitlebarTextKeyDown = function (keydownEvent) {
    // Escape
    if (keydownEvent.keyCode === 27){
      $scope.closeEditor();
    }
    // Return
    else if (event.keyCode === 13){
      if ($rootScope.syncState !== 'active' && $scope.titlebarHasText()) {
        // Enter in editor saves to new item
        $scope.closeEditor();
        $scope.saveOmnibarToItem();
      }
      event.preventDefault();
      event.stopPropagation();
    }
  };

  $scope.clearOmnibarTitlebar = function(){
    $scope.titlebar.text = '';
  };

  // SEARCH

  $scope.$watch('titlebar.text', function(newTitle/*, oldTitle*/) {
    $scope.searchText.current = newTitle;
    if (newTitle && newTitle.length > 1) {
      // Use a delayed update for search
      $timeout(function() {
        if ($scope.searchText.current === newTitle)
          $scope.searchText.delayed = newTitle;
      }, 700);
    } else {
      $scope.searchText.delayed = undefined;
    }
  });

  function createSearchItems() {
    var allNotesAndTasks = ArrayService.combineArrays($scope.allActiveTasks,
                                                      $scope.allNotes, 'created', true);
    var allNotesAndTasksAndLists = ArrayService.combineArrays(allNotesAndTasks,
                                                              $scope.allLists, 'created', true);
    $scope.searchItems = ArrayService.combineArrays(allNotesAndTasksAndLists,
                                                    $scope.items, 'created', true);
  }

  $scope.$watch('synced', function(newValue){
    if (newValue) createSearchItems();
  });

  if ($rootScope.synced){
    createSearchItems();
  }

  // Search filter for all item fields: title, content and description
  $scope.searchItemFields = function (item){
    if ($scope.searchText && $scope.searchText.delayed &&
        (item.title.indexOf($scope.searchText.delayed)!=-1 ||
         (item.description && item.description.indexOf($scope.searchText.delayed)!=-1) ||
         (item.content && item.content.indexOf($scope.searchText.delayed)!=-1)))
    {
      return true;
    }
    return false;
  };
}

OmnibarEditorController['$inject'] = ['$q', '$rootScope', '$scope', '$timeout', 'ArrayService'];
angular.module('em.main').controller('OmnibarEditorController', OmnibarEditorController);
