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

 /* global cordova */
 'use strict';

 function OmnibarEditorController($q, $rootScope, $scope, $timeout,
                                  AnalyticsService, ArrayService, packaging,
                                  UISessionService, UserSessionService) {

  // INITIALIZING

  AnalyticsService.visit('omnibar');

  $scope.titlebar = {};
  $scope.searchText = {};

  if (angular.isFunction($scope.registerFeatureEditorAboutToCloseCallback))
    $scope.registerFeatureEditorAboutToCloseCallback(omnibarEditorAboutToClose, 'OmnibarEditorController');

  function omnibarEditorAboutToClose() {
    if (packaging === 'android-cordova'){
      // In Android we need to force the keyboard down
      cordova.plugins.Keyboard.close();
    }
  }

  $scope.getOmnibarPlaceholderText = function(){
    if ($scope.features.inbox.getStatus() === 'disabled'){
     return 'type to search';
    }else{
      return 'save to inbox / search';
    }
  };

  // SAVING

  $scope.saveOmnibarToItem = function() {
    var item = $scope.getNewItem({title: $scope.titlebar.text});
    UISessionService.deferAction('omnibarToItem', $rootScope.EDITOR_CLOSED_FAILSAFE_TIME).then(function() {
      $scope.saveItem(item).then(function(result){
        if (!$scope.isFeatureActive('inbox') && result === 'new'){
          UISessionService.pushNotification({
            type: 'inbox',
            itemType: 'item',
            item: item,
            openFn: $scope.openItemEditor,
            gotoFn: $scope.gotoInbox
          });
        }
      });
    });
  };

  $scope.saveOmnibarToNote = function(){
    if ($scope.titlebarHasText()) {
      var note = $scope.getNewNote({title: $scope.titlebar.text});
      $scope.saveNote(note).then(function() {
        $scope.initializeEditor('note', note, 'omnibar');
      });
    } else {
      $scope.initializeEditor('note', $scope.getNewNote(), 'omnibar');
    }
  };

  $scope.saveOmnibarToTask = function(){
    if ($scope.titlebarHasText()) {
      var task = $scope.getNewTask({title: $scope.titlebar.text});
      $scope.saveTask(task).then(function() {
        $scope.initializeEditor('task', task, 'omnibar');
      });
    } else {
      $scope.initializeEditor('task', $scope.getNewTask(), 'omnibar');
    }
  };

  // TITLEBAR

  $scope.titlebarHasText = function() {
    return $scope.titlebar.text && $scope.titlebar.text.length !== 0;
  };

  $scope.omnibarTitlebarTextKeyDown = function (keydownEvent) {
    // Escape
    if (keydownEvent.keyCode === 27){
      $scope.closeEditor();
    }
    // Return
    else if (event.keyCode === 13){
      if ($rootScope.syncState !== 'active' && $scope.titlebarHasText() &&
          $scope.features.inbox.getStatus() !== 'disabled') {
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
    var i;
    var ownerUUID = UISessionService.getActiveUUID();
    var unsortedSearchItems = [];
    $scope.searchItems = [];

    // Filter completed tasks to search items.
    var tasks = $scope.getTasksArray('all', {force: true});
    for (i = 0; i < tasks.length; i++) {
      if (!tasks[i].trans.completed) unsortedSearchItems.push(tasks[i]);
    }

    // Join rest of the arrays to search items.
    unsortedSearchItems = unsortedSearchItems.concat($scope.getNotesArray('all'),
                                                     $scope.getListsArray('all'),
                                                     $scope.getItemsArray('all'));

    // Sort search items.
    for (i = 0; i < unsortedSearchItems.length; i ++) {
      ArrayService.insertItemToArray(unsortedSearchItems[i], $scope.searchItems, 'modified', true);
    }
  }

  $scope.$watch('synced', function(newValue){
    if (newValue) createSearchItems();
  });

  if ($rootScope.synced || UserSessionService.isFakeUser()){
    createSearchItems();
  }

  /*
  * Case insensitive search filter for all item fields: title, content and description.
  *
  * NOTE: See the links, why we are using angular.uppercase here.
  *
  * @see: http://stackoverflow.com/a/2140644
  *       http://en.wikipedia.org/wiki/Capital_%E1%BA%9E
  *       http://msdn.microsoft.com/en-us/library/bb386042.aspx
  */
  function searchItemFields(item) {
    if ($scope.searchText && $scope.searchText.delayed) {
      var delayedUserInput = angular.uppercase($scope.searchText.delayed);

      if (item.trans.title && angular.uppercase(item.trans.title).indexOf(delayedUserInput) !== -1 ||
          item.trans.description &&
          angular.uppercase(item.trans.description).indexOf(delayedUserInput) !== -1 ||
          item.trans.content && angular.uppercase(item.trans.content).indexOf(delayedUserInput) !== -1)
      {
        return true;
      }
    }
    return false;
  }

  /*
  * Match items containing all selected keywords.
  */
  function filterByKeywords(item) {
    if ($scope.titlebar && $scope.titlebar.text) {
      // First filter out items not matching titlebar text.
      if (!searchItemFields(item)) return false;
    } else {

      // Then
      if (!$scope.selectedKeywords || !$scope.selectedKeywords.length) return false;
      if (!item.trans.keywords) return false;
    }

    for (var i = 0, len = $scope.selectedKeywords.length; i < len; i++) {
      if (item.trans.keywords) {
        if (item.trans.keywords.indexOf($scope.selectedKeywords[i]) === -1) {
          // Selected keyword is not found in the item.
          return false;
        }
      } else {
        // Filter items with no selected keywords.
        return false;
      }
    }
    // Item contains all selected keywords.
    return true;
  }

  $scope.keywordsFilter = unselectedKeywordsFromItemsWithSelectedKeywords;  // Set default keywords filter.
  $scope.itemsFilter = searchItemFields;  // Set default items filter.

  $scope.setKeywordsAndItemsFilters = function(enabled) {
    if (enabled) {
      $scope.itemsFilter = filterByKeywords;
      $scope.keywordsFilter = unselectedKeywordsFromItemsWithSelectedKeywords;
    } else {
      $scope.itemsFilter = searchItemFields;  // Reset to default items filter.
      $scope.keywordsFilter = undefined;      // Clear keywords filter.
      $scope.keywordsSearch.text = ''; // Clear keywords filter text.
    }
  };

  // KEYWORDS

  $scope.selectedKeywords = [];
  $scope.keywordsSearch = {
    text: ''
  };
  // Store filtered items into object to maintain prototypical inheritance.
  $scope.filteredItems = {
    unselectedKeywords: $scope.getTagsArray('keywords'),
    searchResults: undefined
  };

  $scope.isKeywordsPristineAndOmnibarTextEmpty = function() {
    return (!$scope.keywordsSearch.text || !$scope.keywordsSearch.text.length) &&
    (!$scope.selectedKeywords || !$scope.selectedKeywords.length) &&
    ((!$scope.titlebar || !$scope.titlebar.text));
  };

  $scope.isKeywordsPristine = function() {
    return !$scope.selectedKeywords || !$scope.selectedKeywords.length;
  };

  $scope.inputFocus = function(focus, id, inputText) {
    if (typeof inputFocusCallback === 'function') inputFocusCallback(focus, id, inputText);
  };


  var inputFocusCallback;
  $scope.registerInputFocusCallback = function(callback) {
    inputFocusCallback = callback;
  };

  /*
  * Watch and notify length change of filtered keywords arrays.
  *
  * When length of unselected keywords array changes, selected keywords array length changes as well.
  */
  $scope.notifyFilteredKeywordsLengthChange = function(callback) {
    var preventFirstRun = $scope.titlebar && $scope.titlebar.text;
    // Hackily prevent first run when titlebar has text, because it filters filteredItems.unselectedKeywords.
    // First $watch executes when filteredItems.unselectedKeywords is rendered into DOM during ng-if $digest.
    // After that, keywords are filtered and filteredItems.unselectedKeywords changed, so only now whatch is
    // executed with correct value.
    return $scope.$watch('filteredItems.unselectedKeywords.length', function(newLength) {
      if (preventFirstRun) {
        // Do nothing when first run is prevented.
        preventFirstRun = false;
      } else {
        // Execute callback with new length and title infos.
        callback(newLength, $scope.selectedKeywords.length, (!$scope.titlebar || !$scope.titlebar.text));
      }
    });
  };

  $scope.clearSelectedKeywords = function() {
    $scope.selectedKeywords = [];
  };

  $scope.selectKeyword = function(keyword) {
    $scope.selectedKeywords.push(keyword);
    $scope.keywordsSearch.text = ''; // Clear search text.
  };
  $scope.unselectKeyword = function(keyword) {
    $scope.selectedKeywords.splice($scope.selectedKeywords.indexOf(keyword), 1);
  };

  /*
  * Return unselected keywords which are found in the items that have been filtered by selected keywords.
  */
  function unselectedKeywordsFromItemsWithSelectedKeywords(keyword) {
    if ((!$scope.selectedKeywords || !$scope.selectedKeywords.length) &&
        (!$scope.titlebar || !$scope.titlebar.text))
    {
      // No keywords selected and search text. Return keyword.
      return true;
    }

    if ($scope.selectedKeywords.indexOf(keyword) !== -1) {
      // Keyword is selected.
      return false;
    }

    for (var i = 0, len = $scope.filteredItems.searchResults.length; i < len; i++) {
      var item = $scope.filteredItems.searchResults[i];
      if (item.trans.keywords &&
          item.trans.keywords.indexOf(keyword) !== -1)
      {
        // Keyword found in search results from item which has keywords.
        return true;
      }
    }
  }
}

OmnibarEditorController['$inject'] = ['$q', '$rootScope', '$scope', '$timeout',
'AnalyticsService', 'ArrayService', 'packaging', 'UISessionService',
'UserSessionService'];
angular.module('em.main').controller('OmnibarEditorController', OmnibarEditorController);
