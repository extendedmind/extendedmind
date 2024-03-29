/* Copyright 2013-2017 Extended Mind Technologies Oy
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

 function listItemAddDirective($parse) {
  return {
    restrict: 'A',
    require: ['^list', '?^swiperSlide'],
    scope: true,
    compile: function(){
      return {
        pre: function(scope, element, attrs, controllers) {
          var createNewItemFn = $parse(attrs.listItemAdd).bind(undefined, scope);
          var saveNewItemFn = $parse(attrs.listItemAddSave).bind(undefined, scope);

          // Use this instead of ng-show to get focus() to work. With ng-show this doesn't work
          // as ng-show has not been evaluated before we reach the callback.
          element[0].style.display = 'none';

          var addItemFocusCallback;
          var addItemBlurCallback;
          scope.registerAddItemCallbacks = function(focusCallback, blurCallback){
            addItemFocusCallback = focusCallback;
            addItemBlurCallback = blurCallback;
            controllers[0].registerAddActiveCallback(enter);
          };

          scope.isOnboardingInProgress = function(feature, subfeature) {
            if (scope.listAddState && scope.listAddState.featureInfo && scope.isOnboarding) {
              return scope.isOnboarding(feature, subfeature);
            }
          };

          var checkingInProgress;
          scope.toggleLeftCheckbox = function(toggleFn) {
            checkingInProgress = controllers[0].toggleLeftCheckbox(scope.newItem, toggleFn,
                                                                   checkingInProgress);
          };

          function enter(){
            element[0].style.display = 'initial';
            // Initialize first item on focus
            scope.newItem = createNewItemFn();
            addItemFocusCallback();
            controllers[0].notifyListItemAddActive(true);
          }

          function exit(deactivateAfterBlur){
            if (addItemBlurCallback) addItemBlurCallback(deactivateAfterBlur);
            element[0].style.display = 'none';
            controllers[0].notifyListItemAddActive(false);
          }

          scope.onListItemAddExit = function(skipNotifyNoAdd){
            var itemHasTitle = scope.newItem.trans.title && scope.newItem.trans.title.length > 0;
            if (itemHasTitle) {
              saveNewItem(scope.newItem);
            }else if (!skipNotifyNoAdd){
              controllers[0].notifyListItemExitNoAdd();
            }
            exit();
          };

          scope.getListItemAddId = function(){
            if (controllers[1]){
              return controllers[1].getSlidePath() + '/newItem';
            }else{
              return 'newItem';
            }
          };

          scope.textareaKeyDown = function (event) {
            // ESC button
            if (event.keyCode === 27){
              scope.newItem.trans.title = undefined;
              exit();
            }
            // RETURN button
            else if (event.keyCode === 13){
              if (scope.newItem.trans.title && scope.newItem.trans.title.length > 0) {
                // Enter in add item saves, no line breaks allowed
                saveNewItem(scope.newItem);
                scope.newItem = createNewItemFn();
              }
              event.preventDefault();
              event.stopPropagation();
            }
          };

          function saveNewItem(newItem){
            if (controllers[0].notifyListItemBeginAdd()){
              exit();
            }
            saveNewItemFn(newItem).then(function(){
              if (controllers[0].notifyListItemAdd()){
                exit(true);
              }
            });
          }

          scope.callAndExit = function(fn, parameter){
            fn(parameter);
            exit();
          };
        }
      };
    }
  };
}
listItemAddDirective['$inject'] = ['$parse'];
angular.module('em.base').directive('listItemAdd', listItemAddDirective);
