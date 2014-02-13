'use strict';

function AuthenticationService($location, $q, BackendClientService, UserSessionService) {

  function swapToken() {
    var remember = true;
    UserSessionService.setEncodedCredentialsFromLocalStorage();

    return requestLogin(remember);
  }

  function requestLogin(remember) {
    return BackendClientService.post('/api/authenticate', authenticateRegexp, {
      rememberMe: remember
    }).then(function(authenticateResponse) {
      UserSessionService.setAuthenticateInformation(authenticateResponse.data);
    });
  }

  var authenticateRegexp = /api\/authenticate/;

  return {
    verifyAndUpdateAuthentication: function() {
      var deferredAuthentication = $q.defer();

      if (UserSessionService.isAuthenticated()) {
        if (UserSessionService.isAuthenticateValid()) {
          validateAuthentication();
        } else {
          if (UserSessionService.isAuthenticateReplaceable()) {
            swapToken().then(validateAuthentication);
          } else {
            deferredAuthentication.reject();
          }
        }
      } else {
        deferredAuthentication.reject();
      }
      function validateAuthentication() {
        deferredAuthentication.resolve();
      }
      deferredAuthentication.promise.then(null, function() {
        $location.path('/login');
      });
      return deferredAuthentication.promise;
    },
    login: function(user) {
      var remember = user.remember || false;
      UserSessionService.setCredentials(user.username, user.password);

      return requestLogin(remember);
    },
    logout: function() {
      return BackendClientService.post('/api/logout', this.logoutRegex).then(function(logoutResponse) {
        UserSessionService.clearUser();
        return logoutResponse.data;
      });
    },
    getInvite: function(inviteResponseCode, email) {
      return BackendClientService.get('/api/invite/' + inviteResponseCode + '?email=' + email,
        this.getInviteRegex);
    },
    signUp: function(inviteResponseCode, data) {
      return BackendClientService.post('/api/invite/' + inviteResponseCode + '/accept',
        this.acceptInviteRegex, data);
    },
    switchActiveUUID: function(uuid) {
      UserSessionService.setActiveUUID(uuid);
    },
    // Regular expressions for account requests
    authenticateRegex: authenticateRegexp,
    logoutRegex: /api\/logout/,
    // TODO: Make regex!
    getInviteRegex: /api\/invite\/.*/,
    acceptInviteRegex: /api\/invite\/.*/,

  };
}
AuthenticationService['$inject'] = ['$location', '$q', 'BackendClientService', 'UserSessionService'];
angular.module('em.services').factory('AuthenticationService', AuthenticationService);
