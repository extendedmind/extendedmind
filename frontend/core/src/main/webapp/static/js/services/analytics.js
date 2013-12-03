/*jslint white: true */
'use strict';

angular.module('em.services').factory('analytics', [

  function() {

    var options = {  
     logger: true
   };

   if (typeof analyticsKey === 'undefined') {
    // Localtyics PRODUCTION KEY
    analyticsKey = '86ca78fb61cf6399b3db19b-17d1de8e-5be8-11e3-1702-004a77f8b47f';
  }
  var localyticsSession = LocalyticsSession(analyticsKey, options);

  return {

    open : function() {
      localyticsSession.open();
      localyticsSession.upload();
    },

    close : function() {
      localyticsSession.upload();
      localyticsSession.close();
    },

    tag : function(event) {
      localyticsSession.tagEvent(event);
    },

    multitag : function(event, data) {
      localyticsSession.tagEvent(event, data);
    }
  }

}]);
