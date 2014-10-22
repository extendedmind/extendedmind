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

 function EditorController($rootScope, $scope, ConvertService, ItemsService, SwiperService,
                           UISessionService) {

  // OPENING, INITIALIZING, CLOSING


  $scope.initializeEditor = function(editorType, item, mode){
    $scope.editorType = editorType;
    $scope.editorVisible = true;
    $scope.mode = mode;

    if (editorType === 'task'){
      $scope.task = item;
    }else if (editorType === 'note'){
      $scope.note = item;
    }else if (editorType === 'list'){
      $scope.list = item;
    }else if (editorType === 'item'){
      $scope.item = item;
    }
  };

  function editorAboutToClose() {
    if (typeof featureEditorAboutToCloseCallback === 'function') featureEditorAboutToCloseCallback();
  }

  // Callback from Snap.js, outside of AngularJS event loop
  function editorOpened() {
    if (typeof titleBarInputFocusCallbackFunction === 'function'){
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

  $scope.deferEdit = function(){
    return UISessionService.deferAction('edit', $rootScope.EDITOR_CLOSED_FAILSAFE_TIME);
  };

  // CONVERTING

  $scope.convertToNote = function(itemInEdit){
    if (itemInEdit.transientProperties.itemType === 'item'){
      var itemToNote = ItemsService.itemToNote(itemInEdit, UISessionService.getActiveUUID());
      if (itemToNote){
        itemToNote.then(function(note){
          $scope.initializeEditor('note', note);
        });
      }
    }
  };

  $scope.convertToTask = function(itemInEdit){
    if (itemInEdit.transientProperties.itemType === 'item'){
      var itemToTask = ItemsService.itemToTask(itemInEdit, UISessionService.getActiveUUID());
      if (itemToTask){
        itemToTask.then(function(task){
          $scope.initializeEditor('task', task);
        });
      }
    }
  };

  $scope.convertToList = function(itemInEdit){
    if (itemInEdit.transientProperties.itemType === 'item'){
      var itemToList = ItemsService.itemToList(itemInEdit, UISessionService.getActiveUUID());
      if (itemToList){
        itemToList.then(function(list){
          $scope.initializeEditor('list', list);
        });
      }
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

  $scope.handleBasicTitlebarKeydown = function(keydownEvent, item){
    // Escape
    if (keydownEvent.keyCode === 27){
      blurTitlebarInput();
    }
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
  $scope.openContextPicker = function() {
    $scope.contextPickerOpen = true;
  };
  $scope.closeListPicker = function() {
    $scope.listPickerOpen = false;
  };
  $scope.closeContextPicker = function() {
    $scope.contextPickerOpen = false;
  };
  $scope.getListFromUUID = function(uuid) {
    var list = $scope.allLists.findFirstObjectByKeyValue('uuid', uuid);
    if (list) return list;
  };
  $scope.getContextFromUUID = function(uuid) {
    var context = $scope.contexts.findFirstObjectByKeyValue('uuid', uuid);
    if (context) return context;
  };
  $scope.getListTitleFromUUID = function(uuid) {
    var list = $scope.allLists.findFirstObjectByKeyValue('uuid', uuid);
    if (list) return list.title;
  };
  $scope.getContextTitleFromUUID = function(uuid) {
    var context = $scope.contexts.findFirstObjectByKeyValue('uuid', uuid);
    if (context) return context.title;
  };

  $scope.closeListPickerAndSetListToItem = function(item, list) {

    function doCloseAndSave() {
      $scope.closeListPicker();
      if (!item.transientProperties) item.transientProperties = {};
      item.transientProperties.list = list.uuid;
    }

    if (!list.uuid) // List is new, save it first. Close list picker on error saving new list.
      $scope.saveList(list).then(doCloseAndSave, $scope.closeListPicker);
    else
      doCloseAndSave();
  };

  $scope.closeContextPickerAndSetContextToItem = function(item, context) {

    function doCloseAndSave() {
      $scope.closeContextPicker();
      if (!item.transientProperties) item.transientProperties = {};
      item.transientProperties.context = context.uuid;
    }

    if (!context.uuid)  // Context is new, save it first. Close context picker on error saving new context.
      $scope.saveContext(context).then(doCloseAndSave, $scope.closeContextPicker);
    else
      doCloseAndSave();
  };

  $scope.closeListPickerAndClearListFromItem = function(item, list) {
    $scope.closeListPicker();
    if (item.transientProperties && item.transientProperties.list === list.uuid)
      delete item.transientProperties.list;
  };

  $scope.closeContextPickerAndClearContextFromItem = function(item, context) {
    $scope.closeContextPicker();
    if (item.transientProperties && item.transientProperties.context === context.uuid)
      delete item.transientProperties.context;
  };
}

EditorController['$inject'] = ['$rootScope', '$scope', 'ConvertService', 'ItemsService', 'SwiperService',
'UISessionService'];
angular.module('em.main').controller('EditorController', EditorController);
