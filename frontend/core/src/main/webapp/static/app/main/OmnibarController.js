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

 function OmnibarController($q, $rootScope, $scope, $timeout, AnalyticsService, ItemsService, NotesService, SnapService, TasksService, UISessionService) {

  var omnibarVisible = false;
  $scope.omnibarText = {};
  $scope.searchText = {};
  $scope.omnibarKeywords = {isVisible: false};
  $scope.isItemEditMode = false;
  $scope.isItemAddMode = false;

  var omnibarInputFocusCallbackFunction = {};
  var omnibarInputBlurCallbackFunction = {};

  SnapService.registerAnimatedCallback(snapDrawerAnimated, 'right', 'OmnibarController');
  function snapDrawerAnimated(snapperState) {
    if (snapperState === 'closed') clearAndHideOmnibar();
    else if (snapperState === 'right') setFocusOnOmnibarInput();
    $scope.$apply();
  }

  var omnibarFeatures = {
    search: {
      inputPlaceholder: 'save to inbox / search...',
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

  // UI COMPONENTS

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
    return omnibarVisible ? 'omnibar-visible' : 'omnibar-hidden';
  };

  $scope.omnibarHasText = function omnibarHasText() {
    return $scope.omnibarText.title && $scope.omnibarText.title.length !== 0;
  };

  $scope.isSearchActive = function isSearchActive() {
    return $scope.searchText.delayed && $scope.searchText.delayed.length > 1;
  };

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

  // We don't want whole page to be scrollable when iOS keyboard is open.
  function setNativeScrollingDisabled(isDisabled) {
    if ($rootScope.packaging === 'ios-cordova') {
      // https://github.com/driftyco/ionic-plugins-keyboard
      cordova.plugins.Keyboard.disableScroll(isDisabled);
    }
  }

  // Show search results with slight delay.
  $scope.$watch('omnibarText.title', function(newTitle/*, oldTitle*/) {
    $scope.searchText.current = newTitle;
    if (newTitle && newTitle.length > 1) {
      // Use a delayed update for search
      $timeout(function() {
        if ($scope.searchText.current === newTitle) {
          $scope.searchText.delayed = newTitle;
        }
      }, 700);
    } else {
      $scope.searchText.delayed = undefined;
    }
  });

  // Omnibar title input focus/blur
  $scope.registerOmnibarInputFocusCallback = function registerOmnibarInputFocusCallback(omnibarInputFocusCallback) {
    omnibarInputFocusCallbackFunction = omnibarInputFocusCallback;
  };
  $scope.registerOmnibarInputBlurCallback = function registerOmnibarInputBlurCallback(omnibarInputBlurCallback) {
    omnibarInputBlurCallbackFunction = omnibarInputBlurCallback;
  };
  function setFocusOnOmnibarInput() {
    if (typeof omnibarInputFocusCallbackFunction === 'function') omnibarInputFocusCallbackFunction();
  }
  function blurOmnibarInput() {
    if (typeof omnibarInputBlurCallbackFunction === 'function') omnibarInputBlurCallbackFunction();
  }

  // CONTAINER DIMENSIONS

  var MAX_CONTAINER_HEIGHT = 769;
  var omnibarActionsHeight = 44, omnibarContainerHeight = 156, keyboardHeight = 0;
  function getOmnibarStaticContentHeight() {
    return omnibarContainerHeight - ($scope.isItemEditMode || $scope.isItemAddMode ? omnibarActionsHeight : 0);
  }

  $scope.getOmnibarFeatureHeight = function getOmnibarFeatureHeight() {
    if ($scope.currentHeight <= MAX_CONTAINER_HEIGHT) {
      return $scope.currentHeight - getOmnibarStaticContentHeight() - keyboardHeight;
    } else {
      return MAX_CONTAINER_HEIGHT - getOmnibarStaticContentHeight() - keyboardHeight;
    }
  };

  if ($rootScope.packaging === 'ios-cordova') {
    $scope.$watch('softKeyboard.height', function(newValue) {
      if (newValue) {
        keyboardHeight = newValue;
      } else {
        keyboardHeight = 0;
      }
    });
  }

  // Layout for expanding text areas require a max height
  // that needs to be defined programmatically

  var taskDescriptionHasFocus = false;

  $scope.getEditTaskDescriptionMaxHeight = function() {
    var usedHeight = $scope.isItemEditMode || $scope.isItemAddMode ? 0 : omnibarActionsHeight;
    if (taskDescriptionHasFocus) {
      usedHeight += 160;
    } else {
      usedHeight += 290;
      if ($scope.task && $scope.task.transientProperties && $scope.task.transientProperties.date) {
        usedHeight += 44;
      }
    }

    if ($scope.currentHeight <= MAX_CONTAINER_HEIGHT) {
      var calculatedHeight = $scope.currentHeight - usedHeight - keyboardHeight;
      return (calculatedHeight < 44 ? 44 : calculatedHeight);
    } else {
      return MAX_CONTAINER_HEIGHT - usedHeight - keyboardHeight;
    }
  };

  $scope.getEditNoteContentMaxHeight = function() {
    var usedHeight = $scope.isItemEditMode || $scope.isItemAddMode ? 0 : omnibarActionsHeight;
    usedHeight += 112;  // reduce by this much to fit content into view
    if ($scope.currentHeight <= MAX_CONTAINER_HEIGHT) {
      var calculatedHeight = $scope.currentHeight - usedHeight - keyboardHeight;
      return (calculatedHeight < 44 ? 44 : calculatedHeight);
    } else {
      return MAX_CONTAINER_HEIGHT - usedHeight - keyboardHeight;
    }
  };

  $scope.getSearchPlaceholderMaxHeight = function() {
    var usedHeight = 44 + getOmnibarStaticContentHeight();
    if ($scope.currentHeight <= MAX_CONTAINER_HEIGHT) {
      return $scope.currentHeight - usedHeight - keyboardHeight;
    } else {
      return MAX_CONTAINER_HEIGHT - usedHeight - keyboardHeight;
    }
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

  var currentOmnibarTitleTextStyle;
  $scope.getOmnibarClass = function getOmnibarClass() {
    if ($scope.omnibarText.title && $scope.omnibarText.title.length > 10) {
      var omnibarWidth;
      if ($rootScope.currentWidth >= 568) {
        // Maximum width for column
        omnibarWidth = 470;
      } else {
        omnibarWidth = $rootScope.currentWidth - 98;
      }

      var fontSize = '21px';
      if (currentOmnibarTitleTextStyle === 'omnibar-input-very-long') {
        fontSize = '12px';
      } else if (currentOmnibarTitleTextStyle === 'omnibar-input-long') {
        fontSize = '15px';
      } else if (currentOmnibarTitleTextStyle === 'omnibar-input-medium') {
        fontSize = '18px';
      }

      var currentTextWidth = getTextWidth($scope.omnibarText.title, fontSize + ' sans-serif');
      if (currentOmnibarTitleTextStyle === 'omnibar-input-very-long' || (currentTextWidth / 2 + 25) > omnibarWidth) {
        if (currentOmnibarTitleTextStyle !== 'omnibar-input-very-long') {
          $rootScope.$broadcast('elastic:adjust');
          currentOmnibarTitleTextStyle = 'omnibar-input-very-long';
        }
      }
      else if (currentOmnibarTitleTextStyle === 'omnibar-input-long' || (currentTextWidth / 2 + 35) > omnibarWidth) {
        if (currentOmnibarTitleTextStyle !== 'omnibar-input-long') {
          $rootScope.$broadcast('elastic:adjust');
          currentOmnibarTitleTextStyle = 'omnibar-input-long';
        }
      } else if (currentOmnibarTitleTextStyle === 'omnibar-input-medium' || (currentTextWidth + 20) > omnibarWidth) {
        if (currentOmnibarTitleTextStyle !== 'omnibar-input-medium') {
          $rootScope.$broadcast('elastic:adjust');
          currentOmnibarTitleTextStyle = 'omnibar-input-medium';
        }
      } else {
        currentOmnibarTitleTextStyle = undefined;
      }
      return currentOmnibarTitleTextStyle;
    } else {
      currentOmnibarTitleTextStyle = undefined;
    }
  };

  // EDIT ITEM SCROLLER

  var editItemHasScrollerIndicators = false;
  var editItemScrollerActiveSlideIndex = 0;
  var gotoEditItemScrollerSlideFn;

  $scope.showEditItemScrollerIndicators = function showEditItemScrollerIndicators() {
    return editItemHasScrollerIndicators;
  };

  $scope.setEditItemHasScrollerIndicators = function setEditItemHasScrollerIndicators(hasIndicators) {
    editItemHasScrollerIndicators = hasIndicators;
  };

  $scope.isEditItemScrollerSlideActive = function isEditItemScrollerSlideActive(slideName) {
    return (slideName === 'left' && editItemScrollerActiveSlideIndex === 0) || (slideName === 'right' && editItemScrollerActiveSlideIndex === 1);
  };

  $scope.setActiveSlideIndex = function setActiveSlideIndex(slideIndex) {
    editItemScrollerActiveSlideIndex = slideIndex;
  };

  $scope.registerGotoEditItemScrollerSlideFn = function registerGotoEditItemScrollerSlideFn(gotoSlideFn) {
    gotoEditItemScrollerSlideFn = gotoSlideFn;
  };

  $scope.gotoEditItemScrollerSlide = function gotoEditItemScrollerSlide(slideName) {
    var slideIndex;
    if (slideName === 'left')
      slideIndex = 0;
    else if (slideName === 'right')
      slideIndex = 1;
    gotoEditItemScrollerSlideFn(slideIndex);
  };

  // EDIT ITEM

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
    if (event.keyCode === 27) {
      setOmnibarHiddenAndCloseOmnibarDrawer();
    } else if (event.keyCode === 13) {
      // Enter in omnibar saves, no line breaks allowed
      event.preventDefault();
      event.stopPropagation();
      $scope.saveOmnibarText();
    }
  };

  // SAVE ITEM

  $scope.saveOmnibarText = function saveOmnibarText() {

    function saveItem() {
      return omnibarFeatures[activeOmnibarFeature].itemSaveMethod($scope[activeOmnibarFeature], UISessionService.getActiveUUID());
    }

    function performTearDown() {
      if (!$scope.isItemEditMode && !$scope.isItemAddMode) {
        UISessionService.setToasterNotification(omnibarFeatures[activeOmnibarFeature].saveItemLocation);
      }
      if (!$scope.isItemEditMode || $scope.isItemAddMode) {
        if ($scope.getOnboardingPhase() === 'itemAdded' || $scope.getOnboardingPhase() === 'sortingStarted') {
          $scope.setOnboardingPhase('secondItemAdded');
        }
      }
      setOmnibarHiddenAndCloseOmnibarDrawer();
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
    if (omnibarVisible) setFocusOnOmnibarInput();
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

  // OPENING / CLOSING

  // TODO analytics visit omnibar
  $scope.openOmnibar = function openOmnibar(feature) {
    if (!$scope.onboardingInProgress) {
      setNativeScrollingDisabled(true);
      AnalyticsService.visit('omnibar');
      $scope.setOmnibarFeatureActive(feature);
      setOmnibarVisibileAndOpenOmnibarDrawer();
    }
  };

  // Reset item transient values, then clear and hide omnibar
  $scope.cancelOmnibarEdit = function cancelOmnibarEdit() {
    if ($scope.isItemEditMode || $scope.isItemAddMode) {
      var activeOmnibarFeature = $scope.getActiveOmnibarFeature();
      omnibarFeatures[activeOmnibarFeature].itemResetFunction($scope[activeOmnibarFeature], UISessionService.getActiveUUID());
    }
    setOmnibarHiddenAndCloseOmnibarDrawer();
  };

  $scope.clearOmnibarTitleText = function clearOmnibarTitleText() {
    $scope.omnibarText = {};
    currentOmnibarTitleTextStyle = undefined;
  };

  // For empty omnibar search placeholder
  $scope.hideEmptyOmnibar = function hideEmptyOmnibar() {
    setOmnibarHiddenAndCloseOmnibarDrawer();
  };

  function setOmnibarVisibileAndOpenOmnibarDrawer() {
    if (!omnibarVisible) {
      omnibarVisible = true;
      $scope.openOmnibarDrawer();
    }
  }

  function setOmnibarHiddenAndCloseOmnibarDrawer() {
    blurOmnibarInput();
    omnibarVisible = false;
    $scope.closeOmnibarDrawer();
  }

  function clearAndHideOmnibar() {
    if (omnibarVisible) {
      omnibarVisible = false;
    }
    $scope.clearOmnibarTitleText();
    $scope.isItemEditMode = false;
    $scope.isItemAddMode = false;
    $scope.omnibarKeywords.isVisible = false;
    selectedOmnibarKeywords = [];
    setNativeScrollingDisabled(false);
  }
}

OmnibarController['$inject'] = ['$q', '$rootScope', '$scope', '$timeout', 'AnalyticsService', 'ItemsService', 'NotesService', 'SnapService', 'TasksService', 'UISessionService'];
angular.module('em.main').controller('OmnibarController', OmnibarController);
