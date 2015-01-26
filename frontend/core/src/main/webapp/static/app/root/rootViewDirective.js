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

 function rootViewDirective($injector, $rootScope, $templateCache, $window, $timeout,
                            AnalyticsService, BackendClientService, SynchronizeService, UISessionService,
                            UUIDService, UserSessionService, packaging) {

  return {
    restrict: 'A',
    replace: 'true',
    templateUrl: $rootScope.urlBase + 'app/root/root.html',
    controller: ['$scope', function ($scope) {

      // BASIC DIMENSIONS TO ROOT SCOPE
      // NOTE: For some reason this had to be 567 before,
      // because editor disappeared after animation was ready.
      $rootScope.CONTAINER_MASTER_MAX_WIDTH = $rootScope.EDITOR_MAX_WIDTH = 568;
      $rootScope.CONTAINER_MASTER_MAX_HEIGHT = 769;
      $rootScope.MAX_HEIGHT = 769;
      $rootScope.MENU_WIDTH = 260;
      $rootScope.EDITOR_FOOTER_HEIGHT = 44;
      $rootScope.TOOLBAR_BUTTON_WIDTH = $rootScope.TITLEBAR_BUTTON_WIDTH = 80;
      $rootScope.TOOLBAR_HEADING_MAX_WIDTH = $rootScope.TITLEBAR_HEADING_MAX_WIDTH = 350;
      $rootScope.TOOLBAR_HEIGHT = 66;
      $rootScope.LIST_FOOTER_HEIGHT = 44;
      $rootScope.LOADING_ANIMATION_HEIGHT = 19;

      // ANIMATION
      $rootScope.KEYBOARD_ANIMATION_TIME = 300;
      // NOTE: These need to be in sync with their counterparts in LESS and/or JS.
      $rootScope.MENU_ANIMATION_SPEED = 200;
      $rootScope.EDITOR_ANIMATION_SPEED = 350;
      $rootScope.EDITOR_CLOSED_FAILSAFE_TIME = 2*$rootScope.EDITOR_ANIMATION_SPEED;
      $rootScope.CHECKBOX_CHECKING_ANIMATION_TIME = 3000;
      $rootScope.LIST_ITEM_LEAVE_ANIMATION_SPEED = 1000;

      // Sticky inputs
      var useStickyInputs = false;
      if (packaging.endsWith('cordova')){
        useStickyInputs = true;
      }

      $scope.getEditableFieldSticky = function(){
        if (useStickyInputs) return 'sticky';
      };

      // Online/offline status, optimistic default
      $scope.online = true;
      var onlineStatusCallback = function(online) {
        $scope.online = online;
      };
      BackendClientService.registerOnlineStatusCallback(onlineStatusCallback);

      var exiting = false;
      $rootScope.redirectToEntry = function() {
        exiting = true;
        UISessionService.reset();
        SynchronizeService.clearData();
        UserSessionService.clearUser();
        $rootScope.synced = $rootScope.syncState = undefined;
        // $location can not be injected directly presumably because this directive
        // is defined above ng-view
        var $location = $injector.get('$location');
        $location.url('/');

        // NOTE:  Without this swiper breaks after logout/login, because
        //        window.getComputedStyle(el, null).getPropertyValue('width');
        //        in swiper.js starts returning roughly half the real value. This turned out
        //        to be because of AngularJS template caching: the first ng-include workds, but
        //        not the second.

        // Tried also this in swiperContainer after initialization:
        //
        //      if ($rootScope.horizontalSwipersNeedResize){
        //        $element[0].style.visibility = 'hidden';
        //        setTimeout(function(){
        //          SwiperService.resizeFixSwiper($scope.swiperPath);
        //          $element[0].style.visibility = 'visible';
        //        });
        //      }
        //
        // which almost worked, but on menu open, failed. In app that always broke.
        $templateCache.removeAll();
      };

      // MODAL
      $scope.modal = {
        visible: false
      };

      $scope.showModal = function(type, params) {
        $scope.modal.visible = true;
        $scope.modal.type = type;
        if (params) {
          $scope.modal.params = params;
        }
      };

      $scope.hideModal = function() {
        $scope.modal.visible = false;
        $scope.modal.type = undefined;
        if ($scope.modal.params) {
          delete $scope.modal.params;
        }
      };

      // EVENTS - user interactions, exceptions

      // Listen to interactions emitted to $rootScope.
      var unbindEmInteraction = $rootScope.$on('emInteraction', function(name, interaction) {
        if (interaction.type === 'onlineRequired') {
          var params = {
            messageHeading: 'not online',
            messageIngress: 'please connect to the internet and press retry',
            confirmText: 'retry',
            confirmTextDeferred: 'retrying\u2026',
            confirmActionDeferredFn: interaction.value.retry,
            confirmActionDeferredParam: interaction.value.retryParam,
            confirmActionPromiseFn: interaction.value.promise,
            confirmActionPromiseParam: interaction.value.promiseParam,
            cancelDisabled: !interaction.value.allowCancel
            // Cancel is disabled by default and overridden with allowCancel.
          };

          $scope.showModal(undefined, params);
        }
      });

      // Listen to exceptions emitted to $rootScope.
      var unbindEmException = $rootScope.$on('emException', function(name, exception) {

        if (exception.type === 'http' && exception.value.status === 403) {
          // Redirect thrown 403 Forbidden exception to the login page
          AnalyticsService.error('forbidden', JSON.stringify(exception));
          $rootScope.redirectToEntry();
        } else if (exception.type === 'session') {
          if (!exiting) {
            // Redirect session errors to the login page
            AnalyticsService.error('session', exception.value);
            $rootScope.redirectToEntry();
          }
          // TODO: Type 'response' for offline responses!
        } else if (exception.type === 'redirectToEntry') {
          $rootScope.redirectToEntry();
        } else {
          AnalyticsService.error('unexpected', JSON.stringify(exception));

          var params = {
            messageHeading: 'oops',
            messageIngress: 'something unexpected happened, sorry!',
            messageText: JSON.stringify(exception, null, 2),
            confirmText: 'close'
          };
          $scope.showModal(undefined, params);
        }
      });

      // Clean up listening by executing the variable
      $scope.$on('$destroy', function() {
        unbindEmInteraction();
        unbindEmException();
      });
    }],
    link: function (scope) {

      // SESSION MANAGEMENT

      var currentSessionId, currentSessionStartTime, currentSessionLatestActivity;
      scope.registerActivity = function registerActivity() {
        if (!currentSessionId) {
          startNewSession();
        } else {
          var now = Date.now();
          // If 20 seconds has passed since last activity, consider this a new session
          if (currentSessionLatestActivity && (currentSessionLatestActivity < (now - 20000))) {
            AnalyticsService.stopSession(currentSessionId, currentSessionStartTime);
            startNewSession();
          } else {
            currentSessionLatestActivity = now;
          }
        }
      };

      function startNewSession() {
        currentSessionId = UUIDService.randomUUID();
        currentSessionStartTime = AnalyticsService.startSession(currentSessionId);
        currentSessionLatestActivity = undefined;
      }

      // WINDOW RESIZING

      var windowResizedCallbacks = {};
      scope.registerWindowResizedCallback = function registerWindowResizedCallback(windowResizedCallback, id){
        windowResizedCallbacks[id] = windowResizedCallback;
      };

      function setDimensions(width, height) {

        $rootScope.currentWidth = width;
        $rootScope.currentHeight = height;

        // UI for small screens, one column
        if (width <= 568) {
          $rootScope.columns = 1;
          // UI for medium screens, two columns
        } else if (width > 568 && width <= 1024) {
          $rootScope.columns = 2;
          // UI for large screens, three columns
        } else if (width > 1024) {
          $rootScope.columns = 3;
        }

        if (height <= 500){
          $rootScope.smallDeviceHeight = true;
        }else{
          $rootScope.smallDeviceHeight = false;
        }

        if (width <= 365){
          $rootScope.smallDeviceWidth = true;
        }else{
          $rootScope.smallDeviceWidth = false;
        }

        // Execute callbacks
        for (var id in windowResizedCallbacks) {
          windowResizedCallbacks[id]();
        }

      }
      setDimensions($window.innerWidth, $window.innerHeight);

      function windowResized() {
        scope.$apply(function() {
          setDimensions($window.innerWidth, $window.innerHeight);
        });
      }

      angular.element($window).bind('resize', windowResized);

      // CORDOVA SPECIFIC EVENTS
      $rootScope.softKeyboard = {};
      function cordovaKeyboardShow(event) {
        $rootScope.softKeyboard.height = event.keyboardHeight;
        if (!$rootScope.$$phase && !scope.$$phase) scope.$apply();
      }
      function cordovaKeyboardHide(/*event*/) {
        $rootScope.softKeyboard.height = undefined;
        if (!$rootScope.$$phase && !scope.$$phase) scope.$apply();
      }
      if (packaging.endsWith('cordova')) {
        window.addEventListener('native.keyboardshow', cordovaKeyboardShow);
        window.addEventListener('native.keyboardhide', cordovaKeyboardHide);
      }

      // CLEANUP

      scope.$on('$destroy', function() {
        angular.element($window).unbind('resize', windowResized);
        if (packaging === 'ios-cordova') {
          window.removeEventListener('native.keyboardshow', cordovaKeyboardShow);
          window.removeEventListener('native.keyboardhide', cordovaKeyboardHide);
        }
      });
    }
  };
}

rootViewDirective['$inject'] = ['$injector', '$rootScope', '$templateCache', '$window', '$timeout',
'AnalyticsService', 'BackendClientService', 'SynchronizeService', 'UISessionService', 'UUIDService',
'UserSessionService', 'packaging'];
angular.module('em.root').directive('rootView', rootViewDirective);
