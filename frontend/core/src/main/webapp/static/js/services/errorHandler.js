/*global angular */
/*jslint white: true */

( function() {'use strict';

  angular.module('em.services').factory('errorHandler', [
    function() {
      return {
        errorMessage : null,
        setError : function(errorMessage) {
          this.errorMessage = errorMessage;
        },
        clear : function() {
          this.errorMessage = null;
        }
      };
    }]);
}());
