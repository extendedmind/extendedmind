/* Copyright 2013-2017 Extended Mind Technologies Oy
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

 /* global angular, enableOffline, FastClick, html5Mode, packaging, version */
 'use strict';

 angular.module('em.app', ['em.root', 'em.entry', 'em.main', 'em.focus', 'em.lists',
                           'em.tasks', 'em.notes', 'em.admin', 'em.user',
                           'em.base',
                           'common',
                           'ngAnimate', 'ngRoute', 'ngMessages', 'ngSanitize', 'monospaced.elastic',
                           'base64']);

 angular.module('em.root', ['em.entry', 'em.main', 'em.focus', 'em.lists',
                            'em.tasks', 'em.notes', 'em.admin', 'em.user',
                            'em.base',
                            'common']);

 angular.module('em.main', ['em.focus', 'em.lists', 'em.tasks', 'em.notes', 'em.admin',
                            'em.user',
                             'em.base',
                             'common']);

 angular.module('em.focus', ['em.tasks', 'em.notes',
                             'em.base',
                             'common']);

 angular.module('em.lists', ['em.tasks', 'em.notes',
                             'em.user',
                             'em.base',
                             'common']);

 angular.module('em.entry', ['em.base',
                             'common']);

 angular.module('em.tasks', ['em.base',
                             'common']);

 angular.module('em.notes', ['em.base',
                             'common']);

 angular.module('em.admin', ['em.base',
                             'common']);

 angular.module('em.user', ['em.base',
                             'common']);

 angular.module('em.base', ['common']);

 // Global variable "packaging" is defined in index.html
 angular.module('em.app').constant('packaging', (typeof packaging !== 'undefined') ? packaging : 'devel');

 // Global variable "version" is defined in index.html
 angular.module('em.app').constant('version', (typeof version !== 'undefined') ? version : 'devel');

 // Global variable "collectAnalytics" can be defined in index.html
 angular.module('em.app').constant('collectAnalytics', (typeof collectAnalytics !== 'undefined') ? collectAnalytics : false);

 // Global variable "enableOffline" can be defined in index.html
 angular.module('em.app').constant('enableOffline', (typeof enableOffline !== 'undefined') ? enableOffline :
                                   false);

 angular.module('em.app').config(['$animateProvider', '$compileProvider', '$locationProvider',
                                 '$routeProvider', 'packaging', 'version',
  function($animateProvider, $compileProvider, $locationProvider, $routeProvider, packaging, version) {

    var urlBase;
    if (version !== 'devel')
      urlBase = 'static/' + version + '/';
    else
      urlBase = 'static/';

    // Enable animations for elements that have classes containing word 'animate'.
    $animateProvider.classNameFilter(/animate/);

    // Global variable "html5Mode" is defined in index.html
    var h5m = (typeof html5Mode !== 'undefined') ? html5Mode: true;
    $locationProvider.html5Mode(h5m);

    $compileProvider.debugInfoEnabled(packaging === 'devel');

    function isSupportedPlatformAndBrowser($q, DetectBrowserService) {
      var deferred = $q.defer();
      if (packaging === 'web' && (!DetectBrowserService.isChrome() && !DetectBrowserService.isWindowsPhone()))
        deferred.reject('clearAll');
      else
        deferred.resolve();
      return deferred.promise;
    }

    $routeProvider.when('/', {
      redirectTo: '/entry'
    });

    $routeProvider.when('/entry', {
      templateUrl: urlBase + 'app/entry/entrySlides.html',
      resolve: {
        supportedPlatformAndBrowser: ['$q', 'DetectBrowserService', isSupportedPlatformAndBrowser],
        userStatus: ['$location', 'UserSessionService',
        function($location, UserSessionService) {
          if (UserSessionService.getUserUUID()){
            // Existing user. Go to app.
            $location.path('/my');
          }
        }]
      }
    });

    $routeProvider.when('/unsupported', {
      templateUrl: urlBase + 'app/entry/entrySlides.html'
    });

    $routeProvider.when('/login', {
      templateUrl: urlBase + 'app/entry/entrySlides.html',
      resolve: {
        supportedPlatformAndBrowser: ['$q', 'DetectBrowserService', isSupportedPlatformAndBrowser]
      }
    });

    $routeProvider.when('/signup', {
      templateUrl: urlBase + 'app/entry/entrySlides.html',
      resolve: {
        supportedPlatformAndBrowser: ['$q', 'DetectBrowserService', isSupportedPlatformAndBrowser]
      }
    });

    $routeProvider.when('/new', {
      resolve: {
        initializeNewUserWithOnboarding: ['$location', '$rootScope', 'AnalyticsService',
        'PlatformService', 'UserService', 'UserSessionService',
        function($location, $rootScope, AnalyticsService, PlatformService, UserService, UserSessionService) {
          // Clear all previous data to prevent problems with tutorial starting again after login
          $rootScope.$emit('emException', {type: 'clearAll'});
          var userUUID = UserSessionService.createFakeUserUUID();
          // Start tutorial from focus/tasks
          var newUserFeatureValues = {
            focus: { tasks: 1 }
          };
          PlatformService.getFeatureValue('timeFormat').then(
            function(timeFormat){
              if (timeFormat === '12h'){
                UserSessionService.setUIPreference('hour12', true);
              }
            },function(error) {
              console.error('could not get time format');
              console.error(error);
            }
          );
          PlatformService.getFeatureValue('firstDayOfWeek').then(
            function(firstDayOfWeek){
              if (firstDayOfWeek === 0){
                UserSessionService.setUIPreference('sundayWeek', true);
              }
            },function(error) {
              console.error('could not get first day of week');
              console.error(error);
            }
          );
          UserSessionService.setPreference('onboarded', newUserFeatureValues);
          UserService.saveAccountPreferences();
          AnalyticsService.do('entry','start_tutorial');
          $location.path('/my');
        }]
      }
    });

    $routeProvider.when('/my', {
      templateUrl: urlBase + 'app/main/main.html',
      resolve: {
        auth: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }],
        migrate: ['UserService',
        function(UserService) {
          return UserService.migrateUser();
        }],
        owner: ['UISessionService',
        function(UISessionService) {
          return UISessionService.setMyActive();
        }]
      }
    });

    $routeProvider.when('/collective/:collectiveUUID/', {
      templateUrl: urlBase + 'app/main/main.html',
      resolve: {
        auth: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }],
        owner: ['$route', 'UISessionService',
        function($route, UISessionService) {
          UISessionService.setCollectiveActive($route.current.params.collectiveUUID);
        }]
      }
    });

    $routeProvider.when('/reset/:hex_code', {
      templateUrl: urlBase + 'app/entry/reset.html',
      resolve: {
        routes: ['$location', '$route', 'AuthenticationService', 'UISessionService',
        function($location, $route, AuthenticationService, UISessionService) {
          if (!$route.current.params.hex_code || !$route.current.params.email) {
            $location.path('/entry');
          }else{
            // make sure code is valid
            AuthenticationService.getPasswordResetExpires($route.current.params.hex_code,
                                                          $route.current.params.email).then(undefined,
              function(){
                $location.url($location.path());
                $location.path('/entry');
                UISessionService.pushNotification({
                  type: 'fyi',
                  text: 'password reset failed'
                });
              }
            );
          }
        }]
      }
    });

    $routeProvider.when('/verify/:hex_code', {
      redirectTo: '/entry',
      resolve: {
        routes: ['$location', '$route', 'AnalyticsService', 'AuthenticationService', 'UISessionService',
        function($location, $route, AnalyticsService, AuthenticationService, UISessionService) {
          AnalyticsService.visit('entry', 'verify_email', true);
          var verifyCode = $route.current.params.hex_code;
          var email = $route.current.params.email;
          $location.url($location.path());
          if (verifyCode && email) {
            // verify email directly
            AuthenticationService.postVerifyEmail(verifyCode, email).then(
              function(){
                $location.url($location.path());
                $location.path('/entry');
                UISessionService.pushNotification({
                  type: 'fyi',
                  text: 'email verified'
                });
              }, function(){
                $location.url($location.path());
                $location.path('/entry');
                UISessionService.pushNotification({
                  type: 'fyi',
                  text: 'email verification failed'
                });
              }
            );
          }
        }]
      }
    });

    $routeProvider.when('/accept/:hex_code', {
      redirectTo: '/entry',
      resolve: {
        routes: ['$location', '$route', 'AnalyticsService', 'AuthenticationService', 'UISessionService',
        function($location, $route, AnalyticsService, AuthenticationService, UISessionService) {
          AnalyticsService.visit('entry', 'accept_share', true);
          var acceptCode = $route.current.params.hex_code;
          var email = $route.current.params.email;
          $location.url($location.path());
          if (acceptCode && email) {
            // accept share directly
            AuthenticationService.postAcceptShare(acceptCode, email).then(
              function(){
                $location.path('/entry');
                UISessionService.pushNotification({
                  type: 'fyi',
                  text: 'list share accepted'
                });
              }, function(){
                $location.path('/entry');
                UISessionService.pushNotification({
                  type: 'fyi',
                  text: 'list share accept failed'
                });
              }
            );
          }
        }]
      }
    });

    $routeProvider.when('/invalid', {
      templateUrl: urlBase + 'app/main/pageNotFound.html',
      controller: 'PageNotFoundController'
    });

    // ERROR PAGE

    $routeProvider.otherwise({
      controller: 'PageNotFoundController',
      redirectTo: 'invalid'
    });

    // ADMINISTRATION
    $routeProvider.when('/admin', {
      templateUrl: urlBase + 'app/admin/admin.html'
    });

  }]);

angular.module('em.app').run(['$injector', '$rootScope', 'version', function($injector, $rootScope, version) {

  // SETUP VERSIONING
  if (version !== 'devel'){
    $rootScope.urlBase = 'static/' + version + '/';
  }else{
    $rootScope.urlBase = 'static/';
  }

  $rootScope.$on('$routeChangeError', function(event, next, current, rejection) {
    if (rejection === 'clearAll') {
      $rootScope.$emit('emException', {type: 'clearAll'});
      var $location = $injector.get('$location');
      $location.path('/unsupported');
    }
  });

  // http://stackoverflow.com/a/21113518
  // http://www.youtube.com/watch?v=xOAG7Ab_Oz0#t=2314
  if (typeof FastClick !== 'undefined') FastClick.attach(document.body);
}]);
