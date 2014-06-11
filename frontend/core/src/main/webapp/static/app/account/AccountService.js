'use strict';

function AccountService(BackendClientService, UserSessionService) {

  var logoutRegex = /logout/;
  var postLogoutRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    logoutRegex.source +
    /$/.source
    );

  return {
    getAccount: function() {
      return BackendClientService.get('/api/account',
        this.getAccountRegex)
      .then(function(accountResponse) {
        if (accountResponse.status === 200 && accountResponse.data.email){
          UserSessionService.setEmail(accountResponse.data.email);
          UserSessionService.setTransportPreferences(accountResponse.data.preferences);
        }
        return accountResponse.data;
      });
    },
    updateAccountPreferences: function() {
      var payload = {
        email: UserSessionService.getEmail(),
        preferences: UserSessionService.getTransportPreferences()
      };
      BackendClientService.putOnline('/api/account', this.putAccountRegex, payload);
    },
    logout: function() {
      return BackendClientService.postOnline('/api/logout', postLogoutRegexp).then(function(logoutResponse) {
        return logoutResponse.data;
      });
    },
    // Regular expressions for account requests
    getAccountRegex: new RegExp(/api\/account/.source),
    putAccountRegex: new RegExp(/api\/account/.source),
    postLogoutRegex: postLogoutRegexp,
    putChangePasswordRegex: new RegExp(
      /^/.source +
      BackendClientService.apiPrefixRegex.source +
      /password$/.source)
  };
}
AccountService['$inject'] = ['BackendClientService', 'UserSessionService'];
angular.module('em.services').factory('AccountService', AccountService);
