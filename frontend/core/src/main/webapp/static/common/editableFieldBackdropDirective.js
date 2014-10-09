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

      var containerInfos = [];
      var preventBackdropBubbleClick;

      this.registerContainer = function(id, deActivateFn, callback){
        var containerInfo = containerInfos.findFirstObjectByKeyValue('id', id);
        if (containerInfo) {
          // Overwrite id's existing values
          containerInfo.deActivate = deActivateFn;
          containerInfo.clickedElsewhere = callback;
          return;
        }
        containerInfos.push({
          id: id,
          deActivate: deActivateFn,
          clickedElsewhere: callback
        });
      }

      this.unregisterContainer = function(id) {
        var containerIndex = containerInfos.findFirstIndexByKeyValue('id', id);
        if (containerIndex !== undefined){
          containerInfos.splice(containerIndex, 1);
        }
      };

      function backdropClicked() {
        if (preventBackdropBubbleClick) {
          // Event bubbled from undesired click. Do nothing.
          preventBackdropBubbleClick = false;
          return;
        }
        if (containerInfos && containerInfos.length > 0) {
          for (var i = 0, len = containerInfos.length; i < len; i++) {
            if (!containerInfos[i].clicked) {
              if (containerInfos[i].active) {
                // Clicked elsewhere than container for an active container, deactivate container
                containerInfos[i].deActivate();
                if (typeof containerInfos[i].clickedElsewhere === 'function'){
                  // Click elsewhere callback.
                  // NOTE: use $apply because callback may not be inside scope.
                  $scope.$apply(containerInfos[i].clickedElsewhere);
                }
              }
            }else {
              // reset clicked info
              containerInfos[i].clicked = false;
            }
          }
        }
      }

      this.activateContainer = function (id) {
        // Function called in the middle of a click event. It may be unsafe to stop event bubbling,
        // so prevent bubbling locally to backdrop click event.
        preventBackdropBubbleClick = event && event.type === 'click' || event.type === 'focus';

        // activate container
        var containerInfo = containerInfos.findFirstObjectByKeyValue('id', id);
        if (containerInfo) containerInfo.active = true;

        // activate backdrop
        $element[0].addEventListener('click', backdropClicked, false);
        $rootScope.backdropActive = true;
        $element.addClass('active');
      };

      this.deActivateContainer = function(id) {
        preventBackdropBubbleClick = false;

        // mark container info deactivated
        var containerInfo = containerInfos.findFirstObjectByKeyValue('id', id);
        if (containerInfo) containerInfo.active = false;

        // deactivate backdrop
        if ($rootScope.backdropActive){
          $element[0].removeEventListener('click', backdropClicked, false);
          $rootScope.backdropActive = false;
          $element.removeClass('active');
        }
      };

      /*
      * Editable field container clicked.
      *
      * Click event bubbles to backdrop where clicked information is used.
      */
      this.notifyContainerClicked = function(id) {
        var containerInfo = containerInfos.findFirstObjectByKeyValue('id', id);
        if (containerInfo)
          containerInfo.clicked = true;
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
