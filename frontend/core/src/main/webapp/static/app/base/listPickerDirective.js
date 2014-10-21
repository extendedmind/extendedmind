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

 function listPickerDirective() {
  return {
    restrict: 'A',
    templateUrl: 'static/app/base/listPicker.html',
    scope: {
      lists: '=listPicker',
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
        return !scope.selectedList || (scope.selectedList.uuid && list.uuid !== scope.selectedList.uuid);
      };

      scope.listSelected = function(list) {
        scope.closeAndSave({list: list});
      };

      scope.listCleared = function(list) {
        scope.closeAndClearList({list: list});
      };

      scope.textareaKeyDown = function(event) {
        if (event.keyCode === 13) { // RETURN button
          if (scope.newList.title && scope.newList.title.length > 0) {
            // Enter in add item saves, no line breaks allowed
            scope.closeAndSave({list: scope.newList});
          }
          event.preventDefault();
          event.stopPropagation();
        }
      };
    }
  };
}
angular.module('em.base').directive('listPicker', listPickerDirective);
