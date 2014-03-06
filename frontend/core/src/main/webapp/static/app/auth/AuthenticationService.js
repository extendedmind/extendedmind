'use strict';

function AuthenticationService($rootScope, $location, $q, BackendClientService, UserSessionService) {

  var acceptRegex = /\/accept/;
  var authenticateRegex = /authenticate/;
  var emailRegex = /\?email=.+/;
  var inviteRegex = /invite\//;
  var logoutRegex = /logout/;
  var requestRegex = /request/;
  var passwordRegex = /password/;
  
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
    ),
  postForgotPasswordRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    passwordRegex.source +
    /\/forgot/.source +
    /$/.source
    ),
  getPasswordResetExpiresRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    passwordRegex.source +
    /\//.source +
    BackendClientService.hexCodeRegex.source +
    emailRegex.source +
    /$/.source
    ),
  postResetPasswordRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    passwordRegex.source +
    /\//.source +
    BackendClientService.hexCodeRegex.source +
    /\/reset/.source +
    /$/.source
    ),
  putChangePasswordRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    /password$/.source);

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
    var remember = true;
    return authenticate(remember).then(function(authenticateResponse) {
      var encodedCredentials = UserSessionService.setAuthenticateInformation(authenticateResponse.data);
      // Update backend client with new token
      BackendClientService.setCredentials(encodedCredentials);
      if (UserSessionService.isOfflineEnabled()){
        // As offline is still enabled, we want to remove possible duplicate swap token
        // calls from the backend client
        BackendClientService.clearPrimary();
      }
      return authenticateResponse;
    });
  }

  function authenticate(remember) {
    return BackendClientService.postOnline('/api/authenticate', postAuthenticateRegexp,
      {rememberMe: remember},
      true, [403, 404, 502]);
  }

  function verifyAndUpdateAuthentication(online){
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
          if (UserSessionService.isOfflineEnabled() && !online){
            // Push token swap to be the first thing that is done
            // when online connection is up
            BackendClientService.postPrimary('/api/authenticate', postAuthenticateRegexp, {
              rememberMe: true
            });
            validateAuthentication();
          }else{
            // Online
            swapTokenAndAuthenticate().then(function(){
              validateAuthentication();
            },function(error){
              // Error branch, emit onlineRequired
              if (error && (error.status === 404 || error.status === 502)){
                // Emit online required exception
                $rootScope.$emit('emException', {
                  type: 'onlineRequired',
                  status: error.status,
                  data: error.data,
                  retry: swapTokenAndAuthenticate,
                  redirectUrl: '/',
                  promise: deferredAuthentication
                });
              }
            });
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
      if (UserSessionService.getLatestModified() !== undefined){
        return verifyAndUpdateAuthentication();
      }else{
        // When there is no data in-memory, this needs to be done online 
        return verifyAndUpdateAuthentication(true);
      }
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
        true,
        [400, 404, 502])
      .then(function(inviteRequestResponse) {
        UserSessionService.setEmail(email);
        return inviteRequestResponse;
      });
    },
    signUp: function(inviteResponseCode, data) {
      return BackendClientService.postOnline('/api/invite/' + inviteResponseCode + '/accept',
        acceptInviteRegexp, data, true, [400, 404, 502]);
    },
    postForgotPassword: function(email) {
      return BackendClientService.postOnline(
        '/api/password/forgot',
        postForgotPasswordRegexp,
        {email: email}, true);
    },
    getPasswordResetExpires: function(resetCode, email) {
      return BackendClientService.get(
        '/api/password/' + resetCode + '?email=' + email,
        getPasswordResetExpiresRegexp,
        {email: email});
    },
    postResetPassword: function(resetCode, email, password) {
      return BackendClientService.postOnline(
        '/api/password/' + resetCode + '/reset',
        postResetPasswordRegexp,
        {email: email,
         password: password}, true);
    },
    putChangePassword: function(email, currentPassword, newPassword) {
      return BackendClientService.putOnlineWithUsernamePassword(
        '/api/password',
        this.putChangePasswordRegex,
        {password: newPassword},
        email,
        currentPassword);
    },
    // Regular expressions for account requests
    acceptInviteRegex: acceptInviteRegexp,
    getInviteRegex: getInviteRegexp,
    postAuthenticateRegex: postAuthenticateRegexp,
    postInviteRequestRegex: postInviteRequestRegexp,
    postLogoutRegex: postLogoutRegexp,
    postForgotPasswordRegex: postForgotPasswordRegexp,
    getPasswordResetExpiresRegex: getPasswordResetExpiresRegexp,
    postResetPasswordRegex: postResetPasswordRegexp,
    putChangePasswordRegex: putChangePasswordRegexp
  };
}
AuthenticationService.$inject = ['$rootScope', '$location', '$q', 'BackendClientService', 'UserSessionService'];
angular.module('em.services').factory('AuthenticationService', AuthenticationService);
