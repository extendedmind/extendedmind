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
    controller: function($scope, $element) {

      // CALLBACK REGISTRATION

      var areaAboutToShrinkCallbacks = {};
      var areaAboutToGrowCallbacks = {};
      var areaResizeReadyCallbacks = {};

      this.registerDrawerHandleElement = function(handleElement, snapperSide){
        DrawerService.setHandleElement(handleElement, snapperSide);
      };

      this.registerAreaAboutToShrink = function(callback, feature){
        areaAboutToShrinkCallbacks[feature] = callback;
      };

      this.registerAreaAboutToGrow = function(callback, feature){
        areaAboutToGrowCallbacks[feature] = callback;
      };

      this.registerAreaResizeReady = function(callback, feature){
        areaResizeReadyCallbacks[feature] = callback;
      };

      // INITIALIZATION

      function setupMenuDrawer() {
        var settings = {
          element: $element[0],
          touchToDrag: $rootScope.columns === 1 ? true : false,
          disable: 'right', // use left only
          transitionSpeed: $rootScope.MENU_ANIMATION_SPEED / 1000,
          easing: 'ease-out',
          minDragDistance: 0,
          addBodyClasses: false,
          maxPosition: $rootScope.MENU_WIDTH
        };
        DrawerService.setupDrawer('left', settings);
      }

      function setupEditorDrawer() {
        var settings = {
          element: $element[0],
          touchToDrag: false,
          disable: 'left', // use right only
          transitionSpeed: $rootScope.EDITOR_ANIMATION_SPEED / 1000,
          easing: 'ease-out',
          minDragDistance: 0,
          addBodyClasses: false,
          minPosition: -$rootScope.currentWidth
        };
        DrawerService.setupDrawer('right', settings);
      }

      function calculateEditorMinPosition() {
        var minPosition = $element[0].offsetWidth > $rootScope.CONTAINER_MASTER_MAX_WIDTH ?
                          $rootScope.currentWidth - (($rootScope.currentWidth - $rootScope.CONTAINER_MASTER_MAX_WIDTH) / 2) :
                          $element[0].offsetWidth;
        return Math.floor(minPosition);
      }

      function setupDrawers(){
        setupMenuDrawer();
        setupEditorDrawer();
      }

      // Setup drawers again on every window resize event
      $scope.registerWindowResizedCallback(setupDrawers, 'drawerAisleDirective');

      // Initialize everyting
      setupMenuDrawer();
      DrawerService.registerOpenedCallback('left', menuDrawerOpened, 'drawerAisleDirective');
      DrawerService.registerClosedCallback('left', menuDrawerClosed, 'drawerAisleDirective');
      DrawerService.registerHandleReleasedCallback('left', menuDrawerHandleReleased, 'drawerAisleDirective');
      DrawerService.registerOpenCallback('left', menuDrawerOpen, 'drawerAisleDirective');
      DrawerService.registerCloseCallback('left', menuDrawerClose, 'drawerAisleDirective');
      setupEditorDrawer();
      $element[0].firstElementChild.style.maxWidth = $rootScope.currentWidth + 'px';

      // MENU DRAWER CALLBACKS

      // Fires when open is called programmatically, i.e. menu button pressed
      function menuDrawerOpen() {
        var activeFeature = $scope.getActiveFeature();
        if ($rootScope.columns > 1 && areaAboutToShrinkCallbacks[activeFeature]){
          // There are more than one column, this means the aisle area is about to shrink the
          // same time as the menu opens
          var amount = DrawerService.getDrawerElement('left').offsetWidth;
          areaAboutToShrinkCallbacks[activeFeature](amount, 'left', $rootScope.MENU_ANIMATION_SPEED);
          $element[0].firstElementChild.style.maxWidth = $rootScope.currentWidth - amount + 'px';
        }
      }

      function partiallyVisibleDrawerAisleClicked(event){
        // Prevent event from reaching the swiper
        event.preventDefault();
        event.stopPropagation();
      }

      // Menu drawer animation is ready - menu is open
      function menuDrawerOpened(){
        var activeFeature = $scope.getActiveFeature();
        if ($rootScope.columns === 1) {
          // There is only one column, so we need to prevent any touching from
          // getting to the partially visible aisle.
          $element.bind('touchstart', partiallyVisibleDrawerAisleClicked, true);

          // make following happen inside angularjs event loop
          $scope.$evalAsync(function() {
            setAisleWebkitScrolling(false);
          });
        }else if (areaResizeReadyCallbacks[activeFeature]){
          // Execute callbacks to resize ready
          areaResizeReadyCallbacks[activeFeature]();
        }

      }

      // Fires when menu is closed programmatically, i.e. menu button pressed or tapToClose
      // called. This is triggered before any animation takes place.
      function menuDrawerClose() {
        var activeFeature = $scope.getActiveFeature();
        if ($rootScope.columns > 1){
          if (areaAboutToGrowCallbacks[activeFeature]){
            // There are more than one column, this means the aisle area is about to grow the
            // same time as the menu closes
            var amount = DrawerService.getDrawerElement('left').offsetWidth;
            areaAboutToGrowCallbacks[activeFeature](amount, 'left', $rootScope.MENU_ANIMATION_SPEED);
            $element[0].firstElementChild.style.maxWidth = $rootScope.currentWidth + 'px';
          }
          // We need to unbind the touching prevention as early as possible.
          $element.unbind('touchstart', partiallyVisibleDrawerAisleClicked, true);
        }
        if (DrawerService.isDraggingEnabled('left')) {
          // Menu drawer is closing, disable dragging for the duration of the animation.
          // This is enabled again later on.
          DrawerService.disableDragging('left');
        }
      }

      // Animation of menu drawer ready, menu now hidden.
      function menuDrawerClosed(){
        var activeFeature = $scope.getActiveFeature();
        if ($rootScope.columns === 1){
          // make following happen inside angularjs event loop
          $scope.$evalAsync(function() {
            setAisleWebkitScrolling(true);
          });
        }else if (areaResizeReadyCallbacks[activeFeature]){
          // Re-enable dragging
          DrawerService.enableDragging('left');

          // Execute callbacks to resize ready
          areaResizeReadyCallbacks[activeFeature]();
        }
      }

      // Enable swiping and disable sliding and vice versa when drawer
      // handle is released and animation starts.
      function menuDrawerHandleReleased(drawerDirection) {
        if (drawerDirection === 'closing' && $rootScope.columns === 1) {
          // Disable dragging for the short time that
          // the menu is animating
          DrawerService.disableDragging('left');
        } else if (drawerDirection === 'opening' && $rootScope.columns === 1) {
          // We need to unbind the touching prevention in this case as well, as
          // close() callback did not happen.
          $element.unbind('touchstart', partiallyVisibleDrawerAisleClicked, true);
        }
      }

      // HTML METHODS

      // CSS property -webkit-overflow-scrolling is not working if multiple elements are layered on top of each other,
      // e.g. with 3D transform method translate3d.
      // This happens when swiper slide not the first one and drawer menu is open - webkit scroll event is catched by swiper wrapper.
      var webkitScrolling = true;
      function setAisleWebkitScrolling(scrolling) {
        webkitScrolling = scrolling;
      }

      $scope.isAisleWebkitScrolling = function() {
        return webkitScrolling;
      };
    },
    link: function postLink(scope) {

      scope.$on('$destroy', function() {
        DrawerService.deleteDrawer('left');
        DrawerService.deleteDrawer('right');
      });
    }
  };
}
drawerAisleDirective['$inject'] = ['$rootScope', 'DrawerService'];
angular.module('em.base').directive('drawerAisle', drawerAisleDirective);
