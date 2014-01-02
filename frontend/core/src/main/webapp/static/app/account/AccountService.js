/*global angular */
'use strict';

function AccountService(httpRequest) {
  return {
    account: function() {
      return httpRequest.get('/api/account').then(function(accountResponse) {
        return accountResponse.data;
      });
    }
  };
}
AccountService.$inject = ['httpRequest'];
angular.module('em.services').factory('AccountService', AccountService);