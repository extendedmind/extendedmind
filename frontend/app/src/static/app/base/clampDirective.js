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

function clampDirective($timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      // https://github.com/josephschmitt/Clamp.js/

      var lineCount = parseInt(attrs.clamp);

      // For webkit browsers, timeout isn't needed as webkit line clamp is supported
      if (typeof(element[0].style.webkitLineClamp) != 'undefined'){
        $clamp(element[0], {clamp: lineCount});
      } else{
        $timeout(function(){
          $clamp(element[0], {clamp: lineCount});
        });
      }
    }
  };
}
clampDirective['$inject'] = ['$timeout'];
angular.module('em.base').directive('clamp', clampDirective);
