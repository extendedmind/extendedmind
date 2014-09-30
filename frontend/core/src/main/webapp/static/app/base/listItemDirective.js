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

 function listItemDirective() {
  return {
    restrict: 'A',
    require: '^?list',
    templateUrl: 'static/app/base/listItem.html',
    scope: {
      item: '=listItem',
      itemAction: '&listItemAction',
      leftActionType: '@?listItemLeftActionType',
      leftActionClass: '=?listItemLeftActionClass',
      leftAction: '&listItemLeftAction',
      leftActionChecked: '=listItemLeftActionChecked',
      rightIndicatorClass: '=?listItemRightIndicatorClass',
    },
    compile: function(){
      return {
        pre: function(element, attrs) {
          if (!attrs.listItemLeftAction) { attrs.listItemLeftAction = 'false'; }
          if (!attrs.leftActionChecked) { attrs.leftActionChecked = 'false'; }
        },
        post: function(scope, element, attrs, controller) {

          scope.callItemAction = function callItemAction() {
            if (controller) controller.setItemAnimationActiveAndCall(scope.item, scope.itemAction, element[0]);
            else scope.itemAction(scope.item);
          };

          scope.callLeftAction = function callLeftAction() {
            if (controller) {
              controller.setItemLeftActionAnimationActiveAndCall(
                scope.item,
                scope.leftAction,
                scope.leftActionChecked,
                element[0]);
            }
            else scope.leftAction(scope.item);
          };
        }
      };
    }
  };
}
angular.module('em.base').directive('listItem', listItemDirective);

function listItemLeaveAnimation($animate, $q, UISessionService) {

  function setItemLeaveAnimation(element) {
    var canLeavePromise = UISessionService.getItemLeavePromise(element[0]);
    if (canLeavePromise) {

      return canLeavePromise.then(function(changeType) {
        // if checked, add checked because $digest may have not run yet
        if (changeType === 'completed') element.addClass('checked-checkbox');
        return $animate.addClass(element, 'list-item-leave'); // returns a promise
      });
    }
    else
      return $animate.addClass(element, 'list-item-leave');
  }

  return {
    // Call leave on error/reject.
    leave: function(element, leaveDone) {
      var isTaskChecking = UISessionService.getIsTaskChecking(element[0]);

      if (isTaskChecking) {
        var taskCheckingPromise = UISessionService.getTaskCheckingPromise(element[0]);
        var checkedAnimatedPromise = $animate.addClass(element, 'list-item-completing');

        checkedAnimatedPromise.then(function() {
          UISessionService.setTaskCheckingResolved(element[0]);
        }, leaveDone);

        taskCheckingPromise.then(function() {
          setItemLeaveAnimation(element).then(leaveDone, leaveDone);
        }, leaveDone);
      }
      else setItemLeaveAnimation(element).then(leaveDone, leaveDone);
    }
  };
}
listItemLeaveAnimation['$inject'] = ['$animate', '$q', 'UISessionService'];
angular.module('em.tasks').animation('.animate-list-item-leave', listItemLeaveAnimation);
