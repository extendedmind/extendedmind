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

 function listItemDirective($parse, $q, $rootScope, UISessionService, UserSessionService) {
  return {
    restrict: 'A',
    require: '^list',
    scope: true,
    compile: function(){
      return {
        pre: function(scope, _, attrs, listController) {
          if (attrs.listItem) {
            var listId = $parse(attrs.listItem)(scope);
          }

          scope.getUniqueListItemId = function(itemUUID) {
            var uniqueListItemId = itemUUID + '+';
            if (listId) {
              uniqueListItemId += listId;
            }
            var slideId = listController.getSlideId();
            if (slideId){
              uniqueListItemId += slideId;
            }
            return uniqueListItemId;
          };
        },
        post: function(scope, element, attrs, listController) {
          if (scope.$last) listController.notifyArrayVisible();
          var checkingInProgress;

          scope.toggleLeftCheckbox = function (item, toggleFn) {
            // Add class for animation when item is not completed, remove when item is completed.
            if (!element[0].firstElementChild.classList.contains('checkbox-checked-active') &&
                item.trans.optimisticComplete())
            {
              // Completing
              element[0].firstElementChild.classList.add('checkbox-checked-active');
            } else if (element[0].firstElementChild.classList.contains('checkbox-checked-active') &&
                       !item.trans.optimisticComplete())
            {
              // Uncompleting
              element[0].firstElementChild.classList.remove('checkbox-checked-active');
            }
            checkingInProgress = listController.toggleLeftCheckbox(item, toggleFn, checkingInProgress);
          };

          scope.getListItemClasses = function(item) {
            var classes = [];

            if (item.mod && !UserSessionService.isFakeUser()) {
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
            if (item.trans.favorited) {
              classes.push('favorited');
            }
            if (item.trans.itemType === 'list' && item.trans.list && !item.trans.list.trans.deleted) {
              classes.push('indent');
            }
            if (!classes.length) {
              classes.push('no-additional-status');
            }
            return classes;
          };
        }
      };
    }
  };
}
listItemDirective['$inject'] = ['$parse', '$q', '$rootScope', 'UISessionService', 'UserSessionService'];
angular.module('em.base').directive('listItem', listItemDirective);

/*
* Own custom ng-repeat animation override.
*
* Triggered by class ".animate-list-item-leave" on the ng-repeat element.
*
* See: https://docs.angularjs.org/api/ngAnimate
*/

function listItemLeaveAnimation($animateCss, UISessionService) {

  return {
    /*
    *  Cancel animation when leave animation is locked.
    */
    leave: function(element, leaveDone) {
      var runner = $animateCss(element, {
        event: 'leave',
        structural: true
      }).start();

      if (UISessionService.isAllowed('leaveAnimation', element[0].id)) {
        runner.done(leaveDone);
      } else {
        runner.end();
        leaveDone();
      }
    }
  };
}
listItemLeaveAnimation['$inject'] = ['$animateCss', 'UISessionService'];
angular.module('em.tasks').animation('.animate-list-item-leave', listItemLeaveAnimation);
