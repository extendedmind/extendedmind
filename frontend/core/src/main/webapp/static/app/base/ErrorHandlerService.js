/*global angular */
'use strict';

function ErrorHandlerService() {
  return {
    errorMessage : null,
    setError : function(errorMessage) {
      this.errorMessage = errorMessage;
    },
    clear : function() {
      this.errorMessage = null;
    }
  };
}
angular.module('em.services').factory('ErrorHandlerService', ErrorHandlerService);
