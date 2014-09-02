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

 function drawerAisleDirective($rootScope, DrawerService) {
  return {
    restrict: 'A',
    controller: function($scope) {

      this.registerDrawerHandleElement = function(element, snapperSide){
        DrawerService.setHandleElement(element, snapperSide);
      };

    },
    link: function postLink(scope, element) {

      function initializeMenu() {
        var settings = {
          element: element[0],
          touchToDrag: true,
          disable: 'right', // use left only
          transitionSpeed: 0.2,
          minDragDistance: 0,
          addBodyClasses: false
        };

        DrawerService.createSnapper(settings, 'left');
      }

      var MASTER_CONTAINER_MAX_WIDTH = 567;
      function calculateEditorMinPosition() {
        var minPosition = element[0].offsetWidth > MASTER_CONTAINER_MAX_WIDTH ?
               $rootScope.currentWidth - (($rootScope.currentWidth - MASTER_CONTAINER_MAX_WIDTH) / 2) : element[0].offsetWidth;
        return Math.floor(minPosition);
      }

      function initializeEditor() {
        /* jshint -W008 */

        var settings = {
          element: element[0],
          touchToDrag: false,
          disable: 'left', // use right only
          transitionSpeed: .3,
          minDragDistance: 0,
          addBodyClasses: false,
          minPosition: -calculateEditorMinPosition()
        };
        DrawerService.createSnapper(settings, 'right');
      }

      function initializeSnap(){
        if ($rootScope.isMobile){
          DrawerService.toggleSnappersSticky(false);
        }else{
          DrawerService.toggleSnappersSticky(true);
        }
        initializeMenu();
        initializeEditor();
      }
      // Reinitialize on every window resize event
      scope.registerWindowResizedCallback(initializeSnap, 'drawerAisleDirective');

      // Initialize everything
      initializeSnap();

      scope.$on('$destroy', function() {
        DrawerService.deleteSnapper('left');
        DrawerService.deleteSnapper('right');
      });
    }
  };
}
drawerAisleDirective['$inject'] = ['$rootScope', 'DrawerService'];
angular.module('em.main').directive('drawerAisle', drawerAisleDirective);
