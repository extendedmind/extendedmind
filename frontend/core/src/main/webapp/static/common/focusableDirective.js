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

 function focusableDirective($document, $rootScope, $timeout) {
  return {
    restrict: 'A',
    scope: {
      registerCallbacksFn: '&focusable'
    },
    link: function postLink(scope, element) {
      scope.registerCallbacksFn({focus: focus, blur: blur});
      function focus() {
        // https://developer.mozilla.org/en-US/docs/Web/API/document.activeElement
        if ($document[0].activeElement !== element[0]) element[0].focus();
      }
      function blur() {
        if ($document[0].activeElement === element[0]){
          if ($rootScope.$$phase || scope.$$phase){
            // It seems $timeout can not be avoided here:
            // https://github.com/angular/angular.js/issues/1250
            // "In the future, this will (hopefully) be solved with Object.observe."
            $timeout(function(){
              element[0].blur();
            });
          }else {
            element[0].blur();
          }
        }
      }
    }
  };
}
focusableDirective['$inject'] = ['$document', '$rootScope', '$timeout'];
angular.module('common').directive('focusable', focusableDirective);
