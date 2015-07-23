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

 function EditorController($rootScope, $scope, $timeout,
                           ConvertService, ItemsService, SwiperService, UISessionService,
                           UserSessionService, packaging) {

  // OPENING, INITIALIZING, CLOSING

  var dataInEdit;
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
    }else if (editorType === 'list'){
      var list = dataInEdit.list || dataInEdit;
      $scope.list = list;
      initializeEditorVisibilityAndPermission(list);
    }else if (editorType === 'item'){
      $scope.item = dataInEdit;
      initializeEditorVisibilityAndPermission(dataInEdit);
    }else if (editorType === 'tag'){
      $scope.tag = dataInEdit;
    }else if (editorType === 'user'){
      $scope.user = dataInEdit || {};
    }else if (editorType === 'recurring') {
      $scope.iterableItems = dataInEdit;
      initializeEditorVisibilityAndPermission(dataInEdit[0]);
    }
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
    if ($scope.exitAppOnBack === true){
      $scope.exitAppOnBack = false;
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
      aboutToClosePromise = featureEditorAboutToCloseCallback($scope.exitAppOnBack);
    }
    if (aboutToClosePromise){
      aboutToClosePromise.then(function(){
        evaluateExitApp();
      })
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

  // DELETING
  $scope.processDelete = function(dataInEdit, deleteCallback, undeleteFn) {

    function doProcessDelete(dataInEdit, deleteCallback, undeleteFn) {
      $scope.closeEditor();
      $scope.deferEdit().then(function() {
        UISessionService.allow('leaveAnimation', 200);
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
            console.error("error deleting item:");
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
        $scope.initializeEditor('note', note);
      }, handleConvertError);
    }
  };

  $scope.convertToTask = function(dataInEdit){
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
        $scope.initializeEditor('task', task);
      }, handleConvertError);
    }
  };

  $scope.convertToList = function(dataInEdit){
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
        $scope.initializeEditor('list', list);
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
    if ($rootScope.currentWidth >= $rootScope.EDITOR_MAX_WIDTH) {
      // Maximum width for column
      return $rootScope.TITLEBAR_HEADING_MAX_WIDTH;
    } else {
      // Smaller, leave
      return $rootScope.currentWidth - $rootScope.TITLEBAR_BUTTON_WIDTH*2;
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

  var urlRegexp = new RegExp(
    '^' +
      // protocol identifier
      '(?:(?:https?|ftp)://)' +
      // user:pass authentication
      '(?:\\S+(?::\\S*)?@)?' +
      '(?:' +
        // IP address exclusion
        // private & local networks
        '(?!(?:10|127)(?:\\.\\d{1,3}){3})' +
        '(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})' +
        '(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})' +
        // IP address dotted notation octets
        // excludes loopback network 0.0.0.0
        // excludes reserved space >= 224.0.0.0
        // excludes network & broacast addresses
        // (first & last IP address of each class)
        '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])' +
        '(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' +
        '(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))' +
      '|' +
        // host name
        '(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)' +
        // domain name
        '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*' +
        // TLD identifier
        '(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))' +
      ')' +
      // port number
      '(?::\\d{2,5})?' +
      // resource path
      '(?:/\\S*)?' +
    '$', 'i'
  );

  function isValidUrl(url){
    return urlRegexp.test(url);
  }

  $scope.getItemHref = function(item){
    if (!packaging.endsWith('cordova') && item.trans.link && isValidUrl(item.trans.link)){
      return item.trans.link;
    }
  };

  $scope.getItemVisibleUrl = function(item){
    if (item.trans.link){
      if (item.trans.link.startsWith('http://')){
        return item.trans.link.substring(7, item.trans.link.length);
      }else{
        return item.trans.link;
      }
    }
  };

  $scope.clickUrl = function(item){
    if (packaging.endsWith('cordova') && item.trans.link && isValidUrl(item.trans.link) &&
        cordova && cordova.InAppBrowser){
      cordova.InAppBrowser.open(item.trans.link, '_system', 'location=yes');
    }
  };

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
    if ($scope.columns !== 3 && typeof editorFooterCloseCallback === 'function') editorFooterCloseCallback();
  };

  // TEXT PROPERTIES (i.e. description, url and content)

  $scope.setTextPropertyFocus = function(name, hasFocus, item){
    if (!$scope.readOnly) {
      if (hasFocus) {
        $scope.focusedTextProperty = name;
      } else {
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

  $scope.isAutoSavingPrevented = function() {
    return $scope.editorType === 'recurring' || $scope.isOnboarding('notes');
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
    if ($scope.columns === 3){
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
        return 'descrip' + ($scope.columns === 1 ? '-\n' : '') + 'tion';
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
      return $scope.focusedTextProperty !== 'url' && item.trans.link && !isValidUrl(item.trans.link);
    }
  };

  $scope.showEditorAction = function(actionName, item){
    switch (actionName){
      case 'saveBack':
      return !$scope.isPropertyInDedicatedEdit();
      case 'saveDone':
      return $scope.isPropertyInDedicatedEdit();
      case 'delete':
      return !item.trans.deleted && !$scope.isPropertyInDedicatedEdit();
      case 'restore':
      return item.trans.deleted && !$scope.isPropertyInDedicatedEdit();
      case 'convertToNote':
      return $scope.fullEditor && $scope.features.notes.getStatus() !== 'disabled';
      case 'convertToList':
      return $scope.fullEditor && $scope.features.lists.getStatus('active') !== 'disabled';
      case 'convertToTask':
      return $scope.fullEditor;
    }
  };

  $scope.showEditorProperty = function(propertyName, item){
    switch (propertyName){
      case 'title':
      return !$scope.isPropertyInDedicatedEdit();
      case 'url':
      return !$scope.isOtherPropertyInEdit('url');
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

  $scope.generateReadOnlyPropertyClickNotification = function(itemType) {
    UISessionService.pushNotification({
      type: 'fyi',
      text: 'no permission to edit'
    });
  };

  $scope.containerClick = function(disabledElement, itemType) {
    if ($scope.readOnly && disabledElement) $scope.generateReadOnlyPropertyClickNotification(itemType);
  };

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
'ConvertService', 'ItemsService', 'SwiperService', 'UISessionService', 'UserSessionService', 'packaging'];
angular.module('em.main').controller('EditorController', EditorController);
