/*global analyticsKey*/
/*jslint white: true */
//'use strict';

angular.module('em.services').factory('analytics', [ 'userSessionStorage',

  function(userSessionStorage) {

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
  /*  if (userSessionStorage.getUserType() === 2 || 
      userSessionStorage.getUserType() === 3) {
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
