'use strict';

function AccountService(BackendClientService, UserSessionService) {
  return {
    getAccount: function() {
      return BackendClientService.get('/api/account',
        this.getAccountRegex)
      .then(function(accountResponse) {
        if (accountResponse.status === 200 && accountResponse.data.email){
          UserSessionService.setEmail(accountResponse.data.email);
        }
        return accountResponse.data;
      });
    },
    // Regular expressions for account requests
    getAccountRegex: new RegExp(/api\/account/.source),
    putChangePasswordRegex: new RegExp(
      /^/.source +
      BackendClientService.apiPrefixRegex.source +
      /password$/.source)
  };
}
AccountService['$inject'] = ['BackendClientService', 'UserSessionService'];
angular.module('em.services').factory('AccountService', AccountService);
