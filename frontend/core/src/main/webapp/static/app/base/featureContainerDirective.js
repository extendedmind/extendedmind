'use strict';

function featureContainerDirective($rootScope, SnapService, SwiperService) {
  return {
    restrict: 'A',
    controller: function($scope, $element) {
      var featureElements = {};
      $scope.homeHeading = 'dates';
      $scope.currentHeading = 'dates';

      setFeatureContainerClass($scope.activeFeature);

      SwiperService.registerSlideChangeCallback(setPageHeading, 'tasks', featureContainerDirective);
      SwiperService.registerSlideChangeCallback(setPageHeading, 'notes', featureContainerDirective);

      this.registerSnapDrawerDragElement = function registerSnapDrawerDragElement(feature, element) {
        if ($scope.isFeatureActive(feature)) {
          SnapService.setDraggerElement(element);
        }
        if (!featureElements[feature]) {
          featureElements[feature] = {};
        }
        featureElements[feature].dragElement = element;
      };

      function setHomeHeading(feature) {
        if (feature === 'notes') {
          $scope.homeHeading = 'unsorted';
        } else if (feature === 'tasks') {
          $scope.homeHeading = 'dates';
        } else if (feature === 'inbox') {
          $scope.homeHeading = 'inbox';
        }
      }

      function reInitSwipers(feature) {
        if (feature === 'tasks' || feature === 'notes') {
          SwiperService.refreshSwiperAndChildSwipers(feature);
        }
      }

      // Register callback to active feature or slide change which will update heading
      function setPageHeading() {
        if ($scope.isFeatureActive('inbox')) {
          $scope.currentHeading = 'inbox';
        } else {
          var activeSlide = SwiperService.getActiveSlidePath($scope.activeFeature);
          if (!activeSlide) {
            if ($scope.isFeatureActive('tasks')) {
              $scope.currentHeading = 'dates';
            } else if ($scope.isFeatureActive('notes')) {
              $scope.currentHeading = 'unsorted';
            }
          } else {
            if (activeSlide.endsWith('home')) {
              if ($scope.isFeatureActive('tasks')) {
                $scope.currentHeading = 'dates';
              } else if ($scope.isFeatureActive('notes')) {
                $scope.currentHeading = 'unsorted';
              }
            } else if (activeSlide.endsWith('details')) {
              $scope.currentHeading = $scope.activeFeature;
            } else {
              var lastSlashIndex = activeSlide.lastIndexOf('/');
              if (lastSlashIndex !== -1) {
                $scope.currentHeading = activeSlide.substring(lastSlashIndex + 1);
              }
            }
          }
        }
        if (!$scope.$$phase) {
          $scope.$digest();
        }
      }

      // https://developer.mozilla.org/en-US/docs/Web/API/Element.classList
      function setFeatureContainerClass(feature) {
        if (feature === 'tasks' || feature === 'notes') {
          $element[0].classList.toggle('no-slides-container', false);
          $element[0].classList.toggle('slides-container', true);
        } else {
          $element[0].classList.toggle('no-slides-container', true);
          $element[0].classList.toggle('slides-container', false);
        }
      }

      // http://ruoyusun.com/2013/08/24/a-glimpse-of-angularjs-scope-via-example.html
      $scope.$watch('activeFeature', function(newActiveFeature, oldActiveFeature) {
        if (newActiveFeature !== oldActiveFeature) {
          if ($scope.isContentFeatureActive(newActiveFeature)) {
            initializeContentFeature(newActiveFeature);
            $scope.$evalAsync(function() {
              reInitSwipers(newActiveFeature);
            });
          }
        }
      });

      function initializeContentFeature(feature) {
        setHomeHeading(feature);
        setPageHeading();
        setFeatureContainerClass(feature);

        if ($rootScope.isMobile) {
          SnapService.setDraggerElement(featureElements[feature].dragElement);
        }
      }

      $scope.featureHasFooter = function featureHasFooter() {
        return ($scope.isFeatureActive('tasks') || $scope.isFeatureActive('notes'));
      };
    },
    link: function(scope, element) {

      function initializeSnapper() {
        SnapService.createSnapper(element[0]);

        SnapService.registerAnimatedCallback(snapperAnimated);
        SnapService.registerEndCallback(snapperPaneReleased);
        SnapService.registerCloseCallback(snapperClosed);
      }

      // No clicking/tapping when drawer is open.
      angular.element(element).bind('touchstart', drawerContentClicked);
      function drawerContentClicked(event) {
        if (SnapService.getState().state !== 'closed') {
          event.preventDefault();
          event.stopPropagation();
        }
      }

      // Snapper is "ready". Set swiper and snapper statuses.
      function snapperAnimated(snapperState) {
        if (snapperState.state === 'closed') {
          if (scope.activeFeature) {
            SwiperService.setSwiping(scope.activeFeature, true);
            SnapService.enableSliding();
          }
        } else if (snapperState.state === 'left') {
          if (scope.activeFeature) {
            SwiperService.setSwiping(scope.activeFeature, false);
            SnapService.enableSliding();
          }
        }
      }

      function snapperClosed() {
        if (scope.activeFeature) {
          SwiperService.setSwiping(scope.activeFeature, true);
          SnapService.disableSliding();
        }
      }

      // Enable swiping and disable sliding and vice versa when snapper pane is released and animation starts.
      function snapperPaneReleased(snapperState) {
        // This if statement is according to current understanding the most reliable (yet not the most intuitive)
        // way to detect that the drawer is closing.
        if (snapperState.info.opening === 'left' && snapperState.info.towards === 'left' && snapperState.info.flick) {
          if (scope.activeFeature) {
            SwiperService.setSwiping(scope.activeFeature, true);
            SnapService.disableSliding();
          }
          // Drawer is opening
        } else if (snapperState.info.towards === 'right' && snapperState.info.flick) {
          if (scope.activeFeature) {
            SwiperService.setSwiping(scope.activeFeature, false);
            SnapService.enableSliding();
          }
        }
      }

      scope.$watch('isMobile', function(newValue) {
        if (newValue === true) {
          initializeSnapper();
        } else if (newValue === false) {
          SnapService.deleteSnapper();
        }
      });

      scope.$on('$destroy', function() {
        SnapService.deleteSnapper();
      });

      if ($rootScope.isMobile) {
        initializeSnapper();
      }
    }
  };
}
featureContainerDirective.$inject = ['$rootScope', 'SnapService', 'SwiperService'];
angular.module('em.directives').directive('featureContainer', featureContainerDirective);
