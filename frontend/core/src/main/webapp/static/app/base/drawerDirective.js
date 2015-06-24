/* Copyright 2013-2015 Extended Mind Technologies Oy
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

 function drawerDirective($rootScope, DrawerService) {
  return {
    restrict: 'A',
    controller: function() {
      // CALLBACK REGISTRATION

      var areaResizeReadyCallbacks = {};

      this.registerAreaResizeReady = function(callback, id) {
        areaResizeReadyCallbacks[id] = callback;
      };

      this.unregisterAreaResizeReady = function(id) {
        delete areaResizeReadyCallbacks[id];
      };

      // GLOBAL FUNCTIONS
      this.disableEditorDrawerAndResetPosition = function() {
        DrawerService.disableDragging('right');
        DrawerService.resetPosition('right');
      };

      this.enableEditorDrawer = function() {
        DrawerService.enableDragging('right');
      };

      DrawerService.registerOpenedCallback('left', menuDrawerOpened, 'drawerDirective');
      DrawerService.registerClosedCallback('left', menuDrawerClosed, 'drawerDirective');

      /*
      * Menu drawer animation is ready - menu is open.
      */
      function menuDrawerOpened() {
        if ($rootScope.columns === 3) executeAreaResizeReadyCallbacks();
      }

      /*
      * Animation of menu drawer ready, menu now hidden.
      */
      function menuDrawerClosed() {
        if ($rootScope.columns === 3) executeAreaResizeReadyCallbacks();
      }

      function executeAreaResizeReadyCallbacks() {
        for (var id in areaResizeReadyCallbacks) {
          if (areaResizeReadyCallbacks.hasOwnProperty(id)) areaResizeReadyCallbacks[id]();
        }
      }

    },
    link: function postLink(scope, element, attrs) {
      DrawerService.setDrawerElement(attrs.drawer, element[0]);
    }
  };
}
drawerDirective['$inject'] = ['$rootScope', 'DrawerService'];
angular.module('em.base').directive('drawer', drawerDirective);
