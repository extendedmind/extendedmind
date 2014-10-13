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

 function listItemDirective($parse) {
  return {
    restrict: 'A',
    require: '^list',
    scope: true,
    compile: function(){
      return {
        post: function(scope, element, attrs, listController) {
          var listLength = $parse(attrs.listItem)(scope);
          listController.notifyListLength(listLength);

          scope.toggleLeftCheckbox = function (item, toggleFn) {
            listController.toggleLeftCheckbox(item, toggleFn,
                                              angular.element(element[0].firstElementChild));
          };
        }
      };
    }
  };
}
listItemDirective['$inject'] = ['$parse'];
angular.module('em.base').directive('listItem', listItemDirective);

/*
* Own custom ng-repeat animation override.
*
* Triggered by class ".animate-list-item-leave" on the ng-repeat element.
*
* See: https://docs.angularjs.org/api/ngAnimate
*/

function listItemLeaveAnimation($animate, UISessionService) {

  return {
    /*
    *  Cancel animation when leave animation is locked.
    */
    leave: function(element, leaveDone) {
      leaveDone();
      if (UISessionService.isLocked('leaveAnimation')) {
        // Second leaveDone call will cancel animation.
        leaveDone();
        return;
      }
    }
  };
}
listItemLeaveAnimation['$inject'] = ['$animate', 'UISessionService'];
angular.module('em.tasks').animation('.animate-list-item-leave', listItemLeaveAnimation);
