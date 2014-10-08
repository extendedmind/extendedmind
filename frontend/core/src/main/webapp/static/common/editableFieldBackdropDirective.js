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

 function editableFieldBackdropDirective($rootScope) {
  return {
    restrict: 'A',
    controller: function($scope, $element) {
      $element.addClass('editable-field-backdrop');

      $scope.disableBackdrop = function disableBackdrop() {
        $element.addClass('backdrop-disable');
      };
      $scope.undisableBackdrop = function undisableBackdrop() {
        if ($element.hasClass('backdrop-disable')) {
          $element.removeClass('backdrop-disable');
          return true;
        }
      };
      $scope.showBackdrop = function showBackdrop() {
        $rootScope.backdropActive = true;
        $element.addClass('active swiper-no-swiping');
      };
      $scope.hideBackdrop = function hideBackdrop() {
        $rootScope.backdropActive = false;
        $element.removeClass('active swiper-no-swiping');
      };

      var clickEditableFieldMap = [];
      var preventBackdropBubbleClick;

      function backdropClicked() {
        if (preventBackdropBubbleClick) {
          // Event bubbled from undesired click. Do nothing.
          preventBackdropBubbleClick = false;
          return;
        }
        if (clickEditableFieldMap && clickEditableFieldMap.length > 0) {
          for (var i = 0, len = clickEditableFieldMap.length; i < len; i++) {
            if (!clickEditableFieldMap[i].clicked) {
              // Clicked elsewhere than editable field
              if (typeof clickEditableFieldMap[i].clickElsewhere === 'function')
                // Click elsewhere callback.
                // NOTE: use $apply because callback may not be inside scope.
                $scope.$apply(clickEditableFieldMap[i].clickElsewhere);
                return;
              } else {
              // reset clicked info
              clickEditableFieldMap[i].clicked = false;
            }
          }
        }
      }

      /*
      * Editable field clicked.
      *
      * Click event bubbles to backdrop where clicked information is used.
      */
      this.setEditableFieldClicked = function(id) {
        var editableField = clickEditableFieldMap.findFirstObjectByKeyValue('id', id);
        if (editableField)
          editableField.clicked = true;
      };

      /*
      * Start listening click events and register click elsewhere callback.
      */
      this.registerClickElsewhere = function(id, callback) {
        // Function called in the middle of a click event. It may be unsafe to stop event bubbling,
        // so prevent bubbling locally to backdrop click event.
        preventBackdropBubbleClick = event && event.type === 'click';

        $element[0].addEventListener('click', backdropClicked, false);

        var editableField = clickEditableFieldMap.findFirstObjectByKeyValue('id', id);
        if (editableField) {
          // Overwrite id's existing click elsewhere
          editableField.clickElsewhere = callback;
          return;
        }
        clickEditableFieldMap.push({
          id: id,
          clickElsewhere: callback
        });
      };
      this.unregisterClickElsewhere = function(id) {
        preventBackdropBubbleClick = false;
        $element[0].removeEventListener('click', backdropClicked, false);

        var editableFieldIndex = clickEditableFieldMap.findFirstIndexByKeyValue('id', id);
        if (editableFieldIndex !== undefined)
          clickEditableFieldMap.splice(editableFieldIndex, 1);
      };

      // Listen to transition end callbacks

      $scope.$on('$destroy', function() {
        $rootScope.backdropActive = false;
      });
    }
  };
}
editableFieldBackdropDirective['$inject'] = ['$rootScope'];
angular.module('common').directive('editableFieldBackdrop', editableFieldBackdropDirective);
