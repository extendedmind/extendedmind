/*global angular*/

( function() {'use strict';

    angular.module('em.services').factory('pageTitle', function() {
      var pageTitle, subTitle;

      pageTitle = 'extended mind';
      subTitle = null;

      return {
        getSubTitle : function() {
          return subTitle;
        },
        getTitle : function() {
          if (subTitle !== null) {
            return pageTitle + ' | ' + subTitle;
          }
          return pageTitle;
        },
        setSubTitle : function(newsubTitle) {
          subTitle = newsubTitle;
          return subTitle;
        }
      };
    });
  }());
