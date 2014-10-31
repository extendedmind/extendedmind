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

 function listPickerDirective($rootScope) {
  return {
    restrict: 'A',
    templateUrl: $rootScope.urlBase + 'app/base/listPicker.html',
    scope: {
      lists: '=listPicker',
      newList: '=?listPickerNewItem',
      type: '@listPickerType',
      prefix: '@listPickerPrefix',
      archivedLists: '=listPickerArchivedLists',
      getSelectedList: '&listPickerGetSelected',
      closeAndSave: '&listPickerSave',
      closeAndClearList: '&listPickerClear'
    },
    link: function(scope) {
      if (angular.isFunction(scope.getSelectedList))
        scope.selectedList = scope.getSelectedList();

      /*
      * Filter selected list from lists.
      */
      scope.notSelectedList = function(list) {
        if (!scope.selectedList) return true;  // No list selected.

        if (list.uuid) {
          // Compare with uuid.
          return scope.selectedList.uuid && list.uuid !== scope.selectedList.uuid;
        } else {
          // Compare with title.
          return scope.selectedList.title !== list.title;
        }
      };

      scope.listSelected = function(list) {
        var listToSave = {};
        if (scope.prefix) {
          if (list.title && list.title.length <= 1) return; // Title has only prefix. Do not save.

          for (var listProperty in list) {
            if (list.hasOwnProperty(listProperty)) {
              listToSave[listProperty] = list[listProperty];
            }
          }
          listToSave.title = listToSave.title.substring(1);
        } else
        listToSave = list;

        scope.closeAndSave({list: listToSave});
      };

      scope.listCleared = function(list) {
        scope.closeAndClearList({list: list});
      };

      scope.textareaKeyDown = function(event) {
        if (event.keyCode === 13) { // RETURN button
          // Enter in add item saves, no line breaks allowed
          if (scope.newList.title && scope.newList.title.length > 0) {
           scope.listSelected(scope.newList);
         }
         event.preventDefault();
         event.stopPropagation();
       }
     };

     var watch;
     function bindWatcher() {
      var preventWatch;
      if (watch) return;  // no rebind

      watch = scope.$watch('newList.title', function(newTitle) {
        if (preventWatch) {
          preventWatch = false;
          return;
        }

        if (!newTitle) {
          // Title cleared. Add prefix.
          preventWatch = true;
          scope.newList.title = scope.prefix;
          return;
        } else if (newTitle) {
          // New title.
          if (newTitle.charAt(0) !== scope.prefix) {
            // Add prefix to first character of title.
            scope.newList.title = scope.prefix + newTitle;
          }
        }
      });
    }

    scope.placeholder = 'add ' + (scope.type ? scope.type : 'list') + '\u2026';

    scope.watchForTitleChange = function() {
      if (scope.prefix) bindWatcher();
    };
  }
};
}
listPickerDirective['$inject'] = ['$rootScope'];
angular.module('em.base').directive('listPicker', listPickerDirective);
