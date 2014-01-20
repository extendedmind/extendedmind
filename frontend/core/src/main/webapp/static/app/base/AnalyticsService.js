/*global angular, LocalyticsSession*/
'use strict';

function AnalyticsService() {

  var localyticsSession, options, analyticsKey;
  analyticsKey = '86ca78fb61cf6399b3db19b-17d1de8e-5be8-11e3-1702-004a77f8b47f';

  options = {
    logger: true
  };

  if (typeof analyticsKey !== 'undefined') {
    localyticsSession = LocalyticsSession(analyticsKey, options);
  }

  function localyticsUser () {
    // REMOVE WHEN LOCALYTICS TRIAL ENDS
    return true;
  }

  return {
    open: function() {
      if (localyticsSession && localyticsUser) {
        localyticsSession.open();
        localyticsSession.upload();
      }
    },
    close: function() {
      if (localyticsSession && localyticsUser) {
        localyticsSession.upload();
        localyticsSession.close();
      }
    },
    tag: function(event) {
      if (localyticsSession && localyticsUser) {
        localyticsSession.tagEvent(event);
      }
    },
    multitag: function(event, data) {
      if (localyticsSession && localyticsUser) {
        localyticsSession.tagEvent(event, data);
      }
    }
  };
}

angular.module('em.services').factory('AnalyticsService', AnalyticsService);
