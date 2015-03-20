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

var path = location.pathname.substring(1);
if (path && path === 'ios') {
  var packaging = 'ios-cordova';
}
angular.module('em.appTest').constant('packaging', (typeof packaging !== 'undefined') ? packaging : 'devel');

angular.module('em.appTest')
  .controller('MockController', ['$rootScope', 'MockBackendService', 'SwiperService', 'packaging',
    function($rootScope, MockBackendService, SwiperService, packaging){
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

  }])
  .config(['$provide', '$routeProvider', function($provide, $routeProvider) {
    $provide.decorator('$httpBackend', ['$delegate', function($delegate) {
        var proxy = function(method, url, data, callback, headers) {
            var interceptor = function() {
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

    $routeProvider.when('/new', {
      resolve: {
        auth: ['$location', '$route', 'AuthenticationService', 'UserSessionService',
        function($location, $route, AuthenticationService, UserSessionService) {
          localStorage.clear();
          sessionStorage.clear();
          if ($route.current.params.offline)
            UserSessionService.enableOffline(true);

          AuthenticationService.login({username: 'timo@ext.md', password: 'timopwd'}).then(function() {
            UserSessionService.setUIPreference('focusTasksOnboarded', 'devel');
            UserSessionService.setUIPreference('focusNotesOnboarded', 'devel');
            UserSessionService.setUIPreference('inboxOnboarded', 'devel');
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

    $routeProvider.when('/login', {
      resolve: {
        auth: ['$location', '$route', 'AuthenticationService', 'UserSessionService',
        function($location, $route, AuthenticationService, UserSessionService) {
          localStorage.clear();
          sessionStorage.clear();
          if ($route.current.params.offline)
            UserSessionService.enableOffline(true);

          $location.path('/');
        }]
      }
    });

    $routeProvider.when('/ios', {
      resolve: {
        auth: ['$location', '$route', 'AuthenticationService', 'UserSessionService', 'packaging',
        function($location, $route, AuthenticationService, UserSessionService, packaging) {
          localStorage.clear();
          sessionStorage.clear();
          if ($route.current.params.offline)
            UserSessionService.enableOffline(true);

          var calendars = {
            iPhone: [{
              id: 1,
              name: 'first'
            }]
          };

          AuthenticationService.login({username: 'timo@ext.md', password: 'timopwd'}).then(function() {
            UserSessionService.setUIPreference('calendars', calendars);
            $location.path('/my');
          });

          if (!window.plugins)
            window.plugins = {};

          var listCalendars = [
          {
            id:1,
            name: 'first'
          },
          {
            id: 2,
            name: 'second'
          }];

          var eventInstances = [{
            calendar_id: 1,
            event_id: 100,
            title: 'first event',
            begin: Date.now(),
            end: Date.now(),
            allDay: true,
            location: 'location location location',
            rrule: true
          }];

          window.plugins.calendar = {
            listCalendars: function(success) {
              return success(listCalendars);
            },
            listEventInstances: function(calendarIds, startDate, endDate, success) {
              var filteredEventInstancesByCalendarIds = [];
              for (var i = 0; i < eventInstances.length; i++) {
                if (calendarIds.indexOf(eventInstances[i].calendar_id) !== -1) {
                  filteredEventInstancesByCalendarIds.push(eventInstances[i]);
                }
              }
              return success(filteredEventInstancesByCalendarIds);
            }
          };

          if (!window.device)
            window.device = {};

          window.device.model = 'iPhone';
        }]
      }
    });

  }])
  .run(['$httpBackend',
    function($httpBackend) {
      $httpBackend.whenGET(/^static\//).passThrough();
      $httpBackend.whenGET(/test\//).passThrough();
  }]);
