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

/*
* TODO: Loading prompt is not shown when it is initially hidden and then items are added passing the limit:
*        -list has to become inactive and active again
*/
function listPromptDirective($animate, $rootScope, UISessionService, UserSessionService) {
  return {
    restrict: 'A',
    require: '^list',
    scope: {
      promptType: '@listPrompt',
      listInfos: '=listPromptInfos',
      noItemsVisible: '=listPromptHide'
    },
    templateUrl: $rootScope.urlBase + 'app/base/listPrompt.html',
    link: function(scope, element, attrs, listController) {
      var loadingAnimationElementVisible;
      var loadingAnimationElement;
      var animateNoItemsPromptWhenEmpty = false;

      function init() {
        loadingAnimationElementVisible = listController.registerIsNearListBottomCallback(isNearListBottom);

        loadingAnimationElement = element[0].firstElementChild.lastElementChild;
        if (loadingAnimationElement && loadingAnimationElementVisible) {
          // Set loading animation element initially visible.
          loadingAnimationElement.style.display = 'block';
        }
      }

      if (!scope.listInfos.array) {
        // Wait for array.
        var listInfosWatcher = scope.$watch('listInfos', function(newListInfos) {
          if (newListInfos && newListInfos.array) {
            // Array arrived, initialize.
            // NOTE:  Returns zero length when changing feature even though array has items, because filter
            //        has not yet rendered items into DOM.
            //
            //        Register array visible callback into listController to get the correct info, but that
            //        callback is only executed when list has an array with items, so we need to keep
            //        listInfos watcher for lists with an actual zero-length array.
            //
            //        Initially empty lists executes init() here and also in array visible callback
            init();
          }
          listInfosWatcher(); // Unbind list infos watcher.
        });
        listController.registerArrayVisibleCallback(arrayVisible);
      } else {
        // Array initially ready.
        init();
      }

      /*
      * Array is visible and rendered into DOM, initialize.
      */
      function arrayVisible() {
        init();
        listController.unregisterArrayVisibleCallback();
      }

      function listHasItems() {
        if (scope.listInfos && scope.listInfos.array && scope.listInfos.array.length) {
          // List has items. Animate prompt when it becomes visible.
          animateNoItemsPromptWhenEmpty = true;
          return true;
        }
        if (loadingAnimationElement && loadingAnimationElementVisible) {
          loadingAnimationElement.style.display = 'none';
          loadingAnimationElementVisible = false;
        }
      }

      scope.isNoItemsPromptVisible = function() {
        if (!scope.promptType || listHasItems()) {
          // Has no prompt or has items.
          return false;
        }

        if (scope.noItemsVisible) {
          // Check additional hiders.
          for (var i = 0, len = scope.noItemsVisible.length; i < len; i++) {
            if (scope.noItemsVisible[i]) {
              // At least one additional hider is on.
              return false;
            }
          }
        }
        // No items and no additional hiders.
        if (animateNoItemsPromptWhenEmpty && UISessionService.isAllowed('leaveAnimation')) {
          animateNoItemsPromptWhenEmpty = false;
          $animate.addClass(element, 'animate-no-items-prompt').then(function() {
            // Animate prompt visible.
            element[0].classList.remove('animate-no-items-prompt');
          });
        }

        return UserSessionService.isPersistentStorageEnabled() ? UserSessionService.isPersistentDataLoaded() :
        true;
      };

      function isNearListBottom(nearBottom) {
        if (nearBottom) {
          if (loadingAnimationElement && !loadingAnimationElementVisible) {
            loadingAnimationElement.style.display = 'block';
            loadingAnimationElementVisible = true;
          }
        } else {
          if (loadingAnimationElement && loadingAnimationElementVisible) {
            loadingAnimationElement.style.display = 'none';
            loadingAnimationElementVisible = false;
          }
        }
      }

    }
  };
}
listPromptDirective['$inject'] = ['$animate', '$rootScope', 'UISessionService', 'UserSessionService'];
angular.module('em.base').directive('listPrompt', listPromptDirective);
