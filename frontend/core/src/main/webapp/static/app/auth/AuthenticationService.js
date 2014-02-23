/* global angular */
'use strict';

function AuthenticationService($location, $q, BackendClientService, UserSessionService) {
  
  // Register refresh credentials callback to backend
  BackendClientService.registerRefreshCredentialsCallback(verifyAndUpdateAuthentication);

  // Register swapTokenCallback to backend
  var swapTokenCallback = function(request, authenticateResponse) {
    UserSessionService.setAuthenticateInformation(authenticateResponse);
  };
  BackendClientService.registerPrimaryPostCallback(swapTokenCallback);

  function swapTokenAndAuthenticate() {
    var deferred = $q.defer();
    var remember = true;
    UserSessionService.setEncodedCredentialsFromLocalStorage();

    authenticate(remember).then(function(authenticateResponse) {
      UserSessionService.setAuthenticateInformation(authenticateResponse);
      deferred.resolve();
    });
    return deferred.promise;
  }

  function authenticate(remember) {
    var authenticateRequest = BackendClientService.postOnline('/api/authenticate', authenticateRegexp, {
      rememberMe: remember
    }, true);
    return authenticateRequest.then(function(authenticateResponse) {
      return authenticateResponse.data;
    });
  }

  var authenticateRegexp = /api\/authenticate/;

  function verifyAndUpdateAuthentication(){
    var deferredAuthentication = $q.defer();
    function validateAuthentication() {
      deferredAuthentication.resolve();
    }

    if (UserSessionService.isAuthenticated()) {
      if (UserSessionService.isAuthenticateValid()) {
        validateAuthentication();
      } else {
        if (UserSessionService.isAuthenticateReplaceable()) {
          if (UserSessionService.isOfflineEnabled()){
            // Push token swap to be the first thing that is done
            // when online connection is up
            UserSessionService.setEncodedCredentialsFromLocalStorage();
            BackendClientService.postPrimary('/api/authenticate', authenticateRegexp, {
              rememberMe: true
            });
            validateAuthentication();
          }else{
            // Online
            swapTokenAndAuthenticate().then(validateAuthentication);
          }
        } else {
          deferredAuthentication.reject();
        }
      }
    } else {
      deferredAuthentication.reject();
    }

    deferredAuthentication.promise.then(null, function() {
      $location.path('/login');
    });
    return deferredAuthentication.promise;
  }

  return {
    verifyAndUpdateAuthentication: function() {
      return verifyAndUpdateAuthentication();
    },
    login: function(user) {
      var remember = user.remember || false;
      UserSessionService.setCredentials(user.username, user.password);
      return authenticate(remember).then(function(authenticateResponse) {
        UserSessionService.setAuthenticateInformation(authenticateResponse);
      });
    },
    logout: function() {
      return BackendClientService.postOnline('/api/logout', this.logoutRegex).then(function(logoutResponse) {
        UserSessionService.clearUser();
        return logoutResponse.data;
      });
    },
    getInvite: function(inviteResponseCode, email) {
      return BackendClientService.get('/api/invite/' + inviteResponseCode + '?email=' + email,
        this.getInviteRegex);
    },
    signUp: function(inviteResponseCode, data) {
      return BackendClientService.postOnline('/api/invite/' + inviteResponseCode + '/accept',
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
AuthenticationService.$inject = ['$location', '$q', 'BackendClientService', 'UserSessionService'];
angular.module('em.services').factory('AuthenticationService', AuthenticationService);
