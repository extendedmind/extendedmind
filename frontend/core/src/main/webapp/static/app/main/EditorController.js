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

 function EditorController($rootScope, $scope, SwiperService, UISessionService) {

  // OPENING, INITIALIZING, CLOSING

  var currentItem;
  function editorAboutToOpen(editorType, item) {
    $scope.editorType = editorType;
    $scope.editorVisible = true;
    currentItem = item;
  }

  $scope.getItemInEdit = function(){
    return currentItem;
  };

  // Callback from Snap.js, outside of AngularJS event loop
  function editorOpened() {
    if (typeof titleBarInputFocusCallbackFunction === 'function')
     $scope.$apply(setFocusOnTitlebarInput);
  }

  // Callback from Snap.js, outside of AngularJS event loop
  function editorClosed() {
    // Don't manipulate list items in list before editor has been closed.
    UISessionService.resolveDeferredActions('edit');

    // NOTE: Call $apply here if these don't seem to be reseted
    $scope.editorType = undefined;
    $scope.editorVisible = false;
    currentItem = false;
    titleBarInputFocusCallbackFunction = titleBarInputBlurCallbackFunction = undefined;
  }

  if (angular.isFunction($scope.registerEditorAboutToOpenCallback))
    $scope.registerEditorAboutToOpenCallback(editorAboutToOpen);

  if (angular.isFunction($scope.registerEditorClosedCallback))
    $scope.registerEditorClosedCallback(editorClosed, 'EditorController');

  if (angular.isFunction($scope.registerEditorOpenedCallback))
    $scope.registerEditorOpenedCallback(editorOpened, 'TaskEditorController');

  $scope.$on('$destroy', function() {
    if (angular.isFunction($scope.unregisterEditorAboutToOpenCallback))
      $scope.unregisterEditorAboutToOpenCallback('EditorController');

    if (angular.isFunction($scope.unregisterEditorOpenedCallback))
      $scope.unregisterEditorOpenedCallback('EditorController');

    if (angular.isFunction($scope.unregisterEditorClosedCallback))
      $scope.unregisterEditorClosedCallback('EditorController');
  });

  // HELPER METHODS

  $scope.saveNewListToExtendedItem = function(item, newList, readyFn) {
    if (newList && newList.title)
      $scope.saveList($scope.newList).then(
        function(savedList){
          // success
          if (item.transientProperties) item.transientProperties = {};
          item.transientProperties.list = savedList.uuid;
          readyFn(item);
        },
        function(){
          // failure
          readyFn(item);
        });
    else {
      readyFn(item);
    }
  };

  $scope.deferEdit = function(){
    return UISessionService.deferAction('edit', $rootScope.EDITOR_CLOSED_FAILSAFE_TIME);
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
    else if (item && $scope.titlebarHasText()){
      // Change task title at the same time, but not if its empty
      item.title = $scope.titlebar.text;
    }
  };

  // NAVIGATION

  $scope.swipeToAdvanced = function() {
    SwiperService.swipeTo($scope.editorType + 'Editor/advanced');
  };

  $scope.swipeToBasic = function() {
    SwiperService.swipeTo($scope.editorType + 'Editor/basic');
  };

}

EditorController['$inject'] = ['$rootScope', '$scope', 'SwiperService', 'UISessionService'];
angular.module('em.main').controller('EditorController', EditorController);
