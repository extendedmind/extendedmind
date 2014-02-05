/*global angular */
'use strict';

function AccountService(BackendClientService) {
  return {
    getAccount: function() {
      return BackendClientService.get('/api/account',
            this.getAccountRegex).then(function(result) {
        return result.data;
      });
    },
    // Regular expressions for account requests
    getAccountRegex :
        new RegExp(/api\/account/.source)
  };
}
AccountService.$inject = ['BackendClientService'];
angular.module('em.services').factory('AccountService', AccountService);
