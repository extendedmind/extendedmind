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

 function editableFieldBackdropDirective() {
  return {
    restrict: 'A',
    controller: ['$scope', '$element', function($scope, $element) {
      $element.addClass('editable-field-backdrop');

      var containerInfos = [];
      var preventBackdropBubbleClick, preventContainerBubbleClick;
      var backdropActive;

      this.registerContainer = function(id, deactivateFn){
        var containerInfo = containerInfos.findFirstObjectByKeyValue('id', id);
        if (containerInfo) {
          // Overwrite id's existing values
          containerInfo.deactivate = deactivateFn;
          return;
        }
        containerInfos.push({
          id: id,
          deactivate: deactivateFn
        });
      };

      this.unregisterContainer = function(id) {
        var containerIndex = containerInfos.findFirstIndexByKeyValue('id', id);
        if (containerIndex !== undefined){
          containerInfos.splice(containerIndex, 1);
        }
      };

      function backdropClicked() {

        if (preventBackdropBubbleClick) {
          if (preventBackdropBubbleClick > Date.now() - 600){
            // Event bubbled from undesired click less than 600ms ago. Do nothing.
            preventBackdropBubbleClick = false;
            return;
          }
          preventBackdropBubbleClick = false;
        }

        if (containerInfos && containerInfos.length > 0) {

          // First check that click did not hit one of the active containers
          var foundActiveClicked = false;
          for (var i = 0, len = containerInfos.length; i < len; i++) {
            if (containerInfos[i].clicked && containerInfos[i].active) {
              // reset clicked info
              containerInfos[i].clicked = false;
              foundActiveClicked = true;
            }
          }
          if (foundActiveClicked) return;

          for (var j = 0, jLen = containerInfos.length; j < jLen; j++) {
            if (containerInfos[j] && (!containerInfos[j].clicked && containerInfos[j].active)) {
              // Clicked elsewhere than container for an active container, deactivate container.
              // NOTE: Make sure container is not removed same time as looping containers.
              containerInfos[j].deactivate();
            }
          }
        }
      }

      this.activateContainer = function (id, blurBackdrop) {
        if (event && (event.type === 'click' || event.type === 'focus')){
          // Function called in the middle of a click event.
          // NOTE:  It may be unsafe to stop event bubbling, so prevent bubbling locally to backdrop click
          //        event. event.stopPropagation() would be more reliable though if we were sure this
          //        function is not and will not be depended on click.
          preventBackdropBubbleClick = event.timeStamp;
          preventContainerBubbleClick = event.timeStamp;
        }

        // activate container
        var containerInfo = containerInfos.findFirstObjectByKeyValue('id', id);
        if (containerInfo) containerInfo.active = true;

        // activate backdrop
        $element[0].addEventListener('click', backdropClicked, false);
        backdropActive = true;
        $element.addClass('active');

        if (blurBackdrop) {
          // Add blur class to first child.
          $element[0].firstElementChild.classList.add('blur');
        }
      };

      this.deactivateContainer = function(id) {
        preventBackdropBubbleClick = false;
        preventContainerBubbleClick = false;

        // mark container info deactivated
        var containerInfo = containerInfos.findFirstObjectByKeyValue('id', id);
        if (containerInfo) containerInfo.active = false;

        // deactivate backdrop
        if (backdropActive){
          $element[0].removeEventListener('click', backdropClicked, false);
          backdropActive = false;
          $element.removeClass('active');
          $element[0].firstElementChild.classList.remove('blur');
        }
      };

      /*
      * Editable field container clicked.
      *
      * Click event bubbles to backdrop where clicked information is used.
      */
      this.notifyContainerClicked = function(id) {
        if (preventContainerBubbleClick) {
          if (preventContainerBubbleClick > Date.now() - 400){
            // Event bubbled from undesired click less than 400ms ago. Do nothing.
            preventContainerBubbleClick = false;
            return;
          }
          preventContainerBubbleClick = false;
        }

        var containerInfo = containerInfos.findFirstObjectByKeyValue('id', id);
        if (containerInfo) {
          containerInfo.clicked = true;
        }
      };
    }]
  };
}
angular.module('common').directive('editableFieldBackdrop', editableFieldBackdropDirective);
