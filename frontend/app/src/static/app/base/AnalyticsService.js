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
 'use strict';

function AnalyticsService($injector, $q, $rootScope, $timeout, $window, BackendClientService,
                          UserSessionService, packaging, version, collectAnalytics) {

  function generateRandomPiwikId() {
    var letters = '0123456789abcdef'.split('');
    var randomId = '';
    for (var i = 0; i < 6; i++ ) {
      randomId += letters[Math.floor(Math.random() * 16)];
    }
    return randomId;
  }
  var sessionId = generateRandomPiwikId();

  var ANALYTICS_URL = '/analytics/piwik.php';
  // These values need to be configured and activated in Piwik in this order
  // for analytics to work
  var DIMENSION_PACKAGING_ID = 1;
  var DIMENSION_VERSION_ID = 2;
  var DIMENSION_USER_TYPE = 3;
  var DIMENSION_SUBSCRIPTION_TYPE = 4;
  var DIMENSION_COHORT = 5;

  var VARIABLE_OLD_UUID = 1;

  function getPayload(category, action, variables){
    var now = new Date();
    var urlPrefix = BackendClientService.getUrlPrefix();
    var $location = $injector.get('$location');
    if (urlPrefix === ''){
      // Web version has an empty prefix, but analytics needs a full path
      urlPrefix = $location.protocol() + '://' + $location.host();
      var port = $location.port();
      if (port !== 80 && port !== 443){
        urlPrefix += ':' + port;
      }
    }
    var currentUrl = urlPrefix + $location.path();
    var analyticsUser = UserSessionService.getAnalyticsUser();
    var uuid = analyticsUser.uuid;

    var request = '?idsite=1&rec=1&apiv=1&cookie=0&url=' + currentUrl +
              '&r=' + String(Math.random()).slice(2, 8) +
              '&_id=' + sessionId +
              '&h=' + now.getHours() + '&m=' + now.getMinutes() + '&s=' + now.getSeconds() +
              '&e_c=' + category +
              '&e_n=' + action +
              '&res=' + $window.screen.width + 'x' + $window.screen.height;

    if (uuid && uuid.length){
      request += '&uid=' + uuid;
    }

    // Add dimensions

    request += '&dimension' + DIMENSION_PACKAGING_ID + '=' + packaging +
              '&dimension' + DIMENSION_VERSION_ID + '=' + version +
              '&dimension' + DIMENSION_USER_TYPE + '=' + analyticsUser.userType +
              '&dimension' + DIMENSION_SUBSCRIPTION_TYPE + '=' + analyticsUser.subscriptionType +
              '&dimension' + DIMENSION_COHORT + '=' + analyticsUser.cohort;

    if (analyticsUser.created){
     request += '&_idts=' + Math.floor(analyticsUser.created / 1000);
    }

    if (variables && variables.length){
      var cvar = '&_cvar={';
      for(var i=0; i<variables.length; i++){
        if (i>0) cvar += ',';
        cvar += '"' + variables[i].index +'":["' + variables[i].name + '","' + variables[i].value + '"]';
      }
      cvar += '}';
      request += cvar;
    }

    return {
      requests: [request]
    };
  }
  function postAnalytics(payload, forceOnline){
    if (!forceOnline){
      BackendClientService.postLast(ANALYTICS_URL, payload);
    }else{
      BackendClientService.postLastOnline(ANALYTICS_URL, payload);
    }
  }

  function sendAnalytics(type, description){
    return postAnalytics(getPayload(type, description));
  }

  return {
    visit: function(category, location, online) {
      if (collectAnalytics){
        var payload = getPayload(category, 'visit_' + location);
        return postAnalytics(payload, online);
      }
    },
    do: function(category, action, variables) {
      if (collectAnalytics){
        return sendAnalytics(category, action, variables);
      }
    },
    doWithOldUuid: function(category, action, oldUUID, online) {
      if (collectAnalytics){
        var variables = [];
        variables.push({
          index: VARIABLE_OLD_UUID,
          name: 'old_uuid',
          value: oldUUID
        });
        var payload = getPayload(category, action, variables);
        return postAnalytics(payload, online);
      }
    },
    error: function(location, errorType) {
      if (collectAnalytics){
        return sendAnalytics('error_' + location, errorType);
      }
    },
    startSession: function() {
      if (collectAnalytics){
        var payload = getPayload('session', 'start_session');
        return postAnalytics(payload);
      }
    }
  };
}
AnalyticsService['$inject'] = ['$injector', '$q', '$rootScope', '$timeout', '$window', 'BackendClientService',
'UserSessionService', 'packaging', 'version', 'collectAnalytics'];
angular.module('em.base').factory('AnalyticsService', AnalyticsService);
