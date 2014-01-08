/*global angular */
'use strict';

function AccountService(BackendClientService) {
  return {
    account: function() {
      return BackendClientService.get('/api/account').then(function(accountResponse) {
        return accountResponse.data;
      });
    }
  };
}
AccountService.$inject = ['BackendClientService'];
angular.module('em.services').factory('AccountService', AccountService);