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

 function EditorController($rootScope, $scope, $timeout,
                           ConvertService, ItemsService, ListsService, NotesService, PlatformService,
                           SwiperService, TagsService, TasksService, UISessionService, URLService,
                           UserSessionService) {

  // OPENING, INITIALIZING, CLOSING

  var dataInEdit;
  var exitAppOnBack = false;
  var initializeEditorCallback;
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
    if (editorType === 'task'){
      $scope.task = dataInEdit;
      initializeEditorVisibilityAndPermission(dataInEdit);
    }else if (editorType === 'note'){
      $scope.note = dataInEdit;
      initializeEditorVisibilityAndPermission(dataInEdit);
      if (mode === 'advanced'){
        SwiperService.setInitialSlidePath('noteEditor', 'noteEditor/advanced');
      }
    }else if (editorType === 'list'){
      var list = dataInEdit.list || dataInEdit;
      $scope.list = list;
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
    if (angular.isFunction(initializeEditorCallback)) initializeEditorCallback();
  };

  $scope.registerInitializeEditorCallback = function(callback){
    initializeEditorCallback = callback;
  };
  $scope.unregisterInitializeEditorCallback = function(){
    initializeEditorCallback = undefined;
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
    var aboutToClosePromise;
    if (typeof featureEditorAboutToCloseCallback === 'function'){
      aboutToClosePromise = featureEditorAboutToCloseCallback(exitAppOnBack);
    }
    if (aboutToClosePromise){
      aboutToClosePromise.then(function(){
        evaluateExitApp();
      });
    }else{
      evaluateExitApp();
    }
  }

  // Callback from Snap.js, outside of AngularJS event loop
  function editorOpened() {

    if (featureEditorOpenedCallback) featureEditorOpenedCallback();

    var preventFocus;

    if ($scope.editorType === 'recurring' ||
        ($scope.mode !== 'new' &&  ($scope.editorType === 'task' || $scope.editorType === 'note')))
    {
      preventFocus = true;
    }

    if (!preventFocus && (!dataInEdit || !dataInEdit.deleted) &&
        typeof titleBarInputFocusCallbackFunction === 'function')
    {
      // Focus on found and not deleted item
      setFocusOnTitlebarInput();
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
    featureEditorAboutToCloseCallback = undefined;
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


  // SAVING

  $scope.isEdited = function(itemInEdit) {
    // Item without title is unedited
    if ($scope.titlebarHasText()) {
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
      message = 'can\'t convert list with content';
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
                                                                    UISessionService.getActiveUUID());
    }
    else if (dataInEdit.trans.itemType === 'list') {
      convertToNotePromise = ConvertService.finishListToNoteConvert(dataInEdit,
                                                                    UISessionService.getActiveUUID());
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
    }
    else if (dataInEdit.trans.itemType === 'note') {
      convertToTaskPromise = ConvertService.finishNoteToTaskConvert(dataInEdit,
                                                                    UISessionService.getActiveUUID());
    } else if (dataInEdit.trans.itemType === 'list') {
      convertToTaskPromise = ConvertService.finishListToTaskConvert(dataInEdit,
                                                                    UISessionService.getActiveUUID());
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
                                                                    UISessionService.getActiveUUID());
    }
    else if (dataInEdit.trans.itemType === 'note') {
      convertToListPromise = ConvertService.finishNoteToListConvert(dataInEdit,
                                                                    UISessionService.getActiveUUID());
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

  $scope.registerTitleBarInputCallbacks = function (focusCallback, blurCallback) {
    titleBarInputFocusCallbackFunction = focusCallback;
    titleBarInputBlurCallbackFunction = blurCallback;
  };

  function setFocusOnTitlebarInput() {
    if (typeof titleBarInputFocusCallbackFunction === 'function') titleBarInputFocusCallbackFunction();
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
      if (typeof callback === 'function') callback();
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
    if (typeof callback === 'function') callback();
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

  $scope.openRevisionPicker = function(){
    console.log("TODO: REVISION PICKER");
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
    }
    else if ($scope.listPickerOpen)
      return 'list';
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

  $scope.showEditorAction = function(actionName, item){
    switch (actionName){
      case 'saveBack':
      return !$scope.showEditorComponent('side-by-side-links') && !$scope.isPropertyInDedicatedEdit();
      case 'saveClose':
      return $scope.showEditorComponent('side-by-side-links') && !$scope.isPropertyInDedicatedEdit();
      case 'saveDone':
      return $scope.isPropertyInDedicatedEdit();
      case 'delete':
      return !item.trans.deleted && !$scope.isPropertyInDedicatedEdit();
      case 'restore':
      return item.trans.deleted && !$scope.isPropertyInDedicatedEdit();
      case 'convertToNote':
      return $scope.fullEditor && $scope.features.notes.getStatus() !== 'disabled' &&
             (!item.visibility || !item.visibility.published);
      case 'convertToList':
      return $scope.fullEditor && $scope.features.lists.getStatus('active') !== 'disabled' &&
             (!item.visibility || !item.visibility.published);
      case 'convertToTask':
      return $scope.fullEditor && (!item.visibility || !item.visibility.published);
    }
  };

  $scope.showEditorProperty = function(propertyName, item){
    switch (propertyName){
      case 'title':
      return !$scope.isPropertyInDedicatedEdit();
      case 'url':
      return !$scope.isOtherPropertyInEdit('url');
      case 'revisions':
      return item.revision !== undefined;
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

  $scope.isAutoSavingPrevented = function() {
    return $scope.editorType === 'recurring' || $scope.isOnboarding('notes');
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

EditorController['$inject'] = ['$rootScope', '$scope', '$timeout',
'ConvertService', 'ItemsService', 'ListsService', 'NotesService', 'PlatformService', 'SwiperService',
'TagsService', 'TasksService', 'UISessionService', 'URLService', 'UserSessionService'];
angular.module('em.main').controller('EditorController', EditorController);
