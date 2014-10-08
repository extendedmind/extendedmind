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

 /* global $, angular, html5Mode, FastClick, packaging */
 'use strict';

 angular.module('em.app', ['em.root', 'em.entry', 'em.main', 'em.focus', 'em.lists',
                           'em.tasks', 'em.notes', 'em.archive', 'em.admin', 'em.user',
                           'em.base',
                           'common',
                           'ngAnimate', 'ngRoute', 'ngMessages', 'infinite-scroll', 'monospaced.elastic',
                           'base64']);

 angular.module('em.root', ['em.entry', 'em.main', 'em.focus', 'em.lists',
                            'em.tasks', 'em.notes', 'em.archive', 'em.admin', 'em.user',
                            'em.base',
                            'common']);

 angular.module('em.main', ['em.focus', 'em.lists', 'em.tasks', 'em.notes', 'em.archive', 'em.admin',
                            'em.user',
                             'em.base',
                             'common']);

 angular.module('em.focus', ['em.tasks', 'em.notes',
                             'em.base',
                             'common']);

 angular.module('em.lists', ['em.tasks', 'em.notes',
                             'em.base',
                             'common']);

 angular.module('em.entry', ['em.base',
                             'common']);

 angular.module('em.tasks', ['em.base',
                             'common']);

 angular.module('em.notes', ['em.base',
                             'common']);

 angular.module('em.archive', ['em.base',
                               'common']);

 angular.module('em.admin', ['em.base',
                             'common']);

 angular.module('em.user', ['em.base',
                             'common']);

 angular.module('em.base', ['common']);

 // Global variable "packaging" is defined in index.html
 angular.module('em.app').constant('packaging', (typeof packaging !== 'undefined') ? packaging: 'devel');

 angular.module('em.app').config(['$animateProvider', '$compileProvider', '$locationProvider',
                                 '$routeProvider', 'packaging',
  function($animateProvider, $compileProvider, $locationProvider, $routeProvider, packaging) {

    // Enable animations for elements that have classes containing word 'animate'.
    $animateProvider.classNameFilter(/animate/);

    // Global variable "html5Mode" is defined in index.html
    var h5m = (typeof html5Mode !== 'undefined') ? html5Mode: true;
    $locationProvider.html5Mode(h5m);

    $compileProvider.debugInfoEnabled(packaging === 'devel');

    $routeProvider.when('/', {
      templateUrl: 'static/app/entry/entrySlides.html',
      resolve: {
        userStatus: ['$location', 'UserSessionService',
        function($location, UserSessionService) {
          if (UserSessionService.getUserUUID()){
            // Existing user
            $location.path('/my');
          }
        }]
      }
    });

    $routeProvider.when('/my', {
      templateUrl: 'static/app/main/main.html',
      resolve: {
        auth: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }],
        owner: ['UISessionService',
        function(UISessionService) {
          return UISessionService.setMyActive();
        }]
      }
    });

    $routeProvider.when('/collective/:collectiveUUID/', {
      templateUrl: 'static/app/main/main.html',
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
      templateUrl: 'static/app/entry/reset.html',
      resolve: {
        routes: ['$location', '$route', 'AuthenticationService',
        function($location, $route, AuthenticationService) {
          if (!$route.current.params.hex_code || !$route.current.params.email) {
            $location.path('/');
          }else{
            // make sure code is valid
            AuthenticationService.getPasswordResetExpires($route.current.params.hex_code,
                                                          $route.current.params.email).then(
              function(passwordResetExpiresResponse){
                if (!passwordResetExpiresResponse.data ||
                    !passwordResetExpiresResponse.data.resetCodeExpires){
                  $location.url($location.path());
                  $location.path('/');
                }
              }
            );
          }
        }]
      }
    });

    $routeProvider.when('/verify/:hex_code', {
      redirectTo: '/',
      resolve: {
        routes: ['$location', '$route', 'AnalyticsService', 'AuthenticationService',
        function($location, $route, AnalyticsService, AuthenticationService) {
          AnalyticsService.visitEntry('verify');
          var verifyCode = $route.current.params.hex_code;
          var email = $route.current.params.email;
          $location.url($location.path());
          if (verifyCode && email) {
            // verify email directly
            AuthenticationService.postVerifyEmail(verifyCode, email).then(
              function(success){
                // TODO:  TOASTER FOR SUCCESS IN VERIFICATION
              }, function(failure){
                // TODO: TOASTER FOR FAILED VERIFY
              }
            );
          }
        }]
      }
    });

    $routeProvider.when('/404', {
      templateUrl: 'static/app/main/pageNotFound.html',
      controller: 'PageNotFoundController'
    });

    // ERROR PAGE

    $routeProvider.otherwise({
      controller: 'PageNotFoundController',
      redirectTo: '404'
    });

    // ADMINISTRATION
    $routeProvider.when('/admin', {
      templateUrl: 'static/app/admin/admin.html'
    });

  }]);

angular.module('em.app').run(function($rootScope) {

  // Put version to root scope
  $.getJSON('static/config.json', function(data) {
    $rootScope.extendedMindVersion = data.version;
  });

  // http://stackoverflow.com/a/21113518
  // http://www.youtube.com/watch?v=xOAG7Ab_Oz0#t=2314
  FastClick.attach(document.body);
});
