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

 function listItemDirective($animate, $q) {
  return {
    restrict: 'A',
    require: '^list',
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
        post: function(scope, element) {

          /*
          * Animate checked checkbox here.
          */
          scope.toggleLeftCheckbox = function toggleLeftCheckbox(item) {

            var checkboxCheckingReadyDeferred = $q.defer();
            var checked = scope.leftAction({
              task: item,
              checkboxCheckingReadyDeferred: checkboxCheckingReadyDeferred
            });

            if (checked) {
              $animate.addClass(element, 'list-item-completing').then(function() {
                checkboxCheckingReadyDeferred.resolve(item);
                scope.$apply();
              });
            } else $animate.removeClass(element, 'list-item-completing');
          };
        }
      };
    }
  };
}
listItemDirective['$inject'] = ['$animate', '$q'];
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
    * (1) Wait for deferred edit promise to be fulfilled.
    *  2  Animate item leave.
    *  3  Wait for item leave promise to be fulfilled. Call leaveDone.
    */
    leave: function(element, leaveDone) {
      // Classes ".ng-leave" and ".ng-leave-active" are present on the element.
      // Because we want to delay animation start we have to use our own animation classes.

      var deferredEdit = UISessionService.getDeferredAction('edit');
      if (deferredEdit) {
        deferredEdit.promise.then(function() {
          $animate.addClass(element, 'list-item-leave').then(function() {
            leaveDone();
            UISessionService.activateDelayedNotifications();
          });
        });
      } else {
        // Straight leave without promises.
        $animate.addClass(element, 'list-item-leave').then(function() {
          leaveDone();
          UISessionService.activateDelayedNotifications();
        });
      }
    }
  };
}
listItemLeaveAnimation['$inject'] = ['$animate', 'UISessionService'];
angular.module('em.tasks').animation('.animate-list-item-leave', listItemLeaveAnimation);
