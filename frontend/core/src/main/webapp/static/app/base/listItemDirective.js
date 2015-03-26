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

 function listItemDirective($parse, $rootScope) {
  return {
    restrict: 'A',
    require: '^list',
    scope: true,
    compile: function(){
      return {
        pre: function(scope, _, attrs) {
          if (attrs.listItem) {
            var listId = $parse(attrs.listItem)(scope);
          }

          scope.getUniqueListItemId = function(itemUUID) {
            var uniqueListItemId = itemUUID;
            if (listId) {
              uniqueListItemId += listId;
            }
            return uniqueListItemId;
          };
        },
        post: function(scope, element, attrs, listController) {
          if (scope.$last) listController.notifyArrayVisible();

          scope.toggleLeftCheckbox = function (item, toggleFn) {
            // Add class for animation when item is not completed, remove when item is completed.
            if (!element[0].firstElementChild.classList.contains('checkbox-checked-active') &&
                item.trans.optimisticComplete())
            {
              // Completing
              element[0].firstElementChild.classList.add('checkbox-checked-active');
              scope.checkedActiveAdded = Date.now();
              setTimeout(function(){
                // Remove the class anyway if there hasn't been another add in the near history
                if (Date.now() - scope.checkedActiveAdded >= $rootScope.CHECKBOX_CHECKING_ANIMATION_TIME){
                  element[0].firstElementChild.classList.remove('checkbox-checked-active');
                }
              }, $rootScope.CHECKBOX_CHECKING_ANIMATION_TIME);
            }else if (element[0].firstElementChild.classList.contains('checkbox-checked-active') &&
                      !item.trans.optimisticComplete())
            {
              // Uncompleting
              element[0].firstElementChild.classList.remove('checkbox-checked-active');
            }
            listController.toggleLeftCheckbox(item, toggleFn, angular.element(element[0].firstElementChild));
          };

          scope.getListItemClasses = function(item) {
            var classes = [];

            if (item.mod) {
              classes.push('syncing');
              if (!scope.online) {
                classes.push('offline');
              }
            }
            if (item.trans.repeating) {
              classes.push('repeating');
            }
            if (item.trans.optimisticComplete && item.trans.optimisticComplete()) {
              classes.push('checkbox-checked');
            }
            if (!classes.length) {
              classes.push('no-additional-data');
            }
            return classes;
          };
        }
      };
    }
  };
}
listItemDirective['$inject'] = ['$parse', '$rootScope'];
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
      if (!UISessionService.isAllowed('leaveAnimation')) {
        // Second leaveDone call will cancel animation.
        leaveDone();
        return;
      }
    }
  };
}
listItemLeaveAnimation['$inject'] = ['$animate', 'UISessionService'];
angular.module('em.tasks').animation('.animate-list-item-leave', listItemLeaveAnimation);
