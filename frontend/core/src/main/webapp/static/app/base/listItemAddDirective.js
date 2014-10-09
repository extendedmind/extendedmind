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

 function listItemAddDirective() {
  return {
    restrict: 'A',
    require: '^list',
    scope: {
      newItemFn: '&listItemAdd',
      newItemType: '@listItemAddType',
      addItemFn: '&listItemAddFn',
      leftCheckboxFn: '&listItemAddCheckboxFn',
      leftRightArrowFn: '&listItemAddArrowFn'
    },
    templateUrl: 'static/app/base/listItemAdd.html',
    compile: function(){
      return {
        pre: function(scope, element, attrs, listController) {

          // Use this instead of ng-show to get focus() to work. With ng-show this doesn't work
          // as ng-show has not been evaluated before we reach the callback.
          element[0].style.display = "none";
          scope.leftCheckboxChecked = false;

          var addItemFocusCallback;
          var addItemBlurCallback;
          scope.registerAddItemCallbacks = function(focusCallback, blurCallback){
            addItemFocusCallback = focusCallback;
            addItemBlurCallback = blurCallback;
            listController.registerAddActiveCallback(function(){
              element[0].style.display = "initial";
              // Initialize first item on focus
              scope.newItem = scope.newItemFn();
              addItemFocusCallback();
            })
          }

          function exit(){
            scope.leftCheckboxChecked = false;
            if (addItemBlurCallback) addItemBlurCallback();
            element[0].style.display = "none";
          }

          scope.clickedElsewhere = function(){
            scope.addItem();
            exit();
          }

          scope.textareaKeyDown = function (event) {
            // ESC button
            if (event.keyCode === 27) exit();
            // RETURN button
            else if (event.keyCode === 13) {
              // Enter in add item saves, no line breaks allowed
              scope.addItem();
              event.preventDefault();
              event.stopPropagation();
            }
          };

          scope.addItem = function(){
            scope.addItemFn({newItem: scope.newItem});
            scope.newItem = scope.newItemFn();
          };

          scope.clickArrow = function(){
            scope.leftRightArrowFn({newItem: scope.newItem});
          }
        }
      };
    }
  };
}
angular.module('em.base').directive('listItemAdd', listItemAddDirective);
