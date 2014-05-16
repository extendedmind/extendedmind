'use strict';

function featureContainerDirective($rootScope, SnapService, SwiperService, UISessionService) {
  return {
    restrict: 'A',
    controller: function($scope, $element) {

      // FEATURE DEFAULT VALUES AND ARRAYS

      var contentFeatures = ['tasks', 'notes', 'items', 'inbox'];
      var activeContentFeatures = {tasks: true};
      var helperFeatures = {
        taskEdit: 'tasks',
        noteEdit: 'notes',
        itemEdit: 'inbox'
      };
      var systemFeatures = ['account', 'about', 'admin'];
      var featureElements = {};
      $scope.homeHeading = 'dates';
      $scope.currentHeading = 'dates';

      // COMMON FEATURE METHODS IN SCOPE

      $scope.getActiveFeature = function getActiveFeature(){
        return UISessionService.getCurrentFeatureName();
      };

      $scope.isFeatureActive = function isFeatureActive(feature) {
        return $scope.getActiveFeature() === feature;
      };

      $scope.isContentFeatureActive = function isContentFeatureActive(feature) {
        if (feature){
          return activeContentFeatures[feature] || activeContentFeatures[helperFeatures[feature]];
        }else{
          return (contentFeatures.indexOf($scope.getActiveFeature()) > -1);
        }
      };

      $scope.isSystemFeatureActive = function isSystemFeatureActive() {
        return (systemFeatures.indexOf($scope.getActiveFeature()) > -1);
      };

      $scope.featureHasFooter = function featureHasFooter() {
        return ($scope.isFeatureActive('tasks') || $scope.isFeatureActive('notes'));
      };

      // UI SESSION SERVICE HOOKS

      // http://ruoyusun.com/2013/08/24/a-glimpse-of-angularjs-scope-via-example.html
      $scope.$watch('activeFeature', function(newActiveFeature, oldActiveFeature) {
        if (contentFeatures.indexOf(newActiveFeature) > -1){
          activeContentFeatures[newActiveFeature] = true;
          if (newActiveFeature !== oldActiveFeature) {
            if ($scope.isContentFeatureActive(newActiveFeature)) {
              initializeContentFeature(newActiveFeature);
              $scope.$evalAsync(function() {
                reInitSwipers(newActiveFeature);
              });
            }
          }
        }
      });
      var featureChangedCallback = function featureChangedCallback(newActiveFeature, oldActiveFeature) {
        $scope.activeFeature = newActiveFeature.name;
      }
      UISessionService.registerFeatureChangedCallback(featureChangedCallback, 'featureContainerDirective');
      $scope.activeFeature = 'tasks';
      UISessionService.changeFeature({name: $scope.activeFeature});

      // CALLBACK REGISTRATION

      this.registerSnapDrawerDragElement = function registerSnapDrawerDragElement(feature, element) {
        if ($scope.isFeatureActive(feature)) {
          SnapService.setDraggerElement(element);
        }
        if (!featureElements[feature]) featureElements[feature] = {};
        featureElements[feature].dragElement = element;
      };

      // SET CORRECT CLASSES TO FEATURE CONTAINER ELEMENT

      setFeatureContainerClass($scope.getActiveFeature());

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

      // PRIVATE FUNCTIONS

      function reInitSwipers(feature) {
        if (feature === 'tasks' || feature === 'notes') {
          SwiperService.refreshSwiperAndChildSwipers(feature);
        }
      }

      function initializeContentFeature(feature) {
        setFeatureContainerClass(feature);

        if ($rootScope.isMobile && featureElements[feature]) {
          SnapService.setDraggerElement(featureElements[feature].dragElement);
        }
      }
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
          if (scope.getActiveFeature()) {
            SwiperService.setSwiping(scope.getActiveFeature(), true);
            SnapService.enableSliding();
          }
        } else if (snapperState.state === 'left') {
          if (scope.getActiveFeature()) {
            SwiperService.setSwiping(scope.getActiveFeature(), false);
            SnapService.enableSliding();
          }
        }
      }

      function snapperClosed() {
        if (scope.getActiveFeature()) {
          SwiperService.setSwiping(scope.getActiveFeature(), true);
          SnapService.disableSliding();
        }
      }

      // Enable swiping and disable sliding and vice versa when snapper pane is released and animation starts.
      function snapperPaneReleased(snapperState) {
        // This if statement is according to current understanding the most reliable (yet not the most intuitive)
        // way to detect that the drawer is closing.
        if (snapperState.info.opening === 'left' && snapperState.info.towards === 'left' && snapperState.info.flick) {
          if (scope.getActiveFeature()) {
            SwiperService.setSwiping(scope.getActiveFeature(), true);
            SnapService.disableSliding();
          }
          // Drawer is opening
        } else if (snapperState.info.towards === 'right' && snapperState.info.flick) {
          if (scope.getActiveFeature()) {
            SwiperService.setSwiping(scope.getActiveFeature(), false);
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
featureContainerDirective.$inject = ['$rootScope', 'SnapService', 'SwiperService', 'UISessionService'];
angular.module('em.directives').directive('featureContainer', featureContainerDirective);
