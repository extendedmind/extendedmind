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

 function drawerHandleDirective($parse) {
  return {
    restrict: 'A',
    require: '^drawerAisle',
    link: function postLink(scope, element, attrs, drawerController) {
      drawerController.registerDrawerHandleElement(element[0], attrs.drawerHandle);

      if (attrs.drawerHandleRegisterActivate){
        var registerActivateCallbackFn = $parse(attrs.drawerHandleRegisterActivate);
        registerActivateCallbackFn(scope, {activate: activate});
      }

      /*
      * Register activate drawer handle element callback.
      *
      * NOTE: All drawer-handle elements are below ng-if="isFeatureActive(<FEATURE>)" except when <FEATURE>
      *       is 'focus'. Implement deactivate callback if other <FEATURE>(s) behaves like 'focus'.
      */
      function activate() {
        drawerController.registerDrawerHandleElement(element[0], attrs.drawerHandle);
      }
    }
  };
}
drawerHandleDirective['$inject'] = ['$parse'];
angular.module('em.base').directive('drawerHandle', drawerHandleDirective);
