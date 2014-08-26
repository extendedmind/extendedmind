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

 angular.module('em.app', ['em.root', 'em.entry', 'em.main',
                           'em.tasks', 'em.notes', 'em.archive', 'em.admin', 'em.account',
                           'em.base',
                           'common',
                           'ngAnimate', 'ngRoute', 'infinite-scroll', 'monospaced.elastic', 'base64']);

 angular.module('em.root', ['em.entry', 'em.main',
                            'em.tasks', 'em.notes', 'em.archive', 'em.admin', 'em.account',
                            'em.base',
                            'common']);

 angular.module('em.main', ['em.tasks', 'em.notes', 'em.archive', 'em.admin', 'em.account',
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

 angular.module('em.account', ['em.base',
                             'common']);

 angular.module('em.base', ['common']);

 angular.module('em.app').config(['$locationProvider', '$routeProvider',
  function($locationProvider, $routeProvider) {

    // Global variable "html5Mode" is defined in index.html
    var h5m = (typeof html5Mode !== 'undefined') ? html5Mode: true;
    $locationProvider.html5Mode(h5m);

    $routeProvider.when('/', {
      resolve: {
        userStatus: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.checkAndRedirectUser();
        }]
      }
    });

    $routeProvider.when('/entry', {
      templateUrl: 'static/app/entry/entry.html'
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

    $routeProvider.when('/launch', {
      templateUrl: 'static/app/entry/launch.html'
    });

    $routeProvider.when('/welcome', {
      templateUrl: 'static/app/entry/welcome.html'
    });

    $routeProvider.when('/waiting', {
      templateUrl: 'static/app/entry/waiting.html',
      resolve: {
        isEmailOrUUID: ['$location', '$route',
        function($location, $route) {
          if (!$route.current.params.email && !$route.current.params.uuid) {
            $location.path('/login').search({});
          }
        }]
      }
    });

    $routeProvider.when('/accept/:hex_code', {
      templateUrl: 'static/app/entry/signup.html',
      resolve: {
        routes: ['$location', '$route',
        function($location, $route) {
          if (!$route.current.params.hex_code || !$route.current.params.email) {
            $location.url($location.path());
            $location.path('/login');
          }
        }]
      }
    });

    $routeProvider.when('/signup', {
      templateUrl: 'static/app/entry/signup.html'
    });

    $routeProvider.when('/forgot', {
      templateUrl: 'static/app/entry/forgot.html'
    });

    $routeProvider.when('/reset/:hex_code', {
      templateUrl: 'static/app/entry/forgot.html',
      resolve: {
        routes: ['$location', '$route', 'AuthenticationService',
        function($location, $route, AuthenticationService) {
          if (!$route.current.params.hex_code || !$route.current.params.email) {
            $location.path('/login');
          }else{
            // make sure code is valid
            AuthenticationService.getPasswordResetExpires($route.current.params.hex_code, $route.current.params.email).then(
              function(passwordResetExpiresResponse){
                if (!passwordResetExpiresResponse.data || !passwordResetExpiresResponse.data.resetCodeExpires){
                  $location.path('/login');
                }
              }
              );
          }
        }]
      }
    });

    $routeProvider.when('/verify/:hex_code', {
      templateUrl: 'static/app/entry/verify.html'
    });

    $routeProvider.when('/404', {
      templateUrl: 'static/app/main/pageNotFound.html',
      controller: 'PageNotFoundController'
    });

    $routeProvider.when('/login', {
      templateUrl: 'static/app/entry/login.html'
    });

    $routeProvider.when('/my/account/password', {
      templateUrl: 'static/app/entry/changePassword.html'
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

  // Global variable "packaging" is defined in index.html
  var pkging = (typeof packaging !== 'undefined') ? packaging: 'devel';
  $rootScope.packaging = pkging;

  // Put version to root scope
  $.getJSON('static/config.json', function(data) {
    $rootScope.extendedMindVersion = data.version;
  });
  $rootScope.collectAnalytics = $rootScope.packaging !== 'devel' ? true : false;

  // http://stackoverflow.com/a/21113518
  // http://www.youtube.com/watch?v=xOAG7Ab_Oz0#t=2314
  FastClick.attach(document.body);
});
