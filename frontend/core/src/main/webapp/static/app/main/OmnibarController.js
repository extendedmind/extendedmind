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

 /* global cordova */
 'use strict';

 function OmnibarController($q, $rootScope, $scope, $timeout, AnalyticsService, ItemsService, NotesService, TasksService, UISessionService) {

  $scope.omnibarText = {};
  $scope.omnibarVisible = false;
  $scope.searchText = {};
  $scope.omnibarKeywords = {isVisible: false};
  $scope.isItemEditMode = false;
  $scope.isItemAddMode = false;

  var omnibarInputFocusCallbackFunction;

  var omnibarFeatures = {
    search: {
      inputPlaceholder: 'save / recall',
      footerSaveText: 'save to inbox',
      saveItemLocation: 'inbox',
      itemSaveMethod: ItemsService.saveItem.bind(ItemsService),
      persistentItemValues: ['title'],
      isActive: true  // default feature
    },
    task: {
      inputPlaceholder: 'add task',
      footerSaveText: 'save',
      saveItemLocation: 'tasks',
      itemSaveMethod: TasksService.saveTask.bind(TasksService),
      itemResetFunction: TasksService.resetTask.bind(TasksService),
      persistentItemValues: ['title', 'description']
    },
    note: {
      inputPlaceholder: 'add note',
      footerSaveText: 'save',
      saveItemLocation: 'notes',
      itemSaveMethod: $scope.saveNote,
      initializeItemFuncion: $scope.initializeOmnibarNote,
      itemResetFunction: NotesService.resetNote.bind(NotesService),
      persistentItemValues: ['title', 'content']
    }
  };

  var MAX_CONTAINER_HEIGHT = 769;
  var omnibarActionsHeight = 44, omnibarContainerHeight = 156, keyboardHeight = 0;
  function getOmnibarStaticContentHeight() {
    return omnibarContainerHeight - ($scope.isItemEditMode || $scope.isItemAddMode ? omnibarActionsHeight : 0);
  }

  $scope.getOmnibarFeatureHeight = function getOmnibarFeatureHeight() {
    if ($scope.currentHeight <= MAX_CONTAINER_HEIGHT){
      return $scope.currentHeight - getOmnibarStaticContentHeight() - keyboardHeight;
    } else {
      return MAX_CONTAINER_HEIGHT - getOmnibarStaticContentHeight() - keyboardHeight;
    }
  };

  if ($rootScope.packaging === 'ios-cordova'){
    $scope.$watch('softKeyboard.height', function(newValue){
      if (newValue){
        keyboardHeight = newValue;
      } else {
        keyboardHeight = 0;
      }
    });
  }

  // Layout for expanding text areas require a max height
  // that needs to be defined programmatically

  var taskDescriptionHasFocus = false;
  var noteContentHasFocus = false;

  $scope.getEditTaskDescriptionMaxHeight = function() {
    var usedHeight = $scope.isItemEditMode || $scope.isItemAddMode ? 0 : omnibarActionsHeight;
    if (taskDescriptionHasFocus){
      usedHeight += 160;
    } else {
      usedHeight += 290;
      if ($scope.task && $scope.task.date){
        usedHeight += 44;
      }
    }

    if ($scope.currentHeight <= MAX_CONTAINER_HEIGHT){
      var calculatedHeight = $scope.currentHeight - usedHeight - keyboardHeight;
      return (calculatedHeight < 44 ? 44 : calculatedHeight);
    } else {
      return MAX_CONTAINER_HEIGHT - usedHeight - keyboardHeight;
    }
  };

  $scope.getEditNoteContentMaxHeight = function() {
    var usedHeight = $scope.isItemEditMode || $scope.isItemAddMode ? 0 : omnibarActionsHeight;
    if (noteContentHasFocus)
      usedHeight += 160;
    else
      usedHeight += $scope.noteHasKeywords() ? 240 : 204;
    if ($scope.currentHeight <= MAX_CONTAINER_HEIGHT){
      var calculatedHeight = $scope.currentHeight - usedHeight - keyboardHeight;
      return (calculatedHeight < 44 ? 44 : calculatedHeight);
    } else {
      return MAX_CONTAINER_HEIGHT - usedHeight - keyboardHeight;
    }
  };

  $scope.getSearchPlaceholderMaxHeight = function() {
    var usedHeight = 44 + getOmnibarStaticContentHeight();
    if ($scope.currentHeight <= MAX_CONTAINER_HEIGHT){
      return $scope.currentHeight - usedHeight - keyboardHeight;
    } else {
      return MAX_CONTAINER_HEIGHT - usedHeight - keyboardHeight;
    }
  };

  $scope.noteContentFocus = function() {
    noteContentHasFocus = true;
  };
  $scope.noteContentBlur = function() {
    noteContentHasFocus = false;
  };
  $scope.hideNoteProperties = function() {
    return noteContentHasFocus;
  };
  $scope.taskDescriptionFocus = function() {
    taskDescriptionHasFocus = true;
  };
  $scope.taskDescriptionBlur = function() {
    taskDescriptionHasFocus = false;
  };

  $scope.hideTaskProperties = function() {
    return taskDescriptionHasFocus;
  };

  $scope.getOmnibarVisibilityClass = function getOmnibarVisibilityClass() {
    return $scope.omnibarVisible ? 'omnibar-visible' : 'omnibar-hidden';
  };

  $scope.closeOmnibar = function closeOmnibar() {
    if ($scope.omnibarVisible){
      $scope.omnibarVisible = false;
      if ($rootScope.packaging === 'ios-cordova'){
        cordova.plugins.Keyboard.disableScroll(false);
      }
    }
  };

  $scope.omnibarHasText = function omnibarHasText() {
    return $scope.omnibarText.title && $scope.omnibarText.title.length !== 0;
  };

  $scope.isSearchActive = function isSearchActive() {
    return $scope.searchText.delayed && $scope.searchText.delayed.length > 1;
  };
  $scope.$watch('omnibarText.title', function(newTitle/*, oldTitle*/) {
    $scope.searchText.current = newTitle;
    if (newTitle && newTitle.length > 1){
      // Use a delayed update for search
      $timeout(function(){
        if ($scope.searchText.current === newTitle){
          $scope.searchText.delayed = newTitle;
        }
      }, 700);
    } else {
      $scope.searchText.delayed = undefined;
    }
  });

  // TODO analytics visit omnibar
  $scope.openOmnibar = function openOmnibar(feature) {
    if (!$scope.onboardingInProgress){
      if ($rootScope.packaging === 'ios-cordova'){
        cordova.plugins.Keyboard.disableScroll(true);
      }
      AnalyticsService.visit('omnibar');
      $scope.setOmnibarFeatureActive(feature);
      $scope.omnibarVisible = true;
    }
  };

  function initializeOmnibarItem(item, feature) {
    $scope.omnibarText.title = item.title;
    $scope[feature] = item;
  }

  $scope.editItemInOmnibar = function editItemInOmnibar(item, feature) {
    $scope.isItemEditMode = true;
    initializeOmnibarItem(item, feature);
    $scope.openOmnibar(feature);
  };

  $scope.addItemInOmnibar = function addItemInOmnibar(item, feature) {
    $scope.isItemAddMode = true;
    initializeOmnibarItem(item, feature);
    $scope.openOmnibar(feature);
  };

  $scope.omnibarKeyDown = function omnibarKeyDown(event) {
    if (event.keyCode === 27){
      $scope.clearAndHideOmnibar();
    } else if (event.keyCode === 13){
      // Enter in omnibar saves, no line breaks allowed
      event.preventDefault();
      event.stopPropagation();
      $scope.saveOmnibarText();
    }
  };

  // For empty omnibar search placeholder
  $scope.hideEmptyOmnibar = function hideEmptyOmnibar() {
    $scope.clearAndHideOmnibar();
  };

  $scope.saveOmnibarText = function saveOmnibarText() {

    function saveItem() {
      return omnibarFeatures[activeOmnibarFeature].itemSaveMethod($scope[activeOmnibarFeature], UISessionService.getActiveUUID());
    }

    function performTearDown() {
      if (!$scope.isItemEditMode && !$scope.isItemAddMode){
        UISessionService.setToasterNotification(omnibarFeatures[activeOmnibarFeature].saveItemLocation);
      }
      if (!$scope.isItemEditMode || $scope.isItemAddMode){
        if ($scope.getOnboardingPhase() === 'itemAdded' || $scope.getOnboardingPhase() === 'sortingStarted'){
          $scope.setOnboardingPhase('secondItemAdded');
        }
      }
      $scope.clearAndHideOmnibar();
    }

    var activeOmnibarFeature;
    if ($scope.omnibarHasText() && !$rootScope.isLoading) {
      activeOmnibarFeature = $scope.getActiveOmnibarFeature();
      $scope[activeOmnibarFeature].title = $scope.omnibarText.title;
      $scope.saveUnsavedListAndLinkToItem($scope[activeOmnibarFeature]).then(saveItem).then(performTearDown);
    }
  };

  $scope.isOmnibarFeatureActive = function isOmnibarFeatureActive(feature) {
    return omnibarFeatures[feature].isActive;
  };

  $scope.setOmnibarFeatureActive = function setOmnibarFeatureActive(newActiveFeature) {
    var oldActiveFeature = $scope.getActiveOmnibarFeature();

    for (var omnibarFeature in omnibarFeatures) {
      if (omnibarFeatures.hasOwnProperty(omnibarFeature)) {
        omnibarFeatures[omnibarFeature].isActive = omnibarFeature === newActiveFeature;
      }
    }
    if (!$scope.isItemEditMode && !$scope.isItemAddMode) {
      convertOmnibarItemContent(oldActiveFeature, newActiveFeature);
      initializeNewItemFromOmnibarText(newActiveFeature);
    }
    setFocusOnEmptyOmnibarInput();
  };

  function convertOmnibarItemContent(oldActiveFeature, newActiveFeature) {
    var persistentItemValues = omnibarFeatures[newActiveFeature].persistentItemValues;

    if (oldActiveFeature === 'task' && newActiveFeature === 'note') {
      if ($scope.omnibarText.description) $scope.omnibarText.content = $scope.omnibarText.description;
    } else if (oldActiveFeature === 'note' && newActiveFeature === 'task') {
      if ($scope.omnibarText.content) $scope.omnibarText.description = $scope.omnibarText.content;
    }

    function isPersitent(value) {
      return persistentItemValues.some(function(itemValue) {
        return itemValue === value;
      });
    }
    for (var itemValue in $scope.omnibarText) {
      if ($scope.omnibarText.hasOwnProperty(itemValue)) {
        if (!isPersitent(itemValue)) delete $scope.omnibarText[itemValue];
      }
    }
  }

  function initializeNewItemFromOmnibarText(feature) {
    if (omnibarFeatures[feature].initializeItemFuncion) omnibarFeatures[feature].initializeItemFuncion($scope.omnibarText);
    else {
      $scope[feature] = {};
      $scope[feature] = $scope.omnibarText;
    }
  }

  $scope.registerOmnibarInputFocusCallback = function registerOmnibarInputFocusCallback(omnibarInputFocusCallback) {
    omnibarInputFocusCallbackFunction = omnibarInputFocusCallback;
  };

  function setFocusOnEmptyOmnibarInput() {
    if (!$scope.omnibarHasText() && omnibarInputFocusCallbackFunction) omnibarInputFocusCallbackFunction();
  }

  $scope.getOmnibarFooterSaveText = function getOmnibarFooterSaveText() {
    return getActiveOmnibarFeatureValue('footerSaveText');
  };
  $scope.getOmnibarInputPlaceholder = function getOmnibarInputPlaceholder() {
    return getActiveOmnibarFeatureValue('inputPlaceholder');
  };

  $scope.getActiveOmnibarFeature = function getActiveOmnibarFeature() {
    for (var omnibarFeature in omnibarFeatures) {
      if (omnibarFeatures.hasOwnProperty(omnibarFeature)) {
        if (omnibarFeatures[omnibarFeature].isActive) return omnibarFeature;
      }
    }
  };

  function getActiveOmnibarFeatureValue(valueName) {
    var activeOmnibarFeature = $scope.getActiveOmnibarFeature();
    return omnibarFeatures[activeOmnibarFeature][valueName];
  }

  // KEYWORDS

  var selectedOmnibarKeywords = [];

  $scope.getSelectedAndFilterUnselectedKeywords = function getSelectedAndFilterUnselectedKeywords() {
    if ($scope.searchText.delayed) {
      return $scope.keywords.filter(function(keyword) {
        return selectedOmnibarKeywords.indexOf(keyword) !== -1 || keyword.title.indexOf($scope.searchText.delayed) !== -1;
      });
    } else {
      return $scope.keywords;
    }
  };

  $scope.getFilteredOmnibarNotes = function getFilteredOmnibarNotes() {
    // show nothing if no keywords selected
    if (selectedOmnibarKeywords.length) {
      var filteredNotes = [];

      $scope.notes.forEach(function(note) {
        if (note.relationships && note.relationships.tags) {
          if (selectedOmnibarKeywords.every(function(keyword) {
            return (note.relationships.tags.indexOf(keyword.uuid) !== -1);
          })) {
            filteredNotes.push(note);
          }
        }
      });
      return filteredNotes;
    }
  };

  $scope.toggleKeywordSelected = function toggleKeywordSelected(keyword) {
    var toggledKeywordIndex = selectedOmnibarKeywords.indexOf(keyword);
    if (toggledKeywordIndex === -1) {
      selectedOmnibarKeywords.push(keyword);
    } else {
      selectedOmnibarKeywords.splice(toggledKeywordIndex, 1);
    }
  };

  $scope.toggleOmnibarKeywordsVisible = function toggleOmnibarKeywordsVisible() {
    $scope.omnibarKeywords.isVisible = !$scope.omnibarKeywords.isVisible;
    if ($scope.omnibarKeywords.isVisible) selectedOmnibarKeywords = [];
  };

  /**
  * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
  *
  * @param {String} text The text to be rendered.
  * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
  *
  * @see http://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
  */
  function getTextWidth(text, font) {
    // re-use canvas object for better performance
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
    var context = canvas.getContext('2d');
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
  }

  var currentOmnibarStyle;
  $scope.getOmnibarClass = function getOmnibarClass(){
    if ($scope.omnibarText.title && $scope.omnibarText.title.length > 10){
      var omnibarWidth;
      if ($rootScope.currentWidth >= 568){
        // Maximum width for column
        omnibarWidth = 470;
      } else {
        omnibarWidth = $rootScope.currentWidth - 98;
      }

      var fontSize = '21px';
      if (currentOmnibarStyle === 'omnibar-input-very-long'){
        fontSize = '12px';
      } else if (currentOmnibarStyle === 'omnibar-input-long'){
        fontSize = '15px';
      } else if (currentOmnibarStyle === 'omnibar-input-medium'){
        fontSize = '18px';
      }

      var currentTextWidth = getTextWidth($scope.omnibarText.title, fontSize + ' sans-serif');
      if (currentOmnibarStyle === 'omnibar-input-very-long' || (currentTextWidth / 2 + 25) > omnibarWidth){
        if (currentOmnibarStyle !== 'omnibar-input-very-long'){
          $rootScope.$broadcast('elastic:adjust');
          currentOmnibarStyle = 'omnibar-input-very-long';
        }
      }
      else if (currentOmnibarStyle === 'omnibar-input-long' || (currentTextWidth / 2 + 35) > omnibarWidth){
        if (currentOmnibarStyle !== 'omnibar-input-long'){
          $rootScope.$broadcast('elastic:adjust');
          currentOmnibarStyle = 'omnibar-input-long';
        }
      } else if (currentOmnibarStyle === 'omnibar-input-medium' || (currentTextWidth + 20) > omnibarWidth){
        if (currentOmnibarStyle !== 'omnibar-input-medium'){
          $rootScope.$broadcast('elastic:adjust');
          currentOmnibarStyle = 'omnibar-input-medium';
        }
      } else {
        currentOmnibarStyle = undefined;
      }
      return currentOmnibarStyle;
    } else {
      currentOmnibarStyle = undefined;
    }
  };

  // TEARDOWN

  $scope.clearOmnibar = function clearOmnibar() {
    $scope.omnibarText = {};
    currentOmnibarStyle = undefined;
  };

  $scope.clearAndHideOmnibar = function clearAndHideOmnibar() {
    $scope.clearOmnibar();
    $scope.closeOmnibar();
    $scope.isItemEditMode = false;
    $scope.isItemAddMode = false;
    $scope.omnibarKeywords.isVisible = false;
    selectedOmnibarKeywords = [];
  };

  // Reset item transient values, then clear and hide omnibar
  $scope.cancelOmnibarEdit = function cancelOmnibarEdit() {
    if ($scope.isItemEditMode || $scope.isItemAddMode) {
      var activeOmnibarFeature = $scope.getActiveOmnibarFeature();
      omnibarFeatures[activeOmnibarFeature].itemResetFunction($scope[activeOmnibarFeature], UISessionService.getActiveUUID());
    }
    $scope.clearAndHideOmnibar();
  };
}

OmnibarController['$inject'] = ['$q', '$rootScope', '$scope', '$timeout', 'AnalyticsService', 'ItemsService', 'NotesService', 'TasksService', 'UISessionService'];
angular.module('em.app').controller('OmnibarController', OmnibarController);
