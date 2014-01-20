/*global analyticsKey, angular, LocalyticsSession*/
'use strict';

function AnalyticsService() {

  var localyticsSession, options;

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
    open : function() {
      if (localyticsSession && localyticsUser) {
        localyticsSession.open();
        localyticsSession.upload();
      }
    },
    close : function() {
      if (localyticsSession && localyticsUser) {
        localyticsSession.upload();
        localyticsSession.close();
      }
    },
    tag : function(event) {
      if (localyticsSession && localyticsUser) {
        localyticsSession.tagEvent(event);
      }
    },
    multitag : function(event, data) {
      if (localyticsSession && localyticsUser) {
        localyticsSession.tagEvent(event, data);
      }
    }
  };
}

angular.module('em.services').factory('AnalyticsService', AnalyticsService);
