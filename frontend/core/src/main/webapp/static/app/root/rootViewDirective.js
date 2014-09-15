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

 function rootViewDirective($injector, $rootScope, $window, AnalyticsService, BackendClientService, ModalService, UUIDService, UserSessionService) {

  return {
    restrict: 'A',
    replace: 'true',
    templateUrl: 'static/app/root/root.html',
    controller: function($scope) {

      // BASIC DIMENSIONS TO ROOT SCOPE
      // NOTE: For some reason this had to be 567 before, because editor disappeared after animation was ready.
      $rootScope.CONTAINER_MASTER_MAX_WIDTH = 568;
      $rootScope.MAX_HEIGHT = 769;
      $rootScope.KEYBOARD_ANIMATION_TIME = 300;

      // Back function globally available
      $scope.gotoPreviousPage = function gotoPreviousPage() {
        $window.history.back();
      };

      // Online/offline status, optimistic default
      $scope.online = true;
      var onlineStatusCallback = function(online) {
        $scope.online = online;
      };
      BackendClientService.registerOnlineStatusCallback(onlineStatusCallback);

      $scope.retrying = false;
      var onlineRequiredRetryCallback = function(modalScope, modalClose, retryFunction, retryFunctionParam, promise) {
        $scope.retrying = true;
        modalScope.modalSuccessText = 'retrying...';
        modalScope.modalSuccessDisabled = true;
        retryFunction(retryFunctionParam).then(function() {
          $scope.retrying = false;
          modalClose();
          if (promise) {
            promise.resolve();
          }
        },function(error) {
          $scope.retrying = false;
          if (error.status === 403) {
            modalClose();
            if (promise) {
              promise.resolve();
            }
          } else {
            modalScope.modalSuccessText = 'retry';
            modalScope.modalSuccessDisabled = false;
          }
        });
      };

      var exiting = false;
      function redirectToLogin() {
        exiting = true;
        var email = UserSessionService.getEmail();
        UserSessionService.clearUser();
        UserSessionService.setEmail(email);
        // $location can not be injected directly presumably because this directive
        // is defined above ng-view
        var $location = $injector.get('$location');
        $location.url('/login');
      }

      // Listen to exceptions emitted to rootscope
      var unbindEmException = $rootScope.$on('emException', function(name, exception) {
        var modalOptions = {
          scope: $scope,
          id: 'errorDialog',
          showHeaderCloseButton: false,
          backdrop: true,
          footerTemplateUrl:'static/app/base/modalFooter.html',
          modalClass: 'modal small-modal'
        };

        if (exception.type === 'onlineRequired') {
          if (!$scope.retrying) {
            $scope.errorMessageHeading = 'no online connection';
            if (exception.retry) {
              $scope.errorMessageText = 'please connect to the internet and press retry to access your information';
              $scope.modalSuccessText = 'retry';
              modalOptions.allowBackdropDismiss = false;
              modalOptions.asyncSuccess = true;
              modalOptions.success = {
                fn: onlineRequiredRetryCallback,
                fnParam: exception.retry,
                fnParamParam: exception.retryParam,
                fnPromise: exception.promise
              };
              ModalService.createDialog('static/app/root/errorMessage.html', modalOptions);
            } else {
              // No retry possibility
              $scope.modalSuccessText = 'close';
              $scope.errorMessageText = 'you need to be online to complete this action';
              ModalService.createDialog('static/app/root/errorMessage.html', modalOptions);
            }
          }
        } else if (exception.type === 'http' && exception.status === 403) {
          // Redirect thrown 403 Forbidden exception to the login page
          AnalyticsService.error('forbidden', JSON.stringify(exception));
          redirectToLogin();
        } else if (exception.type === 'session') {
          if (!exiting) {
            // Redirect session errors to the login page
            AnalyticsService.error('session', exception.description);
            redirectToLogin();
          }
        } else {
          AnalyticsService.error('unexpected', JSON.stringify(exception));
          $scope.errorMessageHeading = 'something unexpected happened, sorry!';
          $scope.errorMessageText = JSON.stringify(exception, null, 4);
          $scope.modalSuccessText = 'close';
          ModalService.createDialog('static/app/root/errorMessage.html', modalOptions);
        }
      });

      // Clean up listening by executing the variable
      $scope.$on('$destroy', unbindEmException);

      // DEBUG //
      $scope.DEBUG_toggleKeyboard = function(){
        $rootScope.packaging = 'devel-cordova';
        $rootScope.softKeyboard.height = $rootScope.softKeyboard.height === 216 ? 0 : 216;
        if (!$scope.$$phase) $scope.$apply();
      };
      // DEBUG //
    },
    link: function postLink(scope) {

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

      // Collectives are globally visible
      scope.collectives = UserSessionService.getCollectives();

      // WINDOW RESIZING

      var windowResizedCallbacks = {};
      scope.registerWindowResizedCallback = function registerWindowResizedCallback(windowResizedCallback, id) {
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
        if (!scope.$$phase) scope.$apply();
      }
      function cordovaKeyboardHide(/*event*/) {
        $rootScope.softKeyboard.height = undefined;
        if (!scope.$$phase) scope.$apply();
      }
      if ($rootScope.packaging.endsWith('cordova')) {
        window.addEventListener('native.keyboardshow', cordovaKeyboardShow);
        window.addEventListener('native.keyboardhide', cordovaKeyboardHide);
      }

      // CLEANUP

      scope.$on('$destroy', function() {
        angular.element($window).unbind('resize', windowResized);
        if ($rootScope.packaging === 'ios-cordova') {
          window.removeEventListener('native.keyboardshow', cordovaKeyboardShow);
          window.removeEventListener('native.keyboardhide', cordovaKeyboardHide);
        }
      });
    }
  };
}

rootViewDirective['$inject'] = ['$injector', '$rootScope', '$window',
'AnalyticsService', 'BackendClientService', 'ModalService', 'UUIDService', 'UserSessionService'];
angular.module('em.root').directive('rootView', rootViewDirective);
