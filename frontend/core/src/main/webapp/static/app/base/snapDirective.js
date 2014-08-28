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

 function snapDirective($rootScope, SnapService) {
  return {
    restrict: 'A',
    controller: function($scope, $element) {

      // MENU TOGGLE

      $scope.toggleMenu = function toggleMenu() {
        if (SnapService.isSnapperClosed('left')) $scope.setIsWebkitScrolling(false);
        SnapService.toggle('left');
      };

      $scope.toggleUnstickyMenu = function toggleUnstickyMenu() {
        if (!SnapService.getIsSticky()) SnapService.toggle('left');
      };

      $scope.openEditor = function() {
        $scope.setIsWebkitScrolling(false);
        SnapService.toggle('right');
      };
      $scope.closeEditor = function() {
        $scope.setIsWebkitScrolling(true);
        SnapService.toggle('right');
      };

      this.registerSnapDirective = function(element, snapperSide){
        SnapService.setDraggerElement(element, snapperSide);
      }
    },
    link: function postLink(scope, element, attrs, featureContainerController) {

      function initializeMenu() {
        var settings = {
          element: element[0],
          touchToDrag: true,
          disable: 'right', // use left only
          transitionSpeed: 0.2,
          minDragDistance: 0,
          addBodyClasses: false
        };

        SnapService.createSnapper(settings, 'left');
      }

      function calculateEditorMinPosition() {
        var minPosition = element[0].offsetWidth > 568 ? $rootScope.currentWidth - (($rootScope.currentWidth - 568) / 2) : element[0].offsetWidth;
        return minPosition;
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
        SnapService.createSnapper(settings, 'right');
      }

      function initializeSnap(){
        if ($rootScope.isMobile){
          SnapService.toggleSnappersSticky(false);
        }else{
          SnapService.toggleSnappersSticky(true);
        }
        initializeMenu();
        initializeEditor();
      }
      // Reinitialize on every window resize event
      scope.registerWindowResizedCallback(initializeSnap, 'snapDirective');

      // Initialize everything
      initializeSnap();

      scope.$on('$destroy', function() {
        SnapService.deleteSnapper('left');
        SnapService.deleteSnapper('right');
      });
    }
  };
}
snapDirective['$inject'] = ['$rootScope', 'SnapService'];
angular.module('em.main').directive('snap', snapDirective);
