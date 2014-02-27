/* global angular */
'use strict';

function AuthenticationService($location, $q, BackendClientService, UserSessionService) {

  // Register refresh credentials callback to backend
  BackendClientService.registerRefreshCredentialsCallback(verifyAndUpdateAuthentication);

  // Register swapTokenCallback to backend
  var swapTokenCallback = function(request, authenticateResponse) {
    var encodedCredentials = UserSessionService.setAuthenticateInformation(authenticateResponse);
    // Update backend client with new token
    BackendClientService.setCredentials(encodedCredentials);    
  };
  BackendClientService.registerPrimaryPostCallback(swapTokenCallback);

  function swapTokenAndAuthenticate() {
    var deferred = $q.defer();
    var remember = true;
    authenticate(remember).then(function(authenticateResponse) {
      var encodedCredentials = UserSessionService.setAuthenticateInformation(authenticateResponse.data);
      // Update backend client with new token
      BackendClientService.setCredentials(encodedCredentials);
      deferred.resolve();
    });
    return deferred.promise;
  }

  function authenticate(remember) {
    return BackendClientService.postOnline('/api/authenticate', authenticateRegex,
                {rememberMe: remember},
            true, [400, 404, 502]);
  }

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
          BackendClientService.setCredentials(UserSessionService.getCredentials());
          if (UserSessionService.isOfflineEnabled()){
            // Push token swap to be the first thing that is done
            // when online connection is up
            BackendClientService.postPrimary('/api/authenticate', authenticateRegex, {
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

  var acceptRegex = /\/accept/;
  var authRegex = /authenticate/;
  var authenticateRegex = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    authRegex.source +
    /$/.source
    );
  var inviteRegex = /invite\//;
  var logoutRegex = /logout/;
  var requestRegex = /request/;
  var requestSlashRegex = /request\//;
  var emailRegex = /\?email=.+/;

  return {
    verifyAndUpdateAuthentication: function() {
      return verifyAndUpdateAuthentication();
    },
    login: function(user) {
      var remember = user.remember || false;
      BackendClientService.setUsernamePassword(user.username, user.password);
      return authenticate(remember).then(function(authenticateResponse) {
        var encodedCredentials = UserSessionService.setAuthenticateInformation(authenticateResponse.data);
        // Update backend client to use token authentication instead of username/password
        BackendClientService.setCredentials(encodedCredentials);
        return authenticateResponse;
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
    signUp: function(inviteResponseCode, data) {
      return BackendClientService.postOnline('/api/invite/' + inviteResponseCode + '/accept',
        this.acceptInviteRegex, data, true, [400, 404, 502]);
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
    logoutRegex: new RegExp(
      /^/.source +
      BackendClientService.apiPrefixRegex.source +
      logoutRegex.source +
      /$/.source
      ),
    postInviteRequestRegex: new RegExp(
      /^/.source +
      BackendClientService.apiPrefixRegex.source +
      inviteRegex.source +
      requestRegex.source +
      /$/.source
      ),
    getInviteRegex: new RegExp(
      /^/.source +
      BackendClientService.apiPrefixRegex.source +
      inviteRegex.source +
      BackendClientService.hexCodeRegex.source +
      emailRegex.source +
      /$/.source
      ),
    acceptInviteRegex: new RegExp(
      /^/.source +
      BackendClientService.apiPrefixRegex.source +
      inviteRegex.source +
      BackendClientService.hexCodeRegex.source +
      acceptRegex.source +
      /$/.source
      ),
    getInviteRequestQueueNumberRegex: new RegExp(
      /^/.source +
      BackendClientService.apiPrefixRegex.source +
      inviteRegex.source +
      requestSlashRegex.source +
      BackendClientService.uuidRegex.source +
      /$/.source
      ),
  };
}
AuthenticationService.$inject = ['$location', '$q', 'BackendClientService', 'UserSessionService'];
angular.module('em.services').factory('AuthenticationService', AuthenticationService);
