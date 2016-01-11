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
 'use strict';
 /* global cordova */

 function editableFieldDirective($parse, $rootScope, $timeout, packaging) {
  return {
    require: '^?editableFieldContainer',
    restrict: 'A',
    link: function(scope, element, attrs, editableFieldContainerController) {

      var editableFieldType;
      if (attrs.editableField.length > 0){
        editableFieldType = $parse(attrs.editableField)(scope);
      }

      if (attrs.editableFieldRegisterCallbacks){
        var registerCallbacksFn = $parse(attrs.editableFieldRegisterCallbacks);
        registerCallbacksFn(scope, {focus: focusElement, blur: blurElement});
      }

      if (attrs.editableFieldFocus) {
        var focusCallback = $parse(attrs.editableFieldFocus).bind(undefined, scope);
      }
      if (attrs.editableFieldBlur) {
        var blurCallback = $parse(attrs.editableFieldBlur).bind(undefined, scope);
      }
      if (attrs.editableFieldAutofocus && $parse(attrs.editableFieldAutofocus)(scope)) {
        focusElement();
      }

      function focusElement() {
        function doFocusElement(){
          element[0].focus();
          if (packaging === 'android-cordova'){
            // In Android we need to force the keyboard up
            cordova.plugins.Keyboard.show();
          }
        }
        // https://developer.mozilla.org/en-US/docs/Web/API/document.activeElement
        if (document.activeElement !== element[0]){
          if ($rootScope.$$phase || scope.$$phase){
            // It seems $timeout can not be avoided here:
            // https://github.com/angular/angular.js/issues/1250
            // "In the future, this will (hopefully) be solved with Object.observe."
            // We would get "$digest already in progress" without this in some cases.
            $timeout(function(){
              doFocusElement();
            });
          }else {
            doFocusElement();
          }
        }
      }

      var unfocusInProgress = false;
      function blurElement(deactivateAfterBlur) {
        function doBlurElement(){
          element[0].blur();
          if (deactivateAfterBlur && editableFieldContainerController)
            editableFieldContainerController.deactivateContainer();
        }

        if (document.activeElement === element[0]){
          unfocusInProgress = true;
          if ($rootScope.$$phase || scope.$$phase){
            // It seems $timeout can not be avoided here:
            // https://github.com/angular/angular.js/issues/1250
            // "In the future, this will (hopefully) be solved with Object.observe."
            // We would get "$digest already in progress" without this in some cases.
            $timeout(function(){
              doBlurElement();
            });
          }else {
            doBlurElement();
          }
        }
      }

      var refocusInProgress = false;
      function reFocusEditableField(){
        refocusInProgress = true;
        focusElement();
      }

      var editableFieldClicked = function() {
        if (editableFieldContainerController) editableFieldContainerController.notifyFocus();
        reFocusEditableField();
      };

      var editableFieldFocus = function() {
        if (!refocusInProgress){
          if (editableFieldContainerController) editableFieldContainerController.notifyFocus();
          if (typeof focusCallback === 'function') executeFocusCallback(focusCallback);
        }
        refocusInProgress = false;
      };

      var editableFieldBlur = function() {
        if (editableFieldType === 'sticky' && !unfocusInProgress){
          reFocusEditableField();
          if (editableFieldContainerController) editableFieldContainerController.notifyReFocus(blurElement);
        }else{
          unfocusInProgress = false;
          if (packaging === 'android-cordova'){
            // In Android we need to force the keyboard down
            cordova.plugins.Keyboard.close();
          }
        }
        if (typeof blurCallback === 'function') blurCallback();
      };

      function executeFocusCallback(callback) {
        // Use $evalAsync, because: "As the focus event is executed synchronously when calling input.focus()
        // AngularJS executes the expression using scope.$evalAsync if the event is fired during an $apply to
        // ensure a consistent state"
        if ($rootScope.$$phase || scope.$$phase){
          scope.$evalAsync(callback);
        } else {
          scope.$apply(callback);
        }
      }

      var editableFieldKeydown = function(event){
        // ESC button
        if (event.keyCode === 27){
          editableFieldBlur();
          if (editableFieldContainerController) editableFieldContainerController.deactivateContainer();
        }
      };

      angular.element(element).bind('focus', editableFieldFocus);
      angular.element(element).bind('blur', editableFieldBlur);
      angular.element(element).bind('keydown', editableFieldKeydown);
      if (editableFieldType === 'sticky')
        angular.element(element).bind('click', editableFieldClicked);


      scope.$on('$destroy', function() {
        angular.element(element).unbind('focus', editableFieldFocus);
        angular.element(element).unbind('blur', editableFieldBlur);
        angular.element(element).unbind('keydown', editableFieldKeydown);
        if (editableFieldType === 'sticky')
          angular.element(element).unbind('click', editableFieldClicked);
      });
    }
  };
}
editableFieldDirective['$inject'] = ['$parse', '$rootScope', '$timeout', 'packaging'];
angular.module('common').directive('editableField', editableFieldDirective);
