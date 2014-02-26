/* global angular */
'use strict';

function AuthenticationService($location, $q, BackendClientService, UserSessionService) {

  // Register refresh credentials callback to backend
  BackendClientService.registerRefreshCredentialsCallback(verifyAndUpdateAuthentication);

  // Register swapTokenCallback to backend
  var swapTokenCallback = function(request, authenticateResponse) {
    UserSessionService.setAuthenticateInformation(authenticateResponse);
    // Update backend client with new token
    BackendClientService.setEncodedCredentials(UserSessionService.getEncodedCredentials());    
  };
  BackendClientService.registerPrimaryPostCallback(swapTokenCallback);

  function swapTokenAndAuthenticate() {
    var deferred = $q.defer();
    var remember = true;
    authenticate(remember).then(function(authenticateResponse) {
      UserSessionService.setAuthenticateInformation(authenticateResponse);
      // Update backend client with new token
      BackendClientService.setEncodedCredentials(UserSessionService.getEncodedCredentials());    
      deferred.resolve();
    });
    return deferred.promise;
  }

  function authenticate(remember) {
    return BackendClientService.postOnline('/api/authenticate', authenticateRegexp,
                {rememberMe: remember},
            true, 400).
      then(function(authenticateResponse) {
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
          // Make sure the latest credentials are in use
          BackendClientService.setEncodedCredentials(UserSessionService.getEncodedCredentials());
          if (UserSessionService.isOfflineEnabled()){
            // Push token swap to be the first thing that is done
            // when online connection is up
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
      BackendClientService.setUsernamePassword(user.username, user.password);
      return authenticate(remember).then(function(authenticateResponse) {
        UserSessionService.setAuthenticateInformation(authenticateResponse);
        // Update backend client to use token authentication instead of username/password
        BackendClientService.setEncodedCredentials(UserSessionService.getEncodedCredentials());
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
        this.getInviteRegex, true);
    },
    getInviteWithUUID: function(uuid) {
      return BackendClientService.get('/api/invite/' + uuid,
        this.getInviteRegex, true);
    },
    signUp: function(inviteResponseCode, data) {
      return BackendClientService.postOnline('/api/invite/' + inviteResponseCode + '/accept',
        this.acceptInviteRegex, data, true);
    },
    postInviteRequest: function(email) {
      return BackendClientService.postOnline(
        '/api/invite/request',
        this.postInviteRequestRegex,
        {email: email},
        true);
    },
    getInviteRequestQueueNumber: function(uuid) {
      return BackendClientService.get('/api/invite/request/' + uuid,
        this.getInviteRequestQueueNumberRegex, true);
    },
    switchActiveUUID: function(uuid) {
      UserSessionService.setActiveUUID(uuid);
    },
    // Regular expressions for account requests
    authenticateRegex: authenticateRegexp,
    logoutRegex: /api\/logout/,
    // TODO: Make regex! Bump!
    postInviteRequestRegex: /api\/invite\/request/,
    getInviteRegex: /api\/invite\/.*/,
    acceptInviteRegex: /api\/invite\/.*/,
    getInviteRequestQueueNumberRegex: /api\/invite\/.*/,

  };
}
AuthenticationService.$inject = ['$location', '$q', 'BackendClientService', 'UserSessionService'];
angular.module('em.services').factory('AuthenticationService', AuthenticationService);
