/* Copyright 2013-2016 Extended Mind Technologies Oy
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

function AnalyticsService($location, $q, $rootScope, $timeout, $window, BackendClientService,
                          UserSessionService, packaging, version) {

  var collectAnalytics = packaging !== 'devel';

  function generateRandomPiwikId() {
    var letters = '0123456789abcdef'.split('');
    var randomId = '';
    for (var i = 0; i < 6; i++ ) {
        randomId += letters[Math.floor(Math.random() * 16)];
    }
    return randomId;
  }
  var sessionId = generateRandomPiwikId();

  var _cid;
  function getPiwikCid(){
    if (!_cid){
      _cid = generateRandomPiwikId();
    }
    return _cid;
  }

  var ANALYTICS_URL = '/analytics/piwik.php';

  function getPayload(category, action, id, variables, overrideNow){
    var now = overrideNow ? overrideNow : Date.now();
    var urlPrefix = BackendClientService.getUrlPrefix();
    if (urlPrefix === ''){
      // Web version has an empty prefix, but analytics needs a full path
      urlPrefix = $location.protocol() + '//' + $location.host();
      var port = $location.port();
      if (port !== 80 && port !== 443){
        urlPrefix += ':' + port;
      }
    }
    var currentUrl = urlPrefix + $location.path();

    request = '&idsite=1&rec=1' +
              '&rand=' + String(Math.random()).slice(2, 8) +
              '&_id=' + sessionId +
              '&h=' + now.getHours() + '&m=' + now.getMinutes() + '&s=' + now.getSeconds() +
              '&url=' + $window.encodeURIComponent(currentUrl) +
              '&action_name=' + $window.encodeURIComponent(category + '/' + action) +
              '&res=' + $window.screen.width + 'x' + $window.screen.height +
              ((id && id.length) ? ('&uid=' + id) : ('&cid=' + getPiwikCid()));

    if (variables && variables.length){
      var cvar = '&_cvar={';
      for(var i=0; i<variables.length; i++){
        if (i>0) cvar += ',';
        cvar += '"' + (i+1) +'":["' + variables[i].name + '","' + variables[i].value + '"]';
      }
      cvar += '}';
      request += cvar;
    }

    // TODO: analyticsUser, dimensions for version and packaging

    // OLD VERSION
/*
    var payload =  [
      {
        type: type,
        time: new Date().toISOString(),
        data: {
          packaging: packaging,
          version: version,
          session: session
        }
      }
    ];
    if (description){
      payload[0].data.description = description;
    }
    if (id){
      payload[0].id = id;
    }
    var user = UserSessionService.getAnalyticsUser();
    if (user){
      payload[0].data.user = user;
    }
*/

// Example actual piwik POST content:
/*
action_name=extended%20mind%20%E2%80%93%20manifesto&idsite=1&rec=1&r=112200&h=16&m=43&s=38&url=http%3A%2F%2Flocalhost%3A8008%2Fmanifesto&urlref=http%3A%2F%2Flocalhost%3A8008%2F&_id=6ffddb23578963a3&_idts=1462865698&_idvc=2&_idn=0&_refts=0&_viewts=1462887813&send_image=0&pdf=1&qt=0&realp=0&wma=0&dir=0&fla=0&java=0&gears=0&ag=0&cookie=1&res=1920x1080&gt_ms=46
Name*/

    return payload;
  };

  function postAnalytics(payload, forceOnline){
    if (!forceOnline){
      BackendClientService.postLast(ANALYTICS_URL, payload);
    }else{
      BackendClientService.postLastOnline(ANALYTICS_URL, payload);
    }
  }

  function sendAnalytics(type, description){
    return postAnalytics(getPayload(type, description));
  };

  return {
    visitEntry: function(location) {
      if (collectAnalytics){
        var payload = getPayload("entry", "visit_" + location);
        return postAnalytics(payload, true);
      }
    },
    visit: function(category, location) {
      if (collectAnalytics){
        return sendAnalytics(category, "visit_" + location);
      }
    },
    do: function(category, action, variables) {
      if (collectAnalytics){
        return sendAnalytics(category, action, variables);
      }
    },
    doWithUuid: function(category, action, uuid, online) {
      if (collectAnalytics){
        var payload = getPayload(category, action, uuid)
        if (!payload[0].data.user){
          payload[0].data.user = {uuid: uuid};
        }else{
          payload[0].data.user.uuid = uuid;
        }
        return postAnalytics(payload, online);
      }
    },
    error: function(location, errorType) {
      if (collectAnalytics){
        return sendAnalytics("error_" + location, errorType);
      }
    },
    startSession: function(id) {
      if (collectAnalytics){
        var overrideNow = Date.now();
        var payload = getPayload("session", "start_session", id, undefined, overrideNow);
        postAnalytics(payload);
        return overrideNow;
      }
    },
    stopSession: function(id, startTime) {
      if (collectAnalytics){
        var overrideNow = Date.now();
        var payload = getPayload("session", "stop_session", id,
                                 [{name: "sessionStart", value: startTime}],
                                 overrideNow);
        postAnalytics(payload);
        return overrideNow;
      }
    }
  };
}
AnalyticsService['$inject'] = ['$location', '$q', '$rootScope', '$timeout', '$window', 'BackendClientService',
'UserSessionService', 'packaging', 'version'];
angular.module('em.base').factory('AnalyticsService', AnalyticsService);
