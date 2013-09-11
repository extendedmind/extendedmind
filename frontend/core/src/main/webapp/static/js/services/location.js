/*global angular*/

( function() {'use strict';

    angular.module('em.services').factory('locationHandler', function() {
      var nextLocation, previousLocation;

      return {
        setNextLocation : function(location) {
          nextLocation = location;
        },
        getNextLocation : function() {
          return nextLocation;
        },
        setPreviousLocation : function(location) {
          previousLocation = location;
        },
        getPreviousLocation : function() {
          return previousLocation;
        }
      };
    });
  }());
