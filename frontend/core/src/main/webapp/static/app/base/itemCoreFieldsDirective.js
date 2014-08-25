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

 function itemCoreFieldsDirective() {
  return {
    restrict: 'A',
    scope: {
      item: '=itemCoreFields',
      details: '=?itemCoreFieldsDetails'
    },
    templateUrl: 'static/app/base/itemCoreFields.html',
    link: function postLink(scope) {
      scope.showCoreFields = function showCoreFields() {
        if (scope.item.description || scope.item.link || scope.details.visible) {
          return true;
        }
      };
      scope.showUrl = function showUrl() {
        if (scope.item.link || scope.details.visible) {
          return true;
        }
      };
      scope.showDescription = function showDescription() {
        if (scope.item.description || scope.details.visible) {
          return true;
        }
      };
      scope.$on('$destroy', function() {
        scope.details.visible = false;
      });
    }
  };
}
angular.module('em.base').directive('itemCoreFields', itemCoreFieldsDirective);
