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

 function EditorController($rootScope, $scope,
                           ConvertService, ItemsService, SwiperService, UISessionService,
                           UserSessionService) {

  // OPENING, INITIALIZING, CLOSING

  var itemInEdit;
  $scope.initializeEditor = function(editorType, item, mode){
    // Reset $scope variables. These may exist from previous editor.
    $scope.task = undefined;
    $scope.note = undefined;
    $scope.list = undefined;
    $scope.item = undefined;
    $scope.tag = undefined;
    itemInEdit = item;

    $scope.editorType = editorType;
    $scope.editorVisible = true;
    $scope.mode = mode;

    if (editorType === 'task'){
      $scope.task = itemInEdit;
    }else if (editorType === 'note'){
      $scope.note = itemInEdit;
    }else if (editorType === 'list'){
      $scope.list = itemInEdit;
    }else if (editorType === 'item'){
      $scope.item = itemInEdit;
    }else if (editorType === 'tag'){
      $scope.tag = itemInEdit;
    }else if (editorType === 'user'){
      $scope.user = itemInEdit ? itemInEdit : UserSessionService.getUser();
    }
  };

  function editorAboutToClose() {
    if (typeof featureEditorAboutToCloseCallback === 'function') featureEditorAboutToCloseCallback();
  }

  // Callback from Snap.js, outside of AngularJS event loop
  function editorOpened() {
    if ((!itemInEdit || !itemInEdit.deleted) && typeof titleBarInputFocusCallbackFunction === 'function' &&
        $scope.editorType !== 'task')
    {
      // Focus on found and not deleted item
      if (!$scope.$$phase && !$rootScope.$$phase){
        $scope.$apply(setFocusOnTitlebarInput);
      }else{
        setFocusOnTitlebarInput();
      }
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
  });

  // HELPER METHODS

  var featureEditorAboutToCloseCallback;
  $scope.registerFeatureEditorAboutToCloseCallback = function(callback) {
    featureEditorAboutToCloseCallback = callback;
  };
  $scope.unregisterEditorAboutToCloseCallback = function() {
    featureEditorAboutToCloseCallback = undefined;
  };

  $scope.deferEdit = function(){
    return UISessionService.deferAction('edit', $rootScope.EDITOR_CLOSED_FAILSAFE_TIME);
  };

  // CONVERTING

  $scope.convertToNote = function(itemInEdit){
    var convertToNotePromise;
    if (itemInEdit.trans.itemType === 'item') {
      convertToNotePromise = ItemsService.itemToNote(itemInEdit,
                                                     UISessionService.getActiveUUID());
    }
    else if (itemInEdit.trans.itemType === 'task') {
      convertToNotePromise = ConvertService.finishTaskToNoteConvert(itemInEdit,
                                                                    UISessionService.getActiveUUID());
    }
    else if (itemInEdit.trans.itemType === 'list') {
      convertToNotePromise = ConvertService.finishListToNoteConvert(itemInEdit,
                                                                    UISessionService.getActiveUUID());
    }
    if (convertToNotePromise){
      convertToNotePromise.then(function(note){
        $scope.initializeEditor('note', note);
      });
    }
  };

  $scope.convertToTask = function(itemInEdit){
    var convertToTaskPromise;
    if (itemInEdit.trans.itemType === 'item') {
      convertToTaskPromise = ItemsService.itemToTask(itemInEdit,
                                                     UISessionService.getActiveUUID());
    }
    else if (itemInEdit.trans.itemType === 'note') {
      convertToTaskPromise = ConvertService.finishNoteToTaskConvert(itemInEdit,
                                                                    UISessionService.getActiveUUID());
    } else if (itemInEdit.trans.itemType === 'list') {
      convertToTaskPromise = ConvertService.finishListToTaskConvert(itemInEdit,
                                                                    UISessionService.getActiveUUID());
    }
    if (convertToTaskPromise){
      convertToTaskPromise.then(function(task){
        $scope.initializeEditor('task', task);
      });
    }
  };

  $scope.convertToList = function(itemInEdit){
    var convertToListPromise;
    if (itemInEdit.trans.itemType === 'item'){
      convertToListPromise = ItemsService.itemToList(itemInEdit,
                                                     UISessionService.getActiveUUID());
    }
    else if (itemInEdit.trans.itemType === 'task') {
      convertToListPromise = ConvertService.finishTaskToListConvert(itemInEdit,
                                                                    UISessionService.getActiveUUID());
    }
    else if (itemInEdit.trans.itemType === 'note') {
      convertToListPromise = ConvertService.finishNoteToListConvert(itemInEdit,
                                                                    UISessionService.getActiveUUID());
    }
    if (convertToListPromise){
      convertToListPromise.then(function(list){
        $scope.initializeEditor('list', list);
      });
    }
  };

  // TITLEBAR

  $scope.titlebar = {};

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

  $scope.titlebarHasText = function() {
    return $scope.titlebar.text && $scope.titlebar.text.length !== 0;
  };

  $scope.handleBasicTitlebarKeydown = function(keydownEvent/*, item*/){
    // Escape
    if (keydownEvent.keyCode === 27){
      blurTitlebarInput();
    }
  };

  $scope.isTitleClamped = function() {
    return $scope.descriptionFocused || $scope.listPickerOpen;
  };

  // NAVIGATION

  $scope.isFirstSlide = function(){
    return SwiperService.isSlideActive($scope.editorType + 'Editor/basic');
  };

  $scope.swipeToAdvanced = function() {
    SwiperService.swipeTo($scope.editorType + 'Editor/advanced');
  };

  $scope.swipeToBasic = function() {
    SwiperService.swipeTo($scope.editorType + 'Editor/basic');
  };

  $scope.editorSwiperSlideChanged = function(){
    // Need to digest on slide change to get changes to header to bite
    if (!$rootScope.$$phase && !$scope.$$phase)
      $scope.$digest();
  };

  // LIST PICKER WIDGET
  $scope.openListPicker = function() {
    $scope.listPickerOpen = true;
  };
  $scope.closeListPicker = function() {
    $scope.listPickerOpen = false;
  };
  $scope.getListFromUUID = function(uuid) {
    var list = $scope.allLists.findFirstObjectByKeyValue('uuid', uuid);
    if (list) return list;
  };
  $scope.getListTitleFromUUID = function(uuid) {
    var list = $scope.allLists.findFirstObjectByKeyValue('uuid', uuid);
    if (list) return list.title;
  };

  $scope.closeListPickerAndSetListToItem = function(item, list) {

    function doCloseAndSave() {
      $scope.closeListPicker();
      if (!item.trans) item.trans = {};
      item.trans.list = list.uuid;
    }

    if (!list.uuid) // List is new, save it first. Close list picker on error saving new list.
      $scope.saveList(list).then(doCloseAndSave, $scope.closeListPicker);
    else
      doCloseAndSave();
  };

  $scope.closeListPickerAndClearListFromItem = function(item, list) {
    $scope.closeListPicker();
    if (item.trans && item.trans.list === list.uuid)
      delete item.trans.list;
  };

  $scope.setTitleBarBlur = function() {
    $scope.titleBarFocused = false;
  };
  $scope.setTitleBarFocus = function() {
    $scope.titleBarFocused = true;
  };

  // DESCRIPTION
  $scope.setDescriptionFocus = function(value){
    $scope.descriptionFocused = value;
  };

  // URL
  $scope.setUrlFocus = function(value) {
    $scope.urlFocused = value;
  };

}

EditorController['$inject'] = ['$rootScope', '$scope',
'ConvertService', 'ItemsService', 'SwiperService', 'UISessionService', 'UserSessionService'];
angular.module('em.main').controller('EditorController', EditorController);
