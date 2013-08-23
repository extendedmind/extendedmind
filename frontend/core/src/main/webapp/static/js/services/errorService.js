/*global angular*/

( function() {'use strict';

    angular.module('em.services').factory('errorService', [
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
