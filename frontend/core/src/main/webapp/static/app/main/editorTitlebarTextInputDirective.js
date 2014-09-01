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

 function editorTitlebarTextInputDirective($document) {
  return {
    restrict: 'A',
    link: function postLink(scope, element) {

      scope.registerTitleBarInputFocusCallback(titleBarInputFocus);
      function titleBarInputFocus() {
        scope.$evalAsync(function() {
          // https://developer.mozilla.org/en-US/docs/Web/API/document.activeElement
          if ($document[0].activeElement !== element[0]) element[0].focus();
        });
      }
      scope.registerTitleBarInputBlurCallback(titleBarInputBlur);
      function titleBarInputBlur() {
        scope.$evalAsync(function() {
          if ($document[0].activeElement === element[0]) element[0].blur();
        });
      }
    }
  };
}
editorTitlebarTextInputDirective['$inject'] = ['$document'];
angular.module('em.main').directive('editorTitlebarTextInput', editorTitlebarTextInputDirective);
