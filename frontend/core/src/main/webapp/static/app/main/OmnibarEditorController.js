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

  /*
  * Search filter for all item fields: title, content and description.
  */
  function searchItemFields(item) {
    if ($scope.searchText && $scope.searchText.delayed &&
        (item.title.indexOf($scope.searchText.delayed)!=-1 ||
         (item.description && item.description.indexOf($scope.searchText.delayed)!=-1) ||
         (item.content && item.content.indexOf($scope.searchText.delayed)!=-1)))
    {
      return true;
    }
    return false;
  }

  /*
  * Match items containing all selected keywords.
  */
  function filterByKeywords(item) {
    if (!$scope.selectedKeywords || !$scope.selectedKeywords.length) return;
    if (!item.transientProperties || !item.transientProperties.keywords) return;

    for (var i = 0, len = $scope.selectedKeywords.length; i < len; i++) {
      if (item.transientProperties.keywords.indexOf($scope.selectedKeywords[i]) === -1) {
        // Selected keyword is not found in the item.
        return false;
      }
    }
    // Item contains all selected keywords.
    return true;
  }

  $scope.itemsFilter = searchItemFields;  // Set default items filter.

  $scope.setFilterItemsByKeywords = function(enabled) {
    if (enabled) {
      $scope.itemsFilter = filterByKeywords;
    } else {
      $scope.itemsFilter = searchItemFields;  // Reset to default items filter.
    }
  };

  // KEYWORDS

  $scope.selectedKeywords = [];
  // Store filtered items into object to maintain prototypical inheritance.
  $scope.filteredItems = {
    unselectedKeywords: $scope.keywords,
    searchResults: undefined
  };

  /*
  * Watch and notify length change of filtered keywords arrays.
  *
  * When length of unselected keywords array changes, selected keywords array length changes as well.
  */
  $scope.notifyFilteredKeywordsLengthChange = function(callback) {
    return $scope.$watch('filteredItems.unselectedKeywords.length', function(newLength) {
      callback(newLength, $scope.selectedKeywords.length);
    });
  };

  $scope.clearSelectedKeywords = function() {
    $scope.selectedKeywords = [];
  };

  $scope.selectKeyword = function(keyword) {
    $scope.selectedKeywords.push(keyword);
  };
  $scope.unselectKeyword = function(keyword) {
    $scope.selectedKeywords.splice($scope.selectedKeywords.indexOf(keyword), 1);
  };

  /*
  * Return unselected keywords which are found in the items that have been filtered by selected keywords.
  */
  $scope.unselectedKeywordsFromItemsWithSelectedKeywords = function(keyword) {
    if (!$scope.selectedKeywords || !$scope.selectedKeywords.length) {
      // No keywords selected. Return keyword.
      return true;
    }

    if ($scope.selectedKeywords.indexOf(keyword) !== -1) {
      // Keyword is selected.
      return false;
    }

    for (var i = 0, len = $scope.filteredItems.searchResults.length; i < len; i++) {
      if ($scope.filteredItems.searchResults[i].transientProperties.keywords.indexOf(keyword) !== -1) {
        // Keyword found in item from search results.
        return true;
      }
    }
  };
}

OmnibarEditorController['$inject'] = ['$q', '$rootScope', '$scope', '$timeout', 'ArrayService'];
angular.module('em.main').controller('OmnibarEditorController', OmnibarEditorController);
