'use strict';

function featureContainerDirective($rootScope, SnapService, SwiperService, UISessionService, UserSessionService) {
  return {
    restrict: 'A',
    controller: function($scope, $element) {

      // FEATURE DEFAULT VALUES AND ARRAYS

      var contentFeatures = ['tasks', 'notes', 'inbox', 'dashboard'];
      var activeContentFeatures = {tasks: true};
      var helperFeatures = {
        taskEdit: 'tasks',
        noteEdit: 'notes',
        itemEdit: 'inbox'
      };
      var systemFeatures = ['account', 'about', 'admin'];
      var featureElements = {};
      var viewActiveCallbacks = {};

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
        if ($scope.isFeatureActive('tasks') || $scope.isFeatureActive('notes') || $scope.isFeatureActive('dashboard')){
          if (UserSessionService.getUIPreference('hideFooter') && $rootScope.packaging.endsWith('cordova')){
            $element[0].classList.toggle('hide-footer', true);
            return false;
          }else{
            $element[0].classList.toggle('hide-footer', false);
            return true;
          }
        }else{
          return false;
        }
      };

      $scope.featureHasPlusButton = function featureHasPlusButton() {
        if ($scope.isFeatureActive('tasks') || $scope.isFeatureActive('notes')){
          if (UserSessionService.getUIPreference('hidePlus')){
            return false;
          }else{
            return true;
          }
        }else{
          return false;
        }
      };

      // UI SESSION SERVICE HOOKS

      function executeViewActiveCallbacks(viewId){
        if (viewActiveCallbacks[viewId]){
          viewActiveCallbacks[viewId]();
        }
        var subViewId = SwiperService.getActiveSlidePath(viewId);

        if (subViewId && viewActiveCallbacks[subViewId]){
          viewActiveCallbacks[subViewId]();
        }
      }

      var featureChangedCallback = function featureChangedCallback(name, data, state){
        if (contentFeatures.indexOf(name) > -1){
          activeContentFeatures[name] = true;
          if ($scope.isContentFeatureActive(name)) {
            setFeatureContainerClass(name);
            if ($rootScope.isMobile && featureElements[name]) {
              SnapService.setDraggerElement(featureElements[name].dragElement);
            }
          }
        }

        if (!state) state = UISessionService.getFeatureState(name);

        executeViewActiveCallbacks(state);
      };
      UISessionService.registerFeatureChangedCallback(featureChangedCallback, 'featureContainerDirective');
      UISessionService.changeFeature('tasks');

      // SWIPER SERVICE HOOKS

      var slideChangedCallback = function slideChangedCallback(activeSlidePath){
        executeViewActiveCallbacks(activeSlidePath);

        // Don't set to main slide path, if page slide path is already set
        if (!UISessionService.getFeatureState(UISessionService.getCurrentFeatureName()) ||
          !UISessionService.getFeatureState(UISessionService.getCurrentFeatureName()).startsWith(activeSlidePath)){
          UISessionService.setCurrentFeatureState(activeSlidePath);
        }
      };

      SwiperService.registerSlideChangeCallback(slideChangedCallback, 'tasks', 'featureContainerDirective');
      SwiperService.registerSlideChangeCallback(slideChangedCallback, 'tasks/home', 'featureContainerDirective');
      SwiperService.registerSlideChangeCallback(slideChangedCallback, 'tasks/details', 'featureContainerDirective');
      SwiperService.registerSlideChangeCallback(slideChangedCallback, 'notes', 'featureContainerDirective');
      SwiperService.registerSlideChangeCallback(slideChangedCallback, 'notes/details', 'featureContainerDirective');
      SwiperService.registerSlideChangeCallback(slideChangedCallback, 'dashboard', 'featureContainerDirective');

      // CALLBACK REGISTRATION

      this.registerSnapDrawerDragElement = function registerSnapDrawerDragElement(feature, element) {
        if ($scope.isFeatureActive(feature)) {
          SnapService.setDraggerElement(element);
        }
        if (!featureElements[feature]) featureElements[feature] = {};
        featureElements[feature].dragElement = element;
      };

      this.registerViewActiveCallback = function registerViewActiveCallback(viewId, callback) {
        viewActiveCallbacks[viewId] = callback;
      };

      // SET CORRECT CLASSES TO FEATURE CONTAINER ELEMENT

      setFeatureContainerClass($scope.getActiveFeature());

       // https://developer.mozilla.org/en-US/docs/Web/API/Element.classList
       function setFeatureContainerClass(feature) {
        if (feature === 'tasks' || feature === 'notes' || feature === 'dashboard') {
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
featureContainerDirective.$inject = ['$rootScope', 'SnapService', 'SwiperService', 'UISessionService', 'UserSessionService'];
angular.module('em.directives').directive('featureContainer', featureContainerDirective);
