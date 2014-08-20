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

 function featureContainerDirective($rootScope, SnapService, SwiperService, UISessionService, UserSessionService) {
  return {
    restrict: 'A',
    controller: function($scope, $element) {

      var featureElements = {};
      var swiperElements = {};

      // COMMON FEATURE METHODS IN SCOPE

      $scope.getActiveFeature = function getActiveFeature() {
        return UISessionService.getCurrentFeatureName();
      };

      $scope.isFeatureActive = function isFeatureActive(feature) {
        return $scope.getActiveFeature() === feature;
      };

      $scope.hasFeatureFooter = function hasFeatureFooter() {
        if ($scope.isFeatureActive('tasks') ||
          $scope.isFeatureActive('notes') ||
          $scope.isFeatureActive('dashboard') ||
          $scope.isFeatureActive('archive') ||
          $scope.isFeatureActive('list'))
        {
          if (UserSessionService.getUIPreference('hideFooter') &&
            ($rootScope.packaging.endsWith('cordova') || $rootScope.packaging === 'devel'))
          {
            return false;
          } else {
            return true;
          }
        } else {
          return false;
        }
      };

      function resizeContent() {
        if ($rootScope.isDesktop) {
          var activeFeature = $scope.getActiveFeature();
          var swiperWrapperElement = swiperElements[activeFeature];

          var drawerMenu = document.getElementById('menu');
          var drawerMenuWidth = 0;
          if (drawerMenu) drawerMenuWidth = drawerMenu.offsetWidth; // http://stackoverflow.com/a/294273

          if (SnapService.isSnapperClosed('left')) {
            if (swiperWrapperElement) swiperWrapperTranslate('left');
            $element[0].style.maxWidth = $rootScope.currentWidth - drawerMenuWidth + 'px';
          }
          else if (SnapService.isSnapperOpen('left')) {
            if (swiperWrapperElement) swiperWrapperTranslate('right');
            $element[0].style.maxWidth = $rootScope.currentWidth + 'px';
          }
        }
        function swiperWrapperTranslate(direction) {
          swiperWrapperElement.style['webkitTransition'] = 'all ' + 0.2 + 's ' + 'ease';  // TODO: vendor prefixes
          var translateSwiperWrapperX = drawerMenuWidth / 2;

           // 568px + drawerMenuWidth (260px)
           if ($rootScope.currentWidth <= 828) {
            var contentNewWidth = $rootScope.currentWidth - drawerMenuWidth;
            var contentLeftSideWillShrink = (568 - contentNewWidth) / 2;
            translateSwiperWrapperX -= contentLeftSideWillShrink;
          }
          // http://stackoverflow.com/a/5574196
          if (direction === 'left') translateSwiperWrapperX = -Math.abs(translateSwiperWrapperX);
          SwiperService.setWrapperTranslate(activeFeature, translateSwiperWrapperX, 0, 0);
          toggleInactiveSwiperSlidesVisiblity('hidden', activeFeature);
        }
      }

      this.toggleInactiveSwiperSlidesVisiblityClass = function toggleInactiveSwiperSlidesVisiblityClass(visibilityValue, activeFeature) {
        toggleInactiveSwiperSlidesVisiblity(visibilityValue, activeFeature);
      };

      function toggleInactiveSwiperSlidesVisiblity(visibilityValue, activeFeature) {
        var swiperSlides = SwiperService.getSwiperSlides(activeFeature);
        if (swiperSlides) {
          for (var i = 0, len = swiperSlides.length; i < len; i++) {
            if (!swiperSlides[i].classList.contains('swiper-slide-active')) {
              if (swiperSlides[i].style.visibility !== visibilityValue) swiperSlides[i].style.visibility = visibilityValue;
            }
          }
        }
      }

      // MENU TOGGLE
      $scope.toggleMenu = function toggleMenu() {
        resizeContent();
        $scope.setIsWebkitScrolling(false);
        SnapService.toggle('left');
      };

      $scope.toggleUnstickyMenu = function toggleUnstickyMenu() {
        if (!SnapService.getIsSticky()) SnapService.toggle('left');
      };

      $scope.openOmnibarDrawer = function openOmnibarDrawer() {
        $scope.setIsWebkitScrolling(false);
        SnapService.toggle('right');
      };
      $scope.closeOmnibarDrawer = function closeOmnibarDrawer() {
        SnapService.toggle('right');
      };

      $scope.getFooterVisibilityClass = function getFooterVisibilityClass() {
        if (!$scope.hasFeatureFooter()) return 'hide-footer';
      };

      // UI SESSION SERVICE HOOKS

      var featureChangedCallback = function featureChangedCallback(name, data, state) {
        setFeatureContainerClass(name);
        if (featureElements[name]) {
          SnapService.setDraggerElements(featureElements[name].draggerElements);
        }

        if (!state) state = UISessionService.getFeatureState(name);
      };
      UISessionService.registerFeatureChangedCallback(featureChangedCallback, 'featureContainerDirective');
      if (!UISessionService.getCurrentFeatureName()) {
        if ($scope.onboardingInProgress) {
          UISessionService.changeFeature('inbox');
        } else {
          UISessionService.changeFeature('tasks');
        }
      } else {
        // Need to explicitly call feature change
        featureChangedCallback(UISessionService.getCurrentFeatureName());
      }

      // SWIPER SERVICE HOOKS

      var slideChangedCallback = function slideChangedCallback(activeSlidePath) {

        // Don't set to main slide path, if page slide path is already set
        if (!UISessionService.getFeatureState(UISessionService.getCurrentFeatureName()) ||
          !UISessionService.getFeatureState(UISessionService.getCurrentFeatureName()).startsWith(activeSlidePath))
        {
          UISessionService.setCurrentFeatureState(activeSlidePath);
        }
      };

      SwiperService.registerSlideChangeCallback(slideChangedCallback, 'tasks', 'featureContainerDirective');
      SwiperService.registerSlideChangeCallback(slideChangedCallback, 'tasks/home', 'featureContainerDirective');
      SwiperService.registerSlideChangeCallback(slideChangedCallback, 'notes', 'featureContainerDirective');
      SwiperService.registerSlideChangeCallback(slideChangedCallback, 'dashboard', 'featureContainerDirective');
      SwiperService.registerSlideChangeCallback(slideChangedCallback, 'archive', 'featureContainerDirective');

      // CALLBACK REGISTRATION

      this.registerSnapDrawerDragElement = function registerSnapDrawerDragElement(feature, element, snapperSide) {
        if ($scope.isFeatureActive(feature)) {
          SnapService.setDraggerElement(element, snapperSide);
        }
        if (!featureElements[feature]) featureElements[feature] = {};
        if (!featureElements[feature].draggerElements) featureElements[feature].draggerElements = {};
        featureElements[feature].draggerElements[snapperSide] = element;
      };
      this.unregisterSnapDrawerDragElement = function unregisterSnapDrawerDragElement(feature, snapperSide) {
        if (featureElements[feature] && featureElements[feature].draggerElements) delete featureElements[feature].draggerElements[snapperSide];
      };
      this.registerSwiperElement = function registerSwiperElement(feature, element) {
        swiperElements[feature] = element;
      };
      this.unregisterSwiperElement = function unregisterSwiperElement(feature) {
        delete swiperElements[feature];
      };

      // SET CORRECT CLASSES TO FEATURE CONTAINER ELEMENT

      setFeatureContainerClass($scope.getActiveFeature());

      // https://developer.mozilla.org/en-US/docs/Web/API/Element.classList
      function setFeatureContainerClass(feature) {
        if (feature === 'tasks' ||
          feature === 'notes' ||
          feature === 'dashboard' ||
          feature === 'archive' ||
          feature === 'list')
        {
          $element[0].classList.toggle('no-slides-container', false);
          $element[0].classList.toggle('slides-container', true);
        } else {
          $element[0].classList.toggle('no-slides-container', true);
          $element[0].classList.toggle('slides-container', false);
        }
      }
    },
    link: function postLink(scope, element, attrs, featureContainerController) {

      function initializeDrawerMenu() {
        var settings = {
          element: element[0].parentNode,
          touchToDrag: true,
          disable: 'right', // use left only
          transitionSpeed: 0.2,
          minDragDistance: 0,
          addBodyClasses: false
        };

        SnapService.createSnapper(settings, 'left');
        SnapService.registerAnimatedCallback(snapDrawerAnimated, 'left', 'featureContainerDirective');
        SnapService.registerEndCallback(snapperPaneReleased, 'left');
        SnapService.registerCloseCallback(snapperClosed, 'left');
      }

      function calculateOmnibarDrawerContainerMinPosition() {
        var minPosition = element[0].parentNode.offsetWidth > 568 ? $rootScope.currentWidth - (($rootScope.currentWidth - 568) / 2) : element[0].parentNode.offsetWidth;
        return minPosition;
      }

      function initializeOmnibar() {
        /* jshint -W008 */

        var settings = {
          element: element[0].parentNode,
          touchToDrag: false,
          disable: 'left', // use right only
          transitionSpeed: .3,
          minDragDistance: 0,
          addBodyClasses: false,
          minPosition: -calculateOmnibarDrawerContainerMinPosition()
        };
        SnapService.createSnapper(settings, 'right');
      }

      // No clicking/tapping when drawer is open.
      function drawerContentClicked(event) {
        if (SnapService.getState('left') !== 'closed') {
          event.preventDefault();
          event.stopPropagation();
        }
      }

      function snapDrawerAnimated(snapperState, snapperSide) {
        if (snapperSide === 'left') drawerMenuAnimated(snapperState, snapperSide);
      }

      // Snapper is "ready". Set swiper and snapper statuses.
      function drawerMenuAnimated(snapperState, snapperSide) {
        var activeFeature = scope.getActiveFeature();
        if (snapperState === 'closed') {
          if (!SnapService.getIsSticky()) {
            angular.element(element[0].parentNode).unbind('touchstart', drawerContentClicked);
            SwiperService.setSwiping(activeFeature, true);
            SnapService.enableSliding(snapperSide);

            // make following happen inside angularjs event loop
            scope.$evalAsync(function() {
              scope.setIsWebkitScrolling(true);
            });
          }
        } else if (snapperState === 'left') {
          if (!SnapService.getIsSticky()) {
            angular.element(element[0].parentNode).bind('touchstart', drawerContentClicked);
            SwiperService.setSwiping(activeFeature, false);
            SnapService.enableSliding(snapperSide);
          }
        }

        featureContainerController.toggleInactiveSwiperSlidesVisiblityClass('visible', activeFeature);
        SwiperService.resizeFixSwiperAndChildSwipers(activeFeature);
      }

      function snapperClosed() {
        if (SnapService.getIsSticky()) {
          SwiperService.setSwiping(scope.getActiveFeature(), true);
          SnapService.disableSliding('left');
        }
      }

      // Enable swiping and disable sliding and vice versa when snapper pane is released and animation starts.
      function snapperPaneReleased(snapperState) {
        var activeFeature = scope.getActiveFeature();
        // This if statement is according to current understanding the most reliable (yet not the most intuitive)
        // way to detect that the drawer is closing.
        if (snapperState.info.opening === 'left' && snapperState.info.towards === 'left' && snapperState.info.flick) {
          if (SnapService.getIsSticky()) {
            SwiperService.setSwiping(activeFeature, true);
            SnapService.disableSliding('left');
          }
          // Drawer is opening
        } else if (snapperState.info.towards === 'right' && snapperState.info.flick) {
          if (!SnapService.getIsSticky()) {
            SwiperService.setSwiping(activeFeature, false);
            SnapService.enableSliding('left');
          }
        }
      }

      initializeDrawerMenu();
      initializeOmnibar();

      scope.$on('$destroy', function() {
        SnapService.deleteSnapper('left');
        angular.element(element).unbind('touchstart', drawerContentClicked);
      });
    }
  };
}
featureContainerDirective['$inject'] = ['$rootScope', 'SnapService', 'SwiperService', 'UISessionService', 'UserSessionService'];
angular.module('em.directives').directive('featureContainer', featureContainerDirective);
