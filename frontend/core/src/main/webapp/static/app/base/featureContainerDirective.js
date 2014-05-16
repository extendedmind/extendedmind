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

      var featureChangedCallback = function featureChangedCallback(newActiveFeature, oldActiveFeature) {
        if (contentFeatures.indexOf(newActiveFeature.name) > -1){
          activeContentFeatures[newActiveFeature.name] = true;
          if (!oldActiveFeature || (newActiveFeature.name !== oldActiveFeature.name)) {
            if ($scope.isContentFeatureActive(newActiveFeature.name)) {
              setFeatureContainerClass(newActiveFeature.name);
              if ($rootScope.isMobile && featureElements[newActiveFeature.name]) {
                SnapService.setDraggerElement(featureElements[newActiveFeature.name].dragElement);
              }
            }
          }
        }
      }
      UISessionService.registerFeatureChangedCallback(featureChangedCallback, 'featureContainerDirective');
      UISessionService.changeFeature({name: 'tasks'});

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
