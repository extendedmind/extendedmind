/* Copyright 2013-2016 Extended Mind Technologies Oy
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

 /* global console */
 'use strict';

 function EditorController($rootScope, $scope, $timeout, $q,
                           BackendClientService, ConvertService, ItemsService, ListsService, NotesService,
                           PlatformService, SwiperService, TagsService, TasksService, UISessionService,
                           URLService, UserSessionService) {

  // OPENING, INITIALIZING, CLOSING

  var dataInEdit;
  var exitAppOnBack = false;
  var reinitializeEditorCallback;
  $scope.initializeEditor = function(editorType, data, mode){
    // Reset $scope variables. These may exist from previous editor.
    $scope.task = undefined;
    $scope.note = undefined;
    $scope.list = undefined;
    $scope.item = undefined;
    $scope.tag = undefined;
    $scope.iterableItems = undefined;
    dataInEdit = data;

    $scope.editorType = editorType;
    $scope.editorVisible = true;
    $scope.mode = mode;
    var overrideTitleFocus = false;
    if (editorType === 'task'){
      $scope.task = dataInEdit;
      if (mode == 'title') overrideTitleFocus = true;
      initializeEditorVisibilityAndPermission(dataInEdit);
    }else if (editorType === 'note'){
      $scope.note = dataInEdit;
      initializeEditorVisibilityAndPermission(dataInEdit);
      if (mode === 'advanced'){
        SwiperService.setInitialSlidePath('noteEditor', 'noteEditor/advanced');
      }else if (mode == 'expand'){
        $scope.toggleExpandEditor();
      }
    }else if (editorType === 'list'){
      var list = dataInEdit.list || dataInEdit;
      $scope.list = list;
      if (mode == 'title') overrideTitleFocus = true;
      initializeEditorVisibilityAndPermission(list);
    }else if (editorType === 'item'){
      $scope.item = dataInEdit;
      initializeEditorVisibilityAndPermission(dataInEdit);
      exitAppOnBack = mode === 'share';
    }else if (editorType === 'tag'){
      $scope.tag = dataInEdit;
    }else if (editorType === 'user'){
      $scope.user = dataInEdit || {};
    }else if (editorType === 'recurring') {
      $scope.iterableItems = dataInEdit;
      initializeEditorVisibilityAndPermission(dataInEdit[0]);
    }
    if (angular.isFunction(reinitializeEditorCallback)) reinitializeEditorCallback();

    // Handle editor opened straight away when there is no animation for editor opening
    if ($scope.columns === 3){
      handleEditorOpened(overrideTitleFocus);
    }
    if ($scope.columns === 3 || $scope.isEditorVisible()){
      // Broadcast an adjust that will hopefully fix title textarea not containing last words in mobile
      // when editor is already open, and also for larger screens when editor is opened
      window.requestAnimationFrame(function(){
        $scope.$broadcast('elastic:adjust');
      });
    }
    if (!$scope.$$phase && !$rootScope.$$phase) $scope.$digest();
  };

  // Re-initializing, this is fired only on the second go, as the above method is fired before
  // this can be called in child editors.
  $scope.registerReinitializeEditorCallback = function(callback){
    reinitializeEditorCallback = callback;
  };
  $scope.unregisterReinitializeEditorCallback = function(){
    reinitializeEditorCallback = undefined;
  };

  function initializeEditorVisibilityAndPermission(item) {

    function isCollectiveOwner(ownerUUID) {
      return $scope.collectives && $scope.collectives[ownerUUID];
    }

    function isSharedListOwner(ownerUUID) {
      return $scope.sharedLists && $scope.sharedLists[ownerUUID];
    }

    var ownerUUID = item.trans.owner;
    var userUUID = UserSessionService.getUserUUID();
    var activeUUID = UISessionService.getActiveUUID();

    if (ownerUUID === userUUID && ownerUUID === activeUUID) {
      $scope.fullEditor = true;
      $scope.readOnly = false;
    } else if (isCollectiveOwner(ownerUUID)) {
      $scope.fullEditor = ownerUUID === activeUUID;
      $scope.readOnly = $scope.isCollectiveReadOnly(ownerUUID);
    } else if (isSharedListOwner(ownerUUID)) {
      $scope.fullEditor = false;
      if (item.trans.itemType === 'list') {
        $scope.readOnly = true;
      }else{
        var listUUID;
        if (item.trans.list) {
          listUUID = item.trans.list.trans.uuid;
        }
        $scope.readOnly = listUUID && $scope.isSharedListReadOnly(ownerUUID, listUUID);
      }
    }
  }

  function evaluateExitApp(){
    if (exitAppOnBack){
      exitAppOnBack = false;
      if (navigator && navigator.Backbutton && navigator.Backbutton.goBack){
        navigator.Backbutton.goBack(undefined, function(){
          // Try to go home if there is no going back
          navigator.Backbutton.goHome(undefined, function(){
            // Just exit app, if can't go home either
            if (navigator.app && navigator.app.exitApp){
              navigator.app.exitApp();
            }
          });
        });
      }
    }
  }

  function editorAboutToClose() {
    var featureActionBeforeExitPromise;
    if (typeof featureEditorAboutToCloseCallback === 'function'){
      featureActionBeforeExitPromise = featureEditorAboutToCloseCallback(exitAppOnBack);
    }
    if (featureActionBeforeExitPromise){
      featureActionBeforeExitPromise.then(function(){
        evaluateExitApp();
      });
    }else{
      evaluateExitApp();
    }
  }

  function handleEditorOpened(overrideTitleFocus){
    if (featureEditorOpenedCallback) featureEditorOpenedCallback();
    var autoFocusTitle =
      overrideTitleFocus ||
      $scope.editorType === 'omnibar' ||
      ($scope.editorType === 'note' && (!$scope.note.uuid && !$scope.note.mod));
    if (autoFocusTitle && (!dataInEdit || !dataInEdit.deleted)){
      // Focus on title
      setFocusOnTitlebarInput();
    }
  }

  // Callback from Snap.js, outside of AngularJS event loop
  function editorOpened() {
    // Handle editor opened from here only when there is an animation for editor
    // opening, as there is for below three columns
    if ($scope.columns < 3){
      handleEditorOpened();
      // Broadcast an adjust, that will hopefully fix textarea problems for mobile devices,
      // initializeEditor broadcasts this for larger screens that don't have an animation,
      // and also in situations where there is a change of editor, say from omnibar to note
      $scope.$broadcast('elastic:adjust');
    }
  }

  // Callback from Snap.js, outside of AngularJS event loop
  function editorClosed() {
    // Don't manipulate list items in list before editor has been closed.
    UISessionService.resolveDeferredActions('edit');

    // NOTE: Call $apply here if these don't seem to be reseted
    $scope.editorType = undefined;
    $scope.mode = undefined;
    $scope.editorVisible = false;
    $scope.focusedTextProperty = undefined;
    titleBarInputFocusCallbackFunction = titleBarInputBlurCallbackFunction = undefined;
    titleBarFocusRequested = false;
    featureEditorAboutToCloseCallback = undefined;
    saveStatus = getDefaultSaveStatus();
    clearAutoSaveTimers();
  }

  if (angular.isFunction($scope.registerEditorAboutToOpenCallback))
    $scope.registerEditorAboutToOpenCallback($scope.initializeEditor, 'EditorController');

  if (angular.isFunction($scope.registerEditorAboutToCloseCallback))
    $scope.registerEditorAboutToCloseCallback(editorAboutToClose, 'EditorController');

  if (angular.isFunction($scope.registerEditorClosedCallback))
    $scope.registerEditorClosedCallback(editorClosed, 'EditorController');

  if (angular.isFunction($scope.registerEditorOpenedCallback))
    $scope.registerEditorOpenedCallback(editorOpened, 'EditorController');

  $scope.$on('$destroy', function() {
    if (angular.isFunction($scope.unregisterEditorAboutToOpenCallback))
      $scope.unregisterEditorAboutToOpenCallback('EditorController');

    if (angular.isFunction($scope.unregisterEditorAboutToCloseCallback))
      $scope.unregisterEditorAboutToCloseCallback('EditorController');

    if (angular.isFunction($scope.unregisterEditorOpenedCallback))
      $scope.unregisterEditorOpenedCallback('EditorController');

    if (angular.isFunction($scope.unregisterEditorClosedCallback))
      $scope.unregisterEditorClosedCallback('EditorController');

    if (angular.isFunction($scope.unregisterBackCallback))
      $scope.unregisterBackCallback('EditorController');
  });

  $scope.closeEditor = function(){
    if ($scope.mode === 'search' || $scope.mode === 'keywordEdit'){
      $scope.editorType = 'omnibar';
      $scope.mode = undefined;
      $scope.closeEditorDrawer(true);
    }else{
      $scope.closeEditorDrawer();
    }
  };

  $scope.processClose = $scope.closeEditor;

  function editorHasSwiper(){
    return ($scope.editorType === 'task' || $scope.editorType === 'note' || $scope.editorType === 'list');
  }

  function getEditorSwiperId(){
    return $scope.editorType + 'Editor';
  }

  // HELPER METHODS

  var featureEditorAboutToCloseCallback, featureEditorOpenedCallback;
  $scope.registerFeatureEditorAboutToCloseCallback = function(callback) {
    featureEditorAboutToCloseCallback = callback;
  };
  $scope.unregisterEditorAboutToCloseCallback = function() {
    featureEditorAboutToCloseCallback = undefined;
  };
  $scope.registerFeatureEditorOpenedCallback = function(callback) {
    featureEditorOpenedCallback = callback;
  };

  $scope.deferEdit = function(){
    return UISessionService.deferAction('edit', $rootScope.EDITOR_CLOSED_FAILSAFE_TIME);
  };

  function generateItemDeletedDelayedNotification(item, undeleteFn) {
    UISessionService.pushDelayedNotification({
      type: 'deleted',
      itemType: item.trans.itemType,
      item: item,
      undoFn: undeleteFn
    });

    $timeout(function() {
      UISessionService.activateDelayedNotifications();
    }, $rootScope.LIST_ITEM_LEAVE_ANIMATION_SPEED);
  }

  // DELETING

  $scope.processDelete = function(dataInEdit, deleteCallback, undeleteFn) {

    function doProcessDelete(dataInEdit, deleteCallback, undeleteFn) {
      $scope.closeEditor();
      $scope.deferEdit().then(function() {
        UISessionService.allow('leaveAnimation', 200, dataInEdit.trans.uuid);
        var deletePromise = deleteCallback(dataInEdit);
        if (deletePromise) {
          deletePromise.then(function() {
            generateItemDeletedDelayedNotification(dataInEdit, undeleteFn);
          });
        } else {
          generateItemDeletedDelayedNotification(dataInEdit, undeleteFn);
        }
      });
    }

    if ($scope.readOnly) {
      UISessionService.pushNotification({
        type: 'fyi',
        text: 'can\'t delete shared ' + dataInEdit.trans.itemType
      });
    } else {
      if ($scope.exitAppOnBack){
        var deletePromise = deleteCallback(dataInEdit);
        $scope.closeEditor();
        if (deletePromise) {
          deletePromise.then(function() {
            evaluateExitApp();
          }, function(error){
            console.error('error deleting item:');
            console.error(error);
            evaluateExitApp();
          });
        } else {
          evaluateExitApp();
        }
      }else{
        doProcessDelete(dataInEdit, deleteCallback, undeleteFn);
      }
    }
  };

  // CONVERTING

  function handleConvertError(error) {
    var message;
    if (error.type === 'parent') {
      message = 'can\'t convert list that has child items';
    } else if (error.type === 'reminders') {
      message = 'can\'t convert task with reminders';
    }
    UISessionService.pushNotification({
      type: 'fyi',
      text: message
    });
  }

  $scope.convertToNote = function(dataInEdit){
    if (!$scope.titlebarHasText()) return;
    var convertToNotePromise;
    if (dataInEdit.trans.itemType === 'item') {
      convertToNotePromise = ItemsService.itemToNote(dataInEdit);
    }
    else if (dataInEdit.trans.itemType === 'task') {
      convertToNotePromise = ConvertService.finishTaskToNoteConvert(dataInEdit,
                                                                    dataInEdit.trans.owner);
    }
    else if (dataInEdit.trans.itemType === 'list') {
      convertToNotePromise = ConvertService.finishListToNoteConvert(dataInEdit,
                                                                    dataInEdit.trans.owner);
    }

    if (convertToNotePromise){
      convertToNotePromise.then(function(note){
        $scope.initializeEditor('note', note, 'convert');
      }, handleConvertError);
    }
  };

  $scope.convertToTask = function(dataInEdit){
    if (!$scope.titlebarHasText()) return;
    var convertToTaskPromise;
    if (dataInEdit.trans.itemType === 'item') {
      convertToTaskPromise = ItemsService.itemToTask(dataInEdit);
    } else if (dataInEdit.trans.itemType === 'note') {
      convertToTaskPromise = ConvertService.finishNoteToTaskConvert(dataInEdit,
                                                                    dataInEdit.trans.owner);
    } else if (dataInEdit.trans.itemType === 'list') {
      convertToTaskPromise = ConvertService.finishListToTaskConvert(dataInEdit,
                                                                    dataInEdit.trans.owner);
    }
    if (convertToTaskPromise){
      convertToTaskPromise.then(function(task){
        $scope.initializeEditor('task', task, 'convert');
      }, handleConvertError);
    }
  };

  $scope.convertToList = function(dataInEdit){
    if (!$scope.titlebarHasText()) return;
    var convertToListPromise;
    if (dataInEdit.trans.itemType === 'item'){
      convertToListPromise = ItemsService.itemToList(dataInEdit);
    }
    else if (dataInEdit.trans.itemType === 'task') {
      convertToListPromise = ConvertService.finishTaskToListConvert(dataInEdit,
                                                                    dataInEdit.trans.owner);
    }
    else if (dataInEdit.trans.itemType === 'note') {
      convertToListPromise = ConvertService.finishNoteToListConvert(dataInEdit,
                                                                    dataInEdit.trans.owner);
    }
    if (convertToListPromise){
      convertToListPromise.then(function(list){
        $scope.initializeEditor('list', list, 'convert');
      }, handleConvertError);
    }
  };

  // TITLEBAR

  var titleBarInputFocusCallbackFunction;
  var titleBarInputBlurCallbackFunction;
  var titleBarFocusRequested = false;

  $scope.registerTitleBarInputCallbacks = function (focusCallback, blurCallback) {
    titleBarInputFocusCallbackFunction = focusCallback;
    titleBarInputBlurCallbackFunction = blurCallback;
    if (titleBarFocusRequested) setFocusOnTitlebarInput();
  };

  function setFocusOnTitlebarInput() {
    if (typeof titleBarInputFocusCallbackFunction === 'function'){
      titleBarInputFocusCallbackFunction();
      titleBarFocusRequested = false;
    }
    else{
      titleBarFocusRequested = true;
    }
  }
  function blurTitlebarInput() {
    if (typeof titleBarInputBlurCallbackFunction === 'function') titleBarInputBlurCallbackFunction();
  }

  $scope.handleBasicTitlebarKeydown = function(keydownEvent/*, item*/){
    // Escape
    if (keydownEvent.keyCode === 27){
      blurTitlebarInput();
    }
  };

  $scope.handleTitlebarEnterAction = function(callback) {
    $scope.closeEditor();
    if (typeof callback === 'function') callback();
  };

  $scope.calculateTitleWidth = function() {
    if ($rootScope.columns === 1){
      if ($rootScope.currentWidth >= $rootScope.EDITOR_MAX_WIDTH) {
        // Maximum width for column
        return $rootScope.TITLEBAR_HEADING_MAX_WIDTH;
      } else {
        // Smaller, leave
        return $rootScope.currentWidth - $rootScope.TITLEBAR_BUTTON_WIDTH*2;
      }
    }else{
      var compareWidth;
      if ($scope.isMenuVisible()){
        // Menu also open at the same time, very limited space
        compareWidth = $rootScope.currentWidth >
          ($rootScope.EDITOR_MAX_WIDTH + $rootScope.CONTAINER_MASTER_MAX_WIDTH + $rootScope.MENU_WIDTH) ?
          $rootScope.EDITOR_MAX_WIDTH : (($rootScope.currentWidth - $rootScope.MENU_WIDTH) / 2);
        return compareWidth - ($rootScope.TITLEBAR_BUTTON_WIDTH_SIDE_BY_SIDE * 2);
      }else{
        // Three column mode, but menu not open
        compareWidth = $rootScope.currentWidth >
          ($rootScope.EDITOR_MAX_WIDTH + $rootScope.CONTAINER_MASTER_MAX_WIDTH) ?
          $rootScope.EDITOR_MAX_WIDTH : ($rootScope.currentWidth / 2);
        return compareWidth -
               ($rootScope.TITLEBAR_BUTTON_WIDTH_SIDE_BY_SIDE * 2);
      }
    }
  };

  $scope.titlebarHasText = function() {
    var itemType = $scope.editorType === 'recurring' ? $scope.mode : $scope.editorType;
    switch (itemType){
      case 'task':
      return $scope.task.trans.title && $scope.task.trans.title.length !== 0;
      case 'note':
      return $scope.note.trans.title && $scope.note.trans.title.length !== 0;
      case 'list':
      return $scope.list.trans.title && $scope.list.trans.title.length !== 0;
      case 'item':
      return $scope.item.trans.title && $scope.item.trans.title.length !== 0;
      case 'tag':
      return $scope.tag.trans.title && $scope.tag.trans.title.length !== 0;
    }
  };

  // NAVIGATION

  $scope.isFirstSlide = function(swiper){
    return SwiperService.isSlideActive(swiper + '/basic');
  };

  $scope.swipeToAdvanced = function(swiper) {
    SwiperService.swipeTo(swiper + '/advanced');
  };

  $scope.swipeToBasic = function(swiper) {
    SwiperService.swipeTo(swiper + '/basic');
  };

  $scope.editorSwiperSlideChanged = function(){
    // Need to digest on slide change to get changes to header to bite
    if (!$rootScope.$$phase && !$scope.$$phase)
      $scope.$digest();
  };

  $scope.getEditorNavigationBackClasses = function(){
    if (($scope.mode === 'search') ||
        (editorHasSwiper() && !$scope.isFirstSlide(getEditorSwiperId())) ||
        ($scope.mode === 'keywordEdit' && $scope.editorType == 'tag'))
    {
      return 'not-swipeable';
    }
  };

  // URL EDIT FIELD

  var focusUrlInput;
  var blurUrlInput;
  $scope.registerUrlInputCallbacks = function(focus, blur){
    focusUrlInput = focus;
    blurUrlInput = blur;
  };

  $scope.setUrlFocus = function(){
    $scope.setTextPropertyFocus('url', true);
    if (focusUrlInput) focusUrlInput();
  };

  $scope.urlTextKeyDown = function(keydownEvent){
    // Escape or return, blur
    if (keydownEvent.keyCode === 27 || keydownEvent.keyCode === 13){
      blurUrlInput();
      event.preventDefault();
      event.stopPropagation();
    }
  };

  $scope.clickUrl = function(url, skipValidation){
    if (PlatformService.isSupported('openLinkExternal') && url &&
        (skipValidation || URLService.isValidUrl(url))){
      PlatformService.doAction('openLinkExternal', url);
    }
  };

  $scope.getUrlHref = function(url, skipValidation){
    if (!PlatformService.isSupported('openLinkExternal') && url &&
        (skipValidation || URLService.isValidUrl(url))){
      return url;
    }
  };
  $scope.getVisibleUrl = URLService.getVisibleUrl;

  // LIST PICKER WIDGET

  $scope.openListPicker = function() {
    if ($scope.fullEditor && !$scope.readOnly) {
      $scope.listPickerOpen = true;
    } else {
      // NOTE: Setting parent is disabled in !$scope.fullEditor as well!
      $scope.generateReadOnlyPropertyClickNotification(dataInEdit.trans.itemType);
    }
  };
  $scope.closeListPicker = function() {
    $scope.listPickerOpen = false;
  };

  $scope.closeListPickerAndSetListToItem = function(item, list, callback) {

    function doCloseAndSave() {
      $scope.closeListPicker();
      item.trans.list = list;
      if (typeof callback === 'function') callback(item, list);
    }

    if (!list.trans.uuid) {// List is new, save it first. Close list picker on error saving new list.
      $scope.saveList(list).then(doCloseAndSave, $scope.closeListPicker);
    }
    else {
      doCloseAndSave();
    }
  };

  $scope.closeListPickerAndClearListFromItem = function(item, list, callback) {
    $scope.closeListPicker();
    if (item.trans.list === list){
      item.trans.list = undefined;
    }
    if (typeof callback === 'function') callback(item, list);
  };

  var editorFooterCloseCallback;
  $scope.registerEditorFooterCloseCallback = function(callback) {
    editorFooterCloseCallback = callback;
  };

  $scope.setTitleBarFocus = function() {
    if ($rootScope.columns !== 3 && typeof editorFooterCloseCallback === 'function')
      editorFooterCloseCallback();
  };

  // REVISION PICKER WIDGET

  $scope.openRevisionPicker = function(itemInEdit){
    $scope.getItemRevisions(itemInEdit).then(function(response){
      itemInEdit.trans.revisions = response.revisions.sort(
        function(a,b) {
          return (b.number > a.number) ? 1 : ((a.number > b.number) ? -1 : 0);
        });
      $scope.revisionPickerOpen = true;
    });
  };

  $scope.closeRevisionPicker = function() {
    $scope.revisionPickerOpen = false;
  };

  $scope.closeRevisionPickerAndActivateRevision = function(item, revisionInfo) {
    // First check that not attempting to convert a non-convertable item
    if (item.trans.itemType !== revisionInfo.itemType && !isConvertable(item)){
      UISessionService.pushNotification({
        type: 'fyi',
        text: 'this ' + item.trans.itemType + ' can\'t be converted to ' + revisionInfo.itemType
      });
      return;
    }

    return $scope.getItemRevision(item, revisionInfo.number).then(function(response){
      $scope.revisionPickerOpen = false;
      var revisionItem;
      if (response.note){
        revisionItem = response.note;
        revisionItem.trans = {itemType: 'note', owner: item.trans.owner};
        if (item.favorited) revisionItem.favorited = item.favorited;
      }else if (response.task){
        revisionItem = response.task;
        revisionItem.trans = {itemType: 'task', owner: item.trans.owner};
        if (item.completed) revisionItem.completed = item.completed;
        if (item.reminders) revisionItem.reminders = item.reminders;
      }else if (response.list){
        revisionItem = response.list;
        revisionItem.trans = {itemType: 'list', owner: item.trans.owner};
      }
      revisionItem.uuid = item.uuid;
      revisionItem.created = item.created;
      revisionItem.modified = item.modified;
      if (item.archived) revisionItem.archived = item.archived;
      if (item.deleted) revisionItem.deleted = item.deleted;
      if (item.creator) revisionItem.creator = item.creator;
      if (item.visibility) revisionItem.visibility = item.visibility;

      // Assigner and origin are not part of the revision
      if (item.relationships){
        if (item.relationships.assigner || item.relationships.origin){
          if (!revisionItem.relationships) revisionItem.relationships = {};
          if (item.relationships.assigner) revisionItem.relationships.assigner = item.relationships.assigner;
          if (item.relationships.origin) revisionItem.relationships.origin = item.relationships.origin;
        }
      }
      return revisionItem;
    });
  };

  // TEXT PROPERTIES (i.e. description, url and content)

  $scope.setTextPropertyFocus = function(name, hasFocus, item){
    if (!$scope.readOnly) {
      if (hasFocus) {
        $scope.focusedTextProperty = name;
      } else {
        if (document.hasFocus()) {
          // Only perform blur made inside the document.
          $scope.focusedTextProperty = undefined;
          if (name === 'url' && item){
            if (item.trans.link && item.trans.link.length){
              item.trans.link = item.trans.link.trim();
              if (item.trans.link.indexOf('://') === -1 && item.trans.link.indexOf('.') !== -1 &&
                  item.trans.link.indexOf(' ') === -1){
                // There is a period and no blank space, make an educated guess to add 'http://'
                item.trans.link = 'http://' + item.trans.link;
              }
            }
          }
        }
      }
      if (editorHasSwiper()) SwiperService.setOnlyExternal(getEditorSwiperId(), hasFocus);
      // Need to digest ot be sure that url/description/content unfocus bites right away
      if (!$rootScope.$$phase && !$scope.$$phase){
        $scope.$digest();
      }
    }
  };

  $scope.hasSwipeToClose = function(editorItemType) {
    if ($scope.editorType === 'recurring' && $scope.mode !== editorItemType) {
      // Prevent swipe to close in recurring editor with wrong mode.
      return false;
    }
    return true;
  };

  // Only one subeditor can be open at a time
  var subEditorDoneCallbackData;
  $scope.registerSubEditorDoneCallback = function(callback, parameters) {
    subEditorDoneCallbackData = {
      fn: callback,
      parameters: parameters
    };
  };
  $scope.unregisterSubEditorDoneCallback = function() {
    subEditorDoneCallbackData = undefined;
  };
  $scope.subEditorDone = function() {
    if (subEditorDoneCallbackData && typeof subEditorDoneCallbackData.fn === 'function') {
      subEditorDoneCallbackData.fn.apply(undefined, subEditorDoneCallbackData.parameters);
    }
  };

  var hasSubEditorEditedCallbackData;
  $scope.registerHasSubEditorEditedCallback = function(callback, parameters) {
    hasSubEditorEditedCallbackData = {
      fn: callback,
      parameters: parameters
    };
  };
  $scope.unregisterHasSubEditorEditedCallback = function() {
    hasSubEditorEditedCallbackData = undefined;
  };
  $scope.hasSubEditorEdited = function() {
    if (hasSubEditorEditedCallbackData && typeof hasSubEditorEditedCallbackData.fn === 'function') {
      return hasSubEditorEditedCallbackData.fn.apply(undefined, hasSubEditorEditedCallbackData.parameters);
    }
  };

  var isSubEditorOpenCondition;
  $scope.registerIsSubEditorOpenCondition = function(condition){
    isSubEditorOpenCondition = condition;
  };
  $scope.isSubEditorOpen = function(){
    if (angular.isFunction(isSubEditorOpenCondition)) return isSubEditorOpenCondition();
  };

  /* Returns true when either subeditor is open or a text property is in a full screen edit mode. */
  $scope.isPropertyInDedicatedEdit = function(){
    if ($rootScope.columns === 3){
      // Desktop, text properties are not in full screen edit mode
      return $scope.isSubEditorOpen();
    }else{
      return $scope.focusedTextProperty !== undefined || $scope.isSubEditorOpen();
    }
  };

  $scope.isOtherPropertyInEdit = function(exceptionTextProperty){
    if ($scope.focusedTextProperty === exceptionTextProperty){
      return false;
    }else{
      return $scope.isPropertyInDedicatedEdit();
    }
  };

  $scope.getPropertyNameInEdit = function() {
    if ($scope.focusedTextProperty){
      if ($scope.focusedTextProperty === 'description'){
        return 'descrip' + ($rootScope.columns === 1 ? '-\n' : '') + 'tion';
      }else{
        return $scope.focusedTextProperty;
      }
    }else if ($scope.listPickerOpen){
      return 'list';
    }else if ($scope.revisionPickerOpen){
      return 'revision';
    }
  };

  $scope.isPropertyEdited = function(textPropertyEditedFn) {
    if ($scope.focusedTextProperty !== undefined){
      if (angular.isFunction(textPropertyEditedFn)) return textPropertyEditedFn();
    }else{
      return $scope.hasSubEditorEdited();
    }
  };

  // COMMON EDITOR VISIBILITY

  $scope.showEditorComponent = function(componentName, item){
    switch (componentName){
      case 'label':
      return $scope.isPropertyInDedicatedEdit();
      case 'titlebarTitle':
      return (editorHasSwiper() && !$scope.isFirstSlide(getEditorSwiperId())) ||
        $scope.isPropertyInDedicatedEdit();
      case 'editorType':
      return $scope.showEditorType;
      case 'urlLink':
      return item.trans.link && $scope.focusedTextProperty !== 'url';
      case 'urlTextArea':
      return !item.trans.link || $scope.focusedTextProperty === 'url';
      case 'urlLinkError':
      return $scope.focusedTextProperty !== 'url' && item.trans.link &&
             !URLService.isValidUrl(item.trans.link);
      case 'side-by-side-links':
      return $rootScope.columns === 3 && !$scope.isSubEditorOpen();
    }
  };

  function isConvertable(item){
    return ((!item.visibility || !item.visibility.published) &&
           !(item.content && item.content.length > 1024));
  }

  $scope.showEditorAction = function(actionName, item){
    switch (actionName){
      case 'saveBack':
      return ($scope.isOnboarding('notes') && $rootScope.columns !== 3) ||
             (!$scope.showEditorComponent('side-by-side-links') && !$scope.isPropertyInDedicatedEdit());
      case 'saveClose':
      return $scope.showEditorComponent('side-by-side-links') && !$scope.isPropertyInDedicatedEdit();
      case 'saveDone':
      return !($scope.isOnboarding('notes') && $rootScope.columns !== 3) &&
               $scope.isPropertyInDedicatedEdit();
      case 'delete':
      return !item.trans.deleted && !$scope.isPropertyInDedicatedEdit();
      case 'restore':
      return item.trans.deleted && !$scope.isPropertyInDedicatedEdit();
      case 'convertToNote':
      return $scope.fullEditor && $scope.features.notes.getStatus() !== 'disabled' &&
             (!item.visibility || !item.visibility.published);
      case 'convertToList':
      return $scope.fullEditor && $scope.features.lists.getStatus('active') !== 'disabled' &&
             isConvertable(item);
      case 'convertToTask':
      return $scope.fullEditor && isConvertable(item);
    }
  };

  $scope.showEditorProperty = function(propertyName, item){
    switch (propertyName){
      case 'title':
      return !$scope.isPropertyInDedicatedEdit();
      case 'url':
      return !$scope.isOtherPropertyInEdit('url');
      case 'revisions':
      return item.revision !== undefined && !$scope.isPropertyInDedicatedEdit();
      case 'description':
      return !$scope.isOtherPropertyInEdit('description');
      case 'created':
      return !$scope.isPropertyInDedicatedEdit() && item.trans.created;
      case 'modified':
      return !$scope.isPropertyInDedicatedEdit() && item.trans.modified &&
             (item.trans.created !== item.trans.modified);
      case 'deleted':
      return !$scope.isPropertyInDedicatedEdit() && item.trans.deleted;
      case 'archived':
      return !$scope.isPropertyInDedicatedEdit() && item.trans.archived;
    }
  };

  $scope.showEditorSubEditor = function(subEditorName){
    switch (subEditorName){
      case 'list':
      return $scope.listPickerOpen;
      case 'revision':
      return $scope.revisionPickerOpen;
    }
  };

  $scope.generateReadOnlyPropertyClickNotification = function(/*itemType*/) {
    UISessionService.pushNotification({
      type: 'fyi',
      text: 'no permission to edit'
    });
  };

  $scope.containerClick = function(disabledElement, itemType) {
    if ($scope.readOnly && disabledElement) $scope.generateReadOnlyPropertyClickNotification(itemType);
  };

  // EXPANDING TEXTAREA HANDLING

  var scrollDownIfCaretBelowScreen;
  $scope.registerScrollDownIfAtBottomCallback = function(callback){
    scrollDownIfCaretBelowScreen = callback;
  };

  $scope.doScrollToBottomOnTextareaResize = function(overrideThreeColumenFooterHeight){
    if ($scope.focusedTextProperty){
      // When using three column mode, scrolling is enabled on the larger container
      if ($rootScope.columns === 3){
        return {scrollAmount: 26,
                footerHeight:
                  (overrideThreeColumenFooterHeight ?
                   overrideThreeColumenFooterHeight : $rootScope.getEditorFooterHeight())};
      } else{
        // On less than three, scrolling is in the textarea, which is identified with the ignoreSnap id
        return {id: 'ignoreSnap', scrollAmount: 22, footerHeight: 0};
      }
    }
  };

  $scope.mainTextPropertyKeyDown = function(keydownEvent){
    if (scrollDownIfCaretBelowScreen && keydownEvent.keyCode >= 37 && keydownEvent.keyCode <= 40){
      scrollDownIfCaretBelowScreen(keydownEvent.target);
    }
  };

  // KEYWORDS

  $scope.getKeywordFirstPart = function(keyword){
    return '#' + (keyword.trans.parent ? keyword.trans.parent.trans.title : keyword.trans.title);
  };

  $scope.hasKeywordSecondPart = function(keyword){
    return keyword.trans.parent !== undefined;
  };

  $scope.getKeywordSecondPart = function(keyword){
    return keyword.trans.title;
  };


  // AUTOSAVING

  var setSavedTimer, resetStatusTimer, savingSetTime, savingTransString;
  var saveStatus = getDefaultSaveStatus();
  var savingInProgress, recursiveCallInProgress;
  var saveReadyDeferred;

  function getDefaultSaveStatus(){
    return $scope.showEditorComponent('side-by-side-links') ? 'close' : 'back';
  }

  function saveItem(item, successCallback, failureCallback){
    var itemType = item.trans.itemType;
    switch (itemType){
      case 'task':
      $scope.saveTask(item).then(successCallback, failureCallback);
      break;
      case 'note':
      $scope.saveNote(item).then(successCallback, failureCallback);
      break;
      case 'list':
      $scope.saveList(item).then(successCallback, failureCallback);
      break;
      case 'item':
      $scope.saveItem(item).then(successCallback, failureCallback);
      break;
      case 'tag':
      $scope.saveTag(item).then(successCallback, failureCallback);
      break;
    }
  }

  $scope.saveItemInEdit = function(itemInEdit) {

    // SUCCESS SAVE PROCESS

    function doSetSaved() {
      saveStatus = 'saved';
      resetStatusTimer = $timeout(function() {
        saveStatus = getDefaultSaveStatus();
      }, 1000);
    }

    function doSetFailed() {
      saveStatus = 'failed';
      resetStatusTimer = $timeout(function() {
        saveStatus = getDefaultSaveStatus();
      }, 1000);
    }

    function saveSuccess(result){
      // Do this only when actually saving something
      if (result !== 'unmodified'){

        saveReadyDeferred = $q.defer();
        (function loop(){
          setTimeout(function(){
            if (!saveReadyDeferred){
              return;
            }else if (!BackendClientService.isProcessing()) {
              saveReadyDeferred.resolve();
              return;
            }
            loop();
          }, 100);
        })();
        saveReadyDeferred.promise.then(function(){
          // Previous save is ready now. We might get another save right after this one if there
          // are other changes, so always set a timeout. Recursively call this function once to also saved
          // changes after this.
          doSetSaved();
          savingInProgress = false;
          saveReadyDeferred = undefined;
          if (!recursiveCallInProgress){
            recursiveCallInProgress = true;
            $scope.saveItemInEdit(itemInEdit);
          }else{
            recursiveCallInProgress = false;
          }
        }, function(){
          // Rejected because editor for another item was opened
          savingInProgress = false;
          recursiveCallInProgress = false;
          saveReadyDeferred = undefined;
          // Save the previous item again without any save status changes, so that no changes are
          // left unsaved
          saveItem(itemInEdit);
        });
      }else{
        savingInProgress = false;
        recursiveCallInProgress = false;
      }
    }

    // FAILED SAVE PROCESS

    function saveFailure(error){
      savingInProgress = false;
      recursiveCallInProgress = false;
      if (error.type === 'offline') doSetSaved();
      else doSetFailed();
    }

    if (!savingInProgress) {
      savingInProgress = true;
      saveItem(itemInEdit, saveSuccess, saveFailure);
    }
  };

  // Create a debounced auto save function from save function
  $scope.autoSave = function(itemInEdit){
    if ($scope.isEdited(itemInEdit) &&
        (!savingTransString || savingTransString !== JSON.stringify(itemInEdit.trans))){
      // Saving something new
      clearAutoSaveTimers();
      savingTransString = JSON.stringify(itemInEdit.trans);
      savingSetTime = Date.now();
      if (saveStatus !== 'saving'){
        saveStatus = 'saving';
        if (!$scope.$$phase && !$rootScope.$$phase) $scope.$digest();
      }
      // Autosave after two seconds since last autosave
      var sinceSavingSet = (Date.now() - savingSetTime);
      var setSavedTimeout = sinceSavingSet > 1900 ? 100 : 100 + (1900 - sinceSavingSet);

      setSavedTimer = $timeout(
        function(){
          $scope.saveItemInEdit(itemInEdit);
        }, setSavedTimeout);
    }
  }.debounce(100);

  $scope.resetSaveStatus = function(){
    saveStatus = getDefaultSaveStatus();
    clearAutoSaveTimers();
    if (saveReadyDeferred){
      saveReadyDeferred.reject();
    }
  };

  function clearAutoSaveTimers() {
    if (setSavedTimer) {
      $timeout.cancel(setSavedTimer);
      setSavedTimer = undefined;
    }
    if (resetStatusTimer) {
      $timeout.cancel(resetStatusTimer);
      resetStatusTimer = undefined;
    }
  }

  $scope.isAutoSavingPrevented = function() {
    return $scope.editorType === 'recurring' || $scope.isOnboarding('notes');
  };

  $scope.getSaveStatusText = function(itemInEdit){
    var backCloseText = $scope.showEditorAction('saveBack') ? 'back' : 'close';
    return $scope.isAutoSavingPrevented() ?
      ($scope.isEdited(itemInEdit) && !itemInEdit.trans.deleted ? 'save' : backCloseText) :
      saveStatus;
  };

  $scope.isEdited = function(itemInEdit) {
    // Item without title is unedited
    if (itemInEdit.trans.title && itemInEdit.trans.title.length) {
      var itemType = $scope.editorType === 'recurring' ? $scope.mode : $scope.editorType;
      switch (itemType){
        case 'task':
        return TasksService.isTaskEdited(itemInEdit);
        case 'note':
        return NotesService.isNoteEdited(itemInEdit);
        case 'list':
        return ListsService.isListEdited(itemInEdit);
        case 'item':
        return ItemsService.isItemEdited(itemInEdit);
        case 'tag':
        return TagsService.isTagEdited(itemInEdit);
      }
    }
  };

  // PLATFORM SPECIFIC HACKS

  $scope.useNoSwiperEditorHeightOverride =  function(){
    return PlatformService.isSupported('noSwiperHeightOverride');
  };

  $scope.getNoSwiperEditorHeightOverride =  function(){
    if ($rootScope.softKeyboard && $rootScope.softKeyboard.height){
      return $rootScope.currentHeight - ($rootScope.EDITOR_HEADER_HEIGHT + $rootScope.softKeyboard.height);
    }
  };

  // KEYBOARD SHORTCUTS

  if (angular.isFunction($scope.registerKeyboardShortcutCallback)){
    $scope.registerKeyboardShortcutCallback(function(){
      if ($scope.isSubEditorOpen()){
        $scope.subEditorDone();
      }else if (!$scope.focusedTextProperty){
        $scope.closeEditor();
      }
    }, 'esc', 'EditorControllerEsc');
  }

  // BACK HANDLER

  function onBackButton(){
    if ($scope.isSubEditorOpen()){
      $scope.subEditorDone();
    }else{
      $scope.closeEditor();
    }
    if (!$rootScope.$$phase && !$scope.$$phase){
      $scope.$digest();
    }
    return true;
  }
  if (angular.isFunction($scope.registerBackCallback))
    $scope.registerBackCallback(onBackButton, 'EditorController');

  // OMNIBAR

  $scope.isOmnibarEditorLoaded = function(){
    return $scope.editorType === 'omnibar' || $scope.mode === 'search' || $scope.mode === 'keywordEdit';
  };

}

EditorController['$inject'] = ['$rootScope', '$scope', '$timeout', '$q',
'BackendClientService', 'ConvertService', 'ItemsService', 'ListsService', 'NotesService', 'PlatformService',
'SwiperService', 'TagsService', 'TasksService', 'UISessionService', 'URLService', 'UserSessionService'];
angular.module('em.main').controller('EditorController', EditorController);
