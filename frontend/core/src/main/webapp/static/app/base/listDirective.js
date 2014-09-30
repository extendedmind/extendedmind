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

 function listDirective(SwiperService, UISessionService) {
  return {
    require: '?^swiperSlide',
    restrict: 'A',
    controller: function($scope) {

      this.setItemAnimationActiveAndCall = function setItemAnimationActiveAndCall(item, itemAction, element) {
        // Item is going to be opened in editor. Defer possible leave animations in list.
        UISessionService.deferItemLeaveAnimation(element);
        $scope.registerEditorClosedCallback(itemEditDone, 'listDirective');

        // Resolve deferred animations for item.
        // TODO: Now only supports completed. Add support for other actions as well, deleted etc.
        function itemEditDone() {
          // If a user toggles checkbox on and off and state is eventually off,
          // filter has already fired list's leave callback. Reject leave animation here.
          if (item.completed) UISessionService.resolveItemLeaveAnimation(element, 'completed');
          else UISessionService.rejectItemLeaveAnimation(element, 'uncompleted');
          $scope.unregisterEditorClosedCallback('listDirective');
        }

        itemAction(item);
      };

      this.setItemLeftActionAnimationActiveAndCall = function setItemAnimationActiveAndCall(item, itemAction, isChecked, element) {
        if (UISessionService.getIsTaskChecking(element)) UISessionService.setTaskCheckingRejected(element);
        if (!isChecked) UISessionService.setTaskChecking(element);
        itemAction(item);
      };
    },
    link: function(scope, element, attrs, swiperSlideController) {
      scope.isAnimationActive = function() {
        return swiperSlideController ? swiperSlideController.isSlideActive() : true;
      };
    }
  };
}

listDirective['$inject'] = ['SwiperService', 'UISessionService'];
angular.module('em.base').directive('list', listDirective);
