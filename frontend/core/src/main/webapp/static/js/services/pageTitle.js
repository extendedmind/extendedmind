/*global angular */
/*jslint white: true */

( function() {'use strict';

  angular.module('em.services').factory('pageTitle', function() {
    var pageTitle, subTitle;

    pageTitle = null;
    subTitle = null;

    return {
      getSubTitle : function() {
        return subTitle;
      },
      getTitle : function() {
        return pageTitle;
      },
      setSubTitle : function(newsubTitle) {
        subTitle = newsubTitle;
        return subTitle;
      }
    };
  });
}());
