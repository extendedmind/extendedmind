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
      leftCheckboxFn: '&listItemAddCheckboxFn'
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
          scope.registerAddItemFocusCallback = function(callback){
            addItemFocusCallback = callback;
            listController.registerAddActiveCallback(function(){
              element[0].style.display = "initial";
              // Initialize first item on focus
              scope.newItem = scope.newItemFn();
              addItemFocusCallback();
            })
          }

          var addItemBlurCallback;
          scope.registerAddItemBlurCallback = function(callback){
           addItemBlurCallback = callback;
          }

          function exit(){
            scope.leftCheckboxChecked = false;
            if (addItemBlurCallback) addItemBlurCallback();
            element[0].style.display = "none";
          }

          scope.textareaBlurred = function(){
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
        }
      };
    },
    link: function(scope, element, attrs, listController) {

      /* REFERENCE CODE FROM addItemDirective!

      var scrollToAddItem = false;
      function accordionLastElementCallback() {
        if (scrollToAddItem && angular.isFunction(scope.scrollToElement)) {
          scope.scrollToElement(element);
          scrollToAddItem = false;
        }
      }
      if (angular.isFunction(scope.registerLastCallback)) scope.registerLastCallback(accordionLastElementCallback);

      var elementHasFocus = false;
      scope.focusedAddItemElement = function focusedAddItemElement() {
        elementHasFocus = true;
        scope.ignoreSnap = true;
        element[0].classList.toggle('swiper-no-swiping', true);
      };

      scope.blurredAddItemElement = function blurredAddItemElement() {
        elementHasFocus = false;
        // data-snap-ignore can not have any value, so setting it to false is not enough
        scope.ignoreSnap = undefined;
        element[0].classList.toggle('swiper-no-swiping', false);
      };

      // In Android, scrolling needs to be done after keyboard is shown
      if (packaging === 'android-cordova' && angular.isFunction(scope.scrollToElement)) {
        scope.$watch('softKeyboard.height', function(newValue) {
          if (newValue && elementHasFocus) {
            scope.scrollToElement(element);
          }
        });
      }

      scope.callAndRefresh = function callAndRefresh(itemAction, parameter) {
        itemAction(parameter);
        if (scope.getOnboardingPhase() === 'new') {
          scope.setOnboardingPhase('itemAdded');
          var inputField = element.find('input');
          setTimeout(function() {
            inputField.blur();
          });
        } else {
          if (angular.isFunction(scope.registerLastCallback)) {
            scrollToAddItem = true;
          } else if (angular.isFunction(scope.scrollToElement)) {
            // No accordion present, scroll immediately
            scope.scrollToElement(element);
          }
          if (scope.getOnboardingPhase() === 'itemAdded' || scope.getOnboardingPhase() === 'sortingStarted') {
            scope.setOnboardingPhase('secondItemAdded');
          }
        }
      };*/

    }
  };
}
angular.module('em.base').directive('listItemAdd', listItemAddDirective);
