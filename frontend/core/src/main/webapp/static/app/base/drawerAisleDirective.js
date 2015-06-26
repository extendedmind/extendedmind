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

/*
* Handle aisle background animation classes here.
* NOTE: Editor open animation slows down after first open, which is probably why animation is different for
*       the first time vs. the rest.
*/
function drawerAisleDirective($rootScope, DrawerService) {
  return {
    restrict: 'A',
    controller: ['$scope', '$element', function($scope, $element) {

      // CALLBACK REGISTRATION

      var areaAboutToShrinkCallbacks = {};
      var areaAboutToGrowCallbacks = {};
      var areaResizeReadyCallbacks = {};
      var areaResizeCallbacks = {};
      var areaMovedToNewPositionCallbacks = {};
      var areaMovedToInitialPositionCallbacks = {};

      var areaAboutToMoveToNewPositionCallbacks = {};
      var areaAboutToMoveToInitialPositionCallbacks = {};

      var areaAboutToHideCallbacks = {};
      var areaAboutToShowCallbacks = {};

      this.registerDrawerHandleElement = function(handleElement, drawerSide) {
        DrawerService.setHandleElement(drawerSide, handleElement);
      };

      this.registerAreaAboutToShrink = function(callback, feature) {
        areaAboutToShrinkCallbacks[feature] = callback;
      };

      this.registerAreaAboutToGrow = function(callback, feature) {
        areaAboutToGrowCallbacks[feature] = callback;
      };

      this.registerAreaResizeReady = function(callback, feature) {
        areaResizeReadyCallbacks[feature] = callback;
      };

      this.registerAreaResizeCallback = function(callback, feature) {
        areaResizeCallbacks[feature] = {callback: callback};
      };

      this.registerAreaAboutToMoveToNewPosition = function(callback, feature) {
        areaAboutToMoveToNewPositionCallbacks[feature] = callback;
      };
      this.registerAreaAboutToMoveToInitialPosition = function(callback, feature) {
        areaAboutToMoveToInitialPositionCallbacks[feature] = callback;
      };

      this.registerAreaAboutToHide = function(callback, feature) {
        areaAboutToHideCallbacks[feature] = callback;
      };
      this.registerAreaAboutToShow = function(callback, feature) {
        areaAboutToShowCallbacks[feature] = callback;
      };

      this.registerAreaMovedToNewPosition = function(callback, feature) {
        areaMovedToNewPositionCallbacks[feature] = callback;
      };
      this.registerAreaMovedToInitialPosition = function(callback, feature) {
        areaMovedToInitialPositionCallbacks[feature] = callback;
      };

      // INITIALIZATION

      function setupMenuDrawer() {
        var settings = {
          element: $element[0],
          touchToDrag: $rootScope.columns === 1,
          disable: 'right', // use left only
          transitionSpeed: $rootScope.MENU_ANIMATION_SPEED / 1000,
          easing: 'ease-out',
          minDragDistance: 10,
          addBodyClasses: false,
          tapToClose: $rootScope.columns === 1,
          maxPosition: $rootScope.MENU_WIDTH,
          moveAisle: true
        };
        DrawerService.setupDrawer('left', settings);
      }

      function setupEditorDrawer() {
        var settings = {
          element: $element[0],
          overrideListeningElement: true,
          touchToDrag: $rootScope.columns === 1,
          tapToClose: false,
          disable: 'left', // use right only
          transitionSpeed: $rootScope.EDITOR_ANIMATION_SPEED / 1000,
          easing: 'ease-out',
          minDragDistance: 0,
          addBodyClasses: false,
          moveAisle: $rootScope.columns !== 3
        };
        if ($rootScope.columns === 3)
          settings.minPosition = DrawerService.isOpen('left') ? $rootScope.MENU_WIDTH : 0;
        else
          settings.minPosition = -$rootScope.currentWidth;

        DrawerService.setupDrawer('right', settings);
      }

      var setAreaResizeNeeded = function() {
        for (var area in areaResizeCallbacks) {
          if (areaResizeCallbacks.hasOwnProperty(area)) {
            var areaResize = areaResizeCallbacks[area];
            areaResize.resize = true;
          }
        }
      }.debounce(250);  // Fire once every quarter of a second.

      function resizeAisleAndSetupAndResizeDrawers() {
        function resizeAisleContent() {
          var newWidth = $rootScope.currentWidth;
          if (DrawerService.isOpen('left')) {
            newWidth -= $rootScope.MENU_WIDTH;
          }
          $element[0].firstElementChild.style.maxWidth = newWidth + 'px';
        }

        if ($rootScope.columns === 1) {
          if (DrawerService.isOpen('right')) {
            // Editor drawer needs to be moved into correct position.
            DrawerService.setDrawerTranslate('right', -$rootScope.currentWidth);
          }
        } else if ($rootScope.columns === 2) {
          resizeAisleContent();
          if (DrawerService.isOpen('right')) {
            // Editor drawer needs to be moved into correct position.
            DrawerService.setDrawerTranslate('right', -$rootScope.currentWidth);
          }
        } else {
          if (DrawerService.isOpen('right')) calculateAisleAndEditorDrawerMaxWidthAndResize();
          else resizeAisleContent();
        }

        // Setup drawers again on every window resize event
        // TODO: Can these be set when $rootScope.columns changes, or at least debounced?
        setupMenuDrawer();
        setupEditorDrawer();
        setAreaResizeNeeded();
      }

      function isAreaResizeNeeded(feature) {
        if (areaResizeCallbacks[feature] && areaResizeCallbacks[feature].resize) {
          areaResizeCallbacks[feature].callback();
          areaResizeCallbacks[feature].resize = false;
        }
      }

      $scope.registerWindowResizedCallback(resizeAisleAndSetupAndResizeDrawers, 'drawerAisleDirective');
      $scope.registerResizeSwiperCallback(isAreaResizeNeeded);

      // Initialize everyting
      setupMenuDrawer();
      DrawerService.registerOpenedCallback('left', menuDrawerOpened, 'drawerAisleDirective');
      DrawerService.registerClosedCallback('left', menuDrawerClosed, 'drawerAisleDirective');
      DrawerService.registerAboutToOpenCallback('left', menuDrawerAboutToOpen, 'drawerAisleDirective');
      DrawerService.registerAboutToCloseCallback('left', menuDrawerAboutToClose, 'drawerAisleDirective');
      DrawerService.registerOnOpenCallback('left', menuDrawerOpen, 'drawerAisleDirective');
      DrawerService.registerOnCloseCallback('left', menuDrawerClose, 'drawerAisleDirective');

      setupEditorDrawer();
      DrawerService.registerOpenedCallback('right', editorDrawerOpened, 'drawerAisleDirective');
      DrawerService.registerClosedCallback('right', editorDrawerClosed, 'drawerAisleDirective');
      DrawerService.registerAboutToCloseCallback('right', editorDrawerAboutToClose, 'drawerAisleDirective');
      DrawerService.registerOnOpenCallback('right', editorDrawerOpen, 'drawerAisleDirective');
      DrawerService.registerOnCloseCallback('right', editorDrawerClose, 'drawerAisleDirective');
      if ($rootScope.columns !== 1) {
        // Set initial max width so that the width animation works at the first time as well.
        $element[0].firstElementChild.style.maxWidth = $rootScope.currentWidth + 'px';
      }

      // MENU DRAWER CALLBACKS

      var partiallyVisibleTouchTimer;
      function attachAndFailsafeRemovePartiallyVisibleTouch() {
        $element[0].addEventListener('touchstart', partiallyVisibleDrawerAisleClicked, false);
        $rootScope.contentPartiallyVisible = true;

        if (partiallyVisibleTouchTimer) {
          clearTimeout(partiallyVisibleTouchTimer);
          partiallyVisibleTouchTimer = undefined;
        }

        partiallyVisibleTouchTimer = setTimeout(function() {
          $element[0].removeEventListener('touchstart', partiallyVisibleDrawerAisleClicked, false);
          $rootScope.contentPartiallyVisible = false;
        }, 1000);
      }

      /*
      * Prevent clicks to elements etc. when menu is open.
      */
      function partiallyVisibleDrawerAisleClicked() {
        event.preventDefault();
        event.stopPropagation();
      }

      /*
      * Fires when open is called programmatically, i.e. menu button pressed.
      */
      function menuDrawerOpen() {
        var activeFeature = $scope.getActiveFeature();

        if ($rootScope.columns === 1) {
          if (areaAboutToMoveToNewPositionCallbacks[activeFeature])
            areaAboutToMoveToNewPositionCallbacks[activeFeature]();
          // There is only one column,
          // so we need to prevent any touching from getting to the partially visible aisle.
          $element[0].addEventListener('touchstart', partiallyVisibleDrawerAisleClicked, false);
          $rootScope.contentPartiallyVisible = true;
        } else {
          // There are more than one column, this means the aisle area is about to shrink the
          // same time as the menu opens.
          var shrinkDrawerAisleContent = function(amount) {
            var drawerAisleContent = $element[0].firstElementChild;
            drawerAisleContent.classList.add('animate-container-master');
            drawerAisleContent.style.maxWidth = $rootScope.currentWidth - amount + 'px';
            return true;
          };

          var drawerAisleContentShrinked;
          if ($rootScope.columns === 2) {
            drawerAisleContentShrinked = shrinkDrawerAisleContent($rootScope.MENU_WIDTH);
          } else if ($rootScope.columns === 3) {
            if (DrawerService.isOpen('right')) {
              calculateAisleAndEditorDrawerMaxWidthAndResize();
            }
            else {
              drawerAisleContentShrinked = shrinkDrawerAisleContent($rootScope.MENU_WIDTH);
            }
          }
          if (areaAboutToShrinkCallbacks[activeFeature]) {
            areaAboutToShrinkCallbacks[activeFeature]($rootScope.MENU_WIDTH, 'left',
                                                      $rootScope.MENU_ANIMATION_SPEED,
                                                      drawerAisleContentShrinked);
          }
        }
      }

      /*
      * Disable swiping when drawer handle is released and about to open and animation starts.
      */
      function menuDrawerAboutToOpen() {
        if ($rootScope.columns === 1) {
          var activeFeature = $scope.getActiveFeature();
          if (areaAboutToMoveToNewPositionCallbacks[activeFeature]) {
            areaAboutToMoveToNewPositionCallbacks[activeFeature]();
          }
          attachAndFailsafeRemovePartiallyVisibleTouch();
        }
      }

      /*
      * Menu drawer animation is ready - menu is open.
      */
      function menuDrawerOpened() {
        var activeFeature = $scope.getActiveFeature();

        if ($rootScope.columns === 1) {
          // Re-enable dragging
          DrawerService.enableDragging('left');
          if (areaMovedToNewPositionCallbacks[activeFeature]) {
            areaMovedToNewPositionCallbacks[activeFeature]();
          }
          // There is only one column,
          // so we need to prevent any touching from getting to the partially visible aisle.
          $element[0].addEventListener('touchstart', partiallyVisibleDrawerAisleClicked, false);
          $rootScope.contentPartiallyVisible = true;
        }
        else {
          $element[0].firstElementChild.classList.remove('animate-container-master');

          if (areaResizeReadyCallbacks[activeFeature]) {
            // Execute callbacks to resize ready
            areaResizeReadyCallbacks[activeFeature]();
          }
        }
      }

      /*
      * Fires when menu is closed programmatically, i.e. menu button pressed or tapToClose called.
      * This is triggered before any animation takes place.
      */
      function menuDrawerClose() {
        var activeFeature = $scope.getActiveFeature();

        if ($rootScope.columns === 1) {
          // Menu drawer is closing, disable dragging for the duration of the animation.
          // This is enabled again later on.
          DrawerService.disableDragging('left');
          if (areaAboutToMoveToInitialPositionCallbacks[activeFeature])
            areaAboutToMoveToInitialPositionCallbacks[activeFeature]();
        } else {
          // There are more than one column, this means the aisle area is about to grow the
          // same time as the menu closes
          var growDrawerAisleContent = function() {
            var drawerAisleContent = $element[0].firstElementChild;
            drawerAisleContent.classList.add('animate-container-master');
            drawerAisleContent.style.maxWidth = $rootScope.currentWidth + 'px';
            return true;
          };

          var drawerAisleContentGrowed;
          if ($rootScope.columns === 2) {
            drawerAisleContentGrowed = growDrawerAisleContent();
          } else if ($rootScope.columns === 3) {
            if (DrawerService.isOpen('right')) {
              calculateAisleAndEditorDrawerMaxWidthAndResize();
            }
            else {
              drawerAisleContentGrowed = growDrawerAisleContent();
            }
          }
          if (areaAboutToGrowCallbacks[activeFeature]) {
            areaAboutToGrowCallbacks[activeFeature]($rootScope.MENU_WIDTH, 'left',
                                                    $rootScope.MENU_ANIMATION_SPEED,
                                                    drawerAisleContentGrowed);
          }
        }
      }

      /*
      * Enable swiping and disable sliding when drawer handle is released and about to close
      * and animation starts.
      */
      function menuDrawerAboutToClose() {
        var activeFeature = $scope.getActiveFeature();
        if ($rootScope.columns === 1) {
          // Disable dragging for the short time that the menu is animating
          DrawerService.disableDragging('left');
          if (areaAboutToMoveToInitialPositionCallbacks[activeFeature]) {
            areaAboutToMoveToInitialPositionCallbacks[activeFeature]();
          }
        }
      }

      /*
      * Animation of menu drawer ready, menu now hidden.
      */
      function menuDrawerClosed() {
        var activeFeature = $scope.getActiveFeature();

        if ($rootScope.columns === 1) {
          if (areaMovedToInitialPositionCallbacks[activeFeature])
            areaMovedToInitialPositionCallbacks[activeFeature]();
          // Re-enable dragging
          DrawerService.enableDragging('left');
          // Re-enable touching in fully visible aisle.
          $element[0].removeEventListener('touchstart', partiallyVisibleDrawerAisleClicked, false);
          $rootScope.contentPartiallyVisible = false;
        }
        else {
          $element[0].firstElementChild.classList.remove('animate-container-master');

          if (areaResizeReadyCallbacks[activeFeature]) {
            // Execute callbacks to resize ready
            areaResizeReadyCallbacks[activeFeature]();
          }
        }
      }

      /*
      * Fires when open is called programmatically, i.e. item is pressed.
      */
      function editorDrawerOpen() {
        var activeFeature = $scope.getActiveFeature();  // TODO: Move.
        if ($rootScope.columns === 1) {
          // Animation starts. Add .editor-animating.
          $element[0].firstElementChild.classList.toggle('editor-animating', true);
          if (areaAboutToHideCallbacks[activeFeature]) areaAboutToHideCallbacks[activeFeature]();
          $element[0].addEventListener('touchstart', partiallyVisibleDrawerAisleClicked, false);
        } else if ($rootScope.columns === 3) {
          calculateAisleAndEditorDrawerMaxWidthAndResize();
        }
      }

      /*
      * TODO: Move editor drawer handling to drawerDirective
      */
      function calculateAisleAndEditorDrawerMaxWidthAndResize() {
        var availableWidth = $rootScope.currentWidth;
        var aisleWidth, aisleContentWidth, editorDrawerWidth;

        var menuOpeningOrOpen = DrawerService.isOpening('left') || (DrawerService.isOpen('left') &&
                                                                    !DrawerService.isClosing('left'));

        if (menuOpeningOrOpen) {
          // Decrease the width to make room for the menu.
          availableWidth -= $rootScope.MENU_WIDTH;
        }

        var availableMaxWidth = $rootScope.CONTAINER_MASTER_MAX_WIDTH + $rootScope.EDITOR_MAX_WIDTH;
        if (availableWidth > availableMaxWidth) {
          if (menuOpeningOrOpen) {
            // Expand aisle to the remaining width.
            aisleWidth = availableWidth - $rootScope.EDITOR_MAX_WIDTH;
          } else {
            aisleWidth = $rootScope.CONTAINER_MASTER_MAX_WIDTH;
          }
          aisleContentWidth = $rootScope.CONTAINER_MASTER_MAX_WIDTH;
          editorDrawerWidth = $rootScope.EDITOR_MAX_WIDTH;
        } else {
          // Available width is narrow, divide available width in half.
          aisleWidth = aisleContentWidth = editorDrawerWidth = availableWidth / 2;
        }

        $element[0].style.maxWidth = aisleWidth + 'px';
        $element[0].firstElementChild.style.maxWidth = aisleContentWidth + 'px';
        var editorDrawerElement = DrawerService.getDrawerElement('right');
        if (editorDrawerElement) editorDrawerElement.style.maxWidth = editorDrawerWidth + 'px';
      }

      function editorDrawerOpened() {
        if ($rootScope.columns === 1) {
          // Animation done. Remove .editor-animating and add .editor-open.
          $element[0].firstElementChild.classList.toggle('editor-animating', false);
          $element[0].firstElementChild.classList.toggle('editor-open', true);
        } else if ($rootScope.columns === 3) {
          var activeFeature = $scope.getActiveFeature();

          if (areaResizeReadyCallbacks[activeFeature]) {
            // Execute callbacks to resize ready
            areaResizeReadyCallbacks[activeFeature]();
          }
          setAreaResizeNeeded();  // Make sure area is eventually resized.
        }
      }

      /*
      * Enable swiping for underlying swiper when drawer handle is released and about to close
      * and animation starts.
      */
      function editorDrawerAboutToClose() {
        var activeFeature = $scope.getActiveFeature();
        if ($rootScope.columns === 1) {
          // Animation starts. Add .editor-animating.
          $element[0].firstElementChild.classList.toggle('editor-animating', true);
          if (areaAboutToShowCallbacks[activeFeature]) areaAboutToShowCallbacks[activeFeature]();
          attachAndFailsafeRemovePartiallyVisibleTouch();
        }
      }

      /*
      * Fires when editor is closed programmatically, i.e. save button pressed.
      * This is triggered before any animation takes place.
      */
      function editorDrawerClose() {
        var activeFeature = $scope.getActiveFeature();
        if ($rootScope.columns === 1) {
          // Animations starts. Add .editor-animating.
          $element[0].firstElementChild.classList.toggle('editor-animating', true);
          // Editor drawer is closing, enable swiping for underlying swiper.
          if (areaAboutToShowCallbacks[activeFeature]) areaAboutToShowCallbacks[activeFeature]();
          $element[0].removeEventListener('touchstart', partiallyVisibleDrawerAisleClicked, false);
        } else if ($rootScope.columns === 3) {
          $element[0].style.removeProperty('max-width');  // Restore width.

          var drawerAisleContentRestoredWidth = $rootScope.currentWidth;
          if (DrawerService.isOpen('left')) drawerAisleContentRestoredWidth -= $rootScope.MENU_WIDTH;

          $element[0].firstElementChild.style.maxWidth = drawerAisleContentRestoredWidth + 'px';

          var editorDrawerElement = DrawerService.getDrawerElement('right');
          if (editorDrawerElement) editorDrawerElement.style.removeProperty('max-width'); // Restore width
        }
      }

      function editorDrawerClosed() {
        if ($rootScope.columns === 1) {
          // Animation done. Remove .editor-animating and remove .editor-open.
          $element[0].firstElementChild.classList.toggle('editor-animating', false);
          $element[0].firstElementChild.classList.toggle('editor-open', false);
          $element[0].removeEventListener('touchstart', partiallyVisibleDrawerAisleClicked, false);
        } else if ($rootScope.columns === 3) {
          var activeFeature = $scope.getActiveFeature();

          if (areaResizeReadyCallbacks[activeFeature]) {
            // Execute callbacks to resize ready
            areaResizeReadyCallbacks[activeFeature]();
          }
          setAreaResizeNeeded();  // Make sure area is eventually resized.
        }
      }

      $scope.$on('$destroy', function() {
        $element[0].removeEventListener('touchstart', partiallyVisibleDrawerAisleClicked, false);
      });

    }],
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
