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

// NOTE: This file starts with an uppercase A to make sure it is loaded first by
//       Jasmine maven plugin!

angular.module('em.appTest', ['em.app', 'common', 'ngMockE2E']);

if (/iP(hone|od|ad)/.test(navigator.userAgent)) {
  var packaging = 'ios-cordova';
}
angular.module('em.appTest').constant('packaging', (typeof packaging !== 'undefined') ? packaging : 'devel');

angular.module('em.appTest')
  .controller('MockController', ['$rootScope', 'MockBackendService', 'MockPlatformService', 'SwiperService',
              'packaging',
    function($rootScope, MockBackendService, MockPlatformService, SwiperService, packaging){

      MockBackendService.mockBackend();
      SwiperService.setTouchSimulation(true);

      $rootScope.DEBUG_toggleSoftKeyboard = function() {
        if ($rootScope.softKeyboard) {
          // Mimic iOS's keyboard height.
          $rootScope.softKeyboard.height = !$rootScope.softKeyboard.height ? 224 : 0;
        }
      };

      if (packaging.endsWith('cordova')) {
        $rootScope.agendaCalendarSettingVisible = true;
      }

      if (packaging === 'ios-cordova') {
        MockPlatformService.mockIOS();
        MockPlatformService.setPlatformUIPreferences();
      }

  }])
  .config(['$provide', '$routeProvider', function($provide, $routeProvider) {
    $provide.decorator('$httpBackend', ['$delegate', function($delegate) {
        var proxy = function(method, url, data, callback, headers) {
            var interceptor = function() {
              /* global delayMockAPIResponse */
                var _this = this,
                    _arguments = arguments;

                // Delay every API call except login, logout and the first items call
                // NOTE: Sometimes causes duplicate remove/complete leave animation.
                if (typeof delayMockAPIResponse !== 'undefined' && delayMockAPIResponse === true &&
                    url.startsWith('/api') &&
                    url !=='/api/authenticate' &&
                    url !=='/api/logout' &&
                    !url.endsWith('/items')){
                  setTimeout(function() {
                      callback.apply(_this, _arguments);
                  }, 500);
                }else{
                  callback.apply(_this, _arguments);
                }
            };
            return $delegate.call(this, method, url, data, interceptor, headers);
        };
        for(var key in $delegate) {
            proxy[key] = $delegate[key];
        }
        return proxy;
    }]);

    $routeProvider.when('/fresh', {
      resolve: {
        auth: ['$location', '$route', 'AuthenticationService', 'MockPlatformService', 'UserSessionService',
        function($location, $route, AuthenticationService, MockPlatformService, UserSessionService) {
          localStorage.clear();
          sessionStorage.clear();

          var user = {};
          if ($route.current.params.user) {
            if ($route.current.params.user === 'lauri') {
              user.username = 'lauri@ext.md';
              user.password = 'lauripwd';
            } else if ($route.current.params.user === 'jp') {
              user.username = 'jp@ext.md';
              user.password = 'jiipeepwd';
            }
          } else {
            user.username = 'timo@ext.md';
            user.password = 'timopwd';
          }

          if ($route.current.params.offline)
            UserSessionService.enableOffline(true);

          AuthenticationService.login(user).then(function() {
            MockPlatformService.setPlatformUIPreferences();
            $location.path('/my');
          });
        }]
      }
    });

    $routeProvider.when('/tutorial', {
      resolve: {
        auth: ['$location', '$route', 'AuthenticationService', 'UserSessionService',
        function($location, $route, AuthenticationService, UserSessionService) {
          localStorage.clear();
          sessionStorage.clear();
          if ($route.current.params.offline)
            UserSessionService.enableOffline(true);

          UserSessionService.createFakeUserUUID();
          $location.path('/');
        }]
      }
    });

  }])
  .run(['$httpBackend',
    function($httpBackend) {
      $httpBackend.whenGET(/^static\//).passThrough();
      $httpBackend.whenGET(/test\//).passThrough();
  }]);
