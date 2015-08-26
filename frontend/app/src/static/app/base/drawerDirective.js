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
    controller: function($scope) {
      // CALLBACK REGISTRATION

      var areaAboutToShrinkCallbacks = {};
      var areaAboutToGrowCallbacks = {};
      var areaResizeReadyCallbacks = {};
      var areaResizeCallbacks = {};

      this.registerAreaAboutToShrink = function(callback, id) {
        areaAboutToShrinkCallbacks[id] = callback;
      };
      this.registerAreaAboutToGrow = function(callback, id) {
        areaAboutToGrowCallbacks[id] = callback;
      };
      this.registerAreaResizeReady = function(callback, id) {
        areaResizeReadyCallbacks[id] = callback;
      };
      this.registerAreaResizeCallback = function(callback, id) {
        areaResizeCallbacks[id] = callback;
      };
      this.unregisterAreaAboutToShrink = function(id) {
        delete areaAboutToShrinkCallbacks[id];
      };
      this.unregisterAreaAboutToGrow = function(id) {
        delete areaAboutToGrowCallbacks[id];
      };
      this.unregisterAreaResizeReady = function(id) {
        delete areaResizeReadyCallbacks[id];
      };
      this.unregisterAreaResizeCallback = function(id) {
        delete areaResizeCallbacks[id];
      };

      // GLOBAL FUNCTIONS
      this.disableEditorDrawerAndResetPosition = function() {
        DrawerService.disableDragging('right');
        DrawerService.resetPosition('right');
      };

      this.enableEditorDrawer = function() {
        DrawerService.enableDragging('right');
      };

      DrawerService.registerOnOpenCallback('left', menuDrawerOpen, 'drawerDirective');
      DrawerService.registerOnCloseCallback('left', menuDrawerClose, 'drawerDirective');
      DrawerService.registerOnExpandCallback('right', editorDrawerExpand, 'drawerDirective');
      DrawerService.registerOnExpandResetCallback('right', editorDrawerExpandReset, 'drawerDirective');
      DrawerService.registerOpenedCallback('left', menuDrawerOpened, 'drawerDirective');
      DrawerService.registerClosedCallback('left', menuDrawerClosed, 'drawerDirective');

      /*
      * Fires when open is called programmatically, i.e. menu button pressed.
      */
      function menuDrawerOpen() {
        if ($rootScope.columns === 3 && DrawerService.isOpen('right')) {
          for (var id in areaAboutToShrinkCallbacks) {
            if (areaAboutToShrinkCallbacks.hasOwnProperty(id)) areaAboutToShrinkCallbacks[id]();
          }
        }
      }

      /*
      * Fires when menu is closed programmatically, i.e. menu button pressed or tapToClose called.
      * This is triggered before any animation takes place.
      */
      function menuDrawerClose() {
        if ($rootScope.columns === 3 && DrawerService.isOpen('right')) {
          for (var id in areaAboutToGrowCallbacks) {
            if (areaAboutToGrowCallbacks.hasOwnProperty(id)) areaAboutToGrowCallbacks[id]();
          }
        }
      }

      /*
      * Menu drawer animation is ready - menu is open.
      */
      function menuDrawerOpened() {
        if ($rootScope.columns === 3 && DrawerService.isOpen('right')) {
          executeAreaResizeReadyCallbacks();
          $scope.$broadcast('elastic:adjust');
        }
      }

      /*
      * Animation of menu drawer ready, menu now hidden.
      */
      function menuDrawerClosed() {
        if ($rootScope.columns === 3 && DrawerService.isOpen('right')) {
          executeAreaResizeReadyCallbacks();
          $scope.$broadcast('elastic:adjust');
        }
      }

      function editorDrawerExpand() {
        executeAreaResizeCallbacks();
        $scope.$broadcast('elastic:adjust');
      }

      function editorDrawerExpandReset() {
        executeAreaResizeCallbacks();
        $scope.$broadcast('elastic:adjust');
      }

      function executeAreaResizeReadyCallbacks() {
        for (var id in areaResizeReadyCallbacks) {
          if (areaResizeReadyCallbacks.hasOwnProperty(id)) areaResizeReadyCallbacks[id]();
        }
      }

      function executeAreaResizeCallbacks() {
        for (var id in areaResizeCallbacks) {
          if (areaResizeCallbacks.hasOwnProperty(id)) areaResizeCallbacks[id]();
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
