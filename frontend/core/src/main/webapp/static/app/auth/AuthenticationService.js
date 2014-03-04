/* global angular */
'use strict';

function AuthenticationService($location, $q, BackendClientService, UserSessionService) {

  var acceptRegex = /\/accept/;
  var authenticateRegex = /authenticate/;
  var emailRegex = /\?email=.+/;
  var inviteRegex = /invite\//;
  var logoutRegex = /logout/;
  var requestRegex = /request/;
  
  var acceptInviteRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    inviteRegex.source +
    BackendClientService.hexCodeRegex.source +
    acceptRegex.source +
    /$/.source
    ),
  getInviteRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    inviteRegex.source +
    BackendClientService.hexCodeRegex.source +
    emailRegex.source +
    /$/.source
    ),
  postAuthenticateRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    authenticateRegex.source +
    /$/.source
    ),
  postInviteRequestRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    inviteRegex.source +
    requestRegex.source +
    /$/.source
    ),
  postLogoutRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    logoutRegex.source +
    /$/.source
    );

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
    return BackendClientService.postOnline('/api/authenticate', postAuthenticateRegexp,
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
            BackendClientService.postPrimary('/api/authenticate', postAuthenticateRegexp, {
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

  function checkEmailStatus(inviteRequestResponse) {
    // Redirect user with new invite request to waiting page, then show queue.
    if (inviteRequestResponse.data.resultType === 'newInviteRequest') {
      redirectToWaitingPage();
    }
    // Redirect user with existing invite request to waiting page, then show queue.
    else if (inviteRequestResponse.data.resultType === 'inviteRequest') {
      redirectToWaitingPage();
    }
    // Redirect invited user to waiting page, then show info text
    else if (inviteRequestResponse.data.resultType === 'invite') {
      $location.path('/waiting');
      $location.search({
        email: UserSessionService.getEmail()
      });
    }
    // Redirect existing user to front page.
    else if (inviteRequestResponse.data.resultType === 'user') {
      $location.path('/login');
    }

    function redirectToWaitingPage() {
      $location.path('/waiting');
      $location.search({
        uuid: inviteRequestResponse.data.result.uuid,
        queueNumber: inviteRequestResponse.data.queueNumber
      });
    }
  }

  return {
    verifyAndUpdateAuthentication: function() {
      return verifyAndUpdateAuthentication();
    },
    checkAndRedirectUser: function() {
      // Existing user
      if (UserSessionService.getUserUUID()) {
        $location.path('/my/tasks');
      } else if (UserSessionService.getEmail() && !UserSessionService.getUserUUID()) {
        BackendClientService.postOnline(
          '/api/invite/request',
          postInviteRequestRegexp,
          {email: UserSessionService.getEmail()},
          true)
        .then(checkEmailStatus);
      } else {
        $location.path('/launch');
      }
    },
    login: function(user) {
      var remember = user.remember || false;
      BackendClientService.setUsernamePassword(user.username, user.password);
      return authenticate(remember).then(function(authenticateResponse) {
        var encodedCredentials = UserSessionService.setAuthenticateInformation(authenticateResponse.data, user.username);
        // Update backend client to use token authentication instead of username/password
        BackendClientService.setCredentials(encodedCredentials);
        return authenticateResponse;
      });
    },
    logout: function() {
      return BackendClientService.postOnline('/api/logout', postLogoutRegexp).then(function(logoutResponse) {
        UserSessionService.clearUser();
        return logoutResponse.data;
      });
    },
    getInvite: function(inviteResponseCode, email) {
      return BackendClientService.get('/api/invite/' + inviteResponseCode + '?email=' + email,
        getInviteRegexp, true);
    },
    postInviteRequest: function(email) {
      return BackendClientService.postOnline(
        '/api/invite/request',
        postInviteRequestRegexp,
        {email: email},
        true)
      .then(function(inviteRequestResponse) {
        UserSessionService.setEmail(email);
        return inviteRequestResponse;
      });
    },
    signUp: function(inviteResponseCode, data) {
      return BackendClientService.postOnline('/api/invite/' + inviteResponseCode + '/accept',
        acceptInviteRegexp, data, true, [400, 404, 502]);
    },
    switchActiveUUID: function(uuid) {
      UserSessionService.setActiveUUID(uuid);
    },
    // Regular expressions for account requests
    acceptInviteRegex: acceptInviteRegexp,
    getInviteRegex: getInviteRegexp,
    postAuthenticateRegex: postAuthenticateRegexp,
    postInviteRequestRegex: postInviteRequestRegexp,
    postLogoutRegex: postLogoutRegexp,
  };
}
AuthenticationService.$inject = ['$location', '$q', 'BackendClientService', 'UserSessionService'];
angular.module('em.services').factory('AuthenticationService', AuthenticationService);
