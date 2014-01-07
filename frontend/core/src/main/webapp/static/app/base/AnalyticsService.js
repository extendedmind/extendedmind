/*global analyticsKey*/
/*jslint white: true */
//'use strict';

angular.module('em.services').factory('AnalyticsService', [ 'SessionStorageService',

  function(SessionStorageService) {

    var localyticsSession,options;

    options = {  
     logger: true
   };

   if (typeof analyticsKey !== 'undefined') {
     localyticsSession = LocalyticsSession(analyticsKey, options);
   }

   function localyticsUser () {
  // REMOVE WHEN LOCALYTICS TRIAL ENDS
    return true;
  /*  if (SessionStorageService.getUserType() === 2 || 
      SessionStorageService.getUserType() === 3) {
      return true;
  }*/
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
}

}]);
