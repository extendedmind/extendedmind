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
  postVerifyEmailRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    /email\//.source +
    BackendClientService.hexCodeRegex.source +
    /\/verify/.source +
    /$/.source
    ),
  putChangePasswordRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    /password$/.source
    ),
  postInviteRequestBypassRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    inviteRegex.source +
    requestRegex.source +
    /\//.source +
    BackendClientService.uuidRegex.source +
    /\/bypass$/.source),
  resendInviteRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    inviteRegex.source +
    BackendClientService.uuidRegex.source +
    /\/resend$/.source);

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
    var payload = {rememberMe: remember};
    if (remember && $rootScope.packaging.endsWith('phonegap')){
      // In apps use extended 90 day replaceable authentication
      payload.extended = true;
    }
    return BackendClientService.postOnline('/api/authenticate', postAuthenticateRegexp,
      payload,
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

  function checkEmailStatus(inviteRequestResponse, user) {
    // Redirect user with new invite request to waiting page, then show queue.
    if (inviteRequestResponse.data.resultType === 'newInviteRequest') {
      redirectToInviteWaitingPage();
    }
    // Redirect user with existing invite request to waiting page, then show queue.
    else if (inviteRequestResponse.data.resultType === 'inviteRequest') {
      redirectToInviteWaitingPage();
    }
    // Redirect invited user to waiting page, then show info text
    else if (inviteRequestResponse.data.resultType === 'invite') {
      $location.path('/waiting');
      $location.search({
        uuid: inviteRequestResponse.data.result.uuid,
        email: user.email,
        invite: true
      });
    }
    // Redirect existing user to front page.
    else if (inviteRequestResponse.data.resultType === 'user') {
      $location.path('/login');
    // Redirect coupon to waiting page with possibility to give coupon
    }else if (inviteRequestResponse.data.resultType === 'inviteCoupon') {
      $location.path('/waiting');
      $location.search({
        uuid: inviteRequestResponse.data.result.uuid,
        queueNumber: inviteRequestResponse.data.queueNumber,
        email: user.email,
        coupon: true
      });
    }
    // Accept invite directly by bypassing queue
    else if (inviteRequestResponse.data.resultType === 'inviteAutomatic') {
      postInviteRequestBypass(inviteRequestResponse.data.result.uuid, user.email).then(
      function(inviteResponse){
        if (inviteResponse.data){
          $location.path('/accept/' + inviteResponse.data.code);
          $location.search({
            email: user.email,
            bypass: true
          });
        }
      }, function(/*error*/){
        return false;
      });
    }
    function redirectToInviteWaitingPage() {
      $location.path('/waiting');
      $location.search({
        uuid: inviteRequestResponse.data.result.uuid,
        queueNumber: inviteRequestResponse.data.queueNumber,
        request: true
      });
    }
    return true;
  }

  function postInviteRequestBypass(uuid, email, coupon) {
    var payload = {email: email};
    if (coupon){
      payload.inviteCoupon = coupon;
    }
    return BackendClientService.postOnline(
      '/api/invite/request/' + uuid + '/bypass',
      postInviteRequestBypassRegexp,
      payload,
      true,
      [400, 404, 502]);
  }

  return {
    verifyAndUpdateAuthentication: function() {
      if (UserSessionService.getLatestModified(UserSessionService.getUserUUID()) !== undefined){
        return verifyAndUpdateAuthentication();
      }else{
        // When there is no data in-memory, this needs to be done online
        return verifyAndUpdateAuthentication(true);
      }
    },
    checkEmailStatus: function(response, user) {
      return checkEmailStatus(response, user);
    },
    checkAndRedirectUser: function() {
      // Existing user
      if (UserSessionService.getUserUUID()) {
        $location.path('/my/tasks');
      } else if (UserSessionService.getEmail() && !UserSessionService.getUserUUID()) {
        BackendClientService.postOnline(
          '/api/invite/request',
          postInviteRequestRegexp,
          {email: UserSessionService.getEmail(),
           bypass: true},
          true)
        .then(function(response) {
          checkEmailStatus(response, {email: UserSessionService.getEmail()});
        });
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
        {email: email,
         bypass: true},
        true,
        [400, 404, 502])
      .then(function(inviteRequestResponse) {
        UserSessionService.setEmail(email);
        return inviteRequestResponse;
      });
    },
    postInviteRequestBypass: function(uuid, email, coupon) {
      return postInviteRequestBypass(uuid, email, coupon);
    },
    resendInvite: function(uuid, email) {
      console.log(resendInviteRegexp)
      return BackendClientService.postOnline('/api/invite/' + uuid + '/resend',
        resendInviteRegexp, {email: email}, true);
    },
    acceptInvite: function(inviteResponseCode, data) {
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
    postVerifyEmail: function(resetCode, email) {
      return BackendClientService.postOnline(
        '/api/email/' + resetCode + '/verify',
        postVerifyEmailRegexp,
        {email: email}, true);
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
    putChangePasswordRegex: putChangePasswordRegexp,
    postVerifyEmailRegex: postVerifyEmailRegexp,
    postInviteRequestBypassRegex: postInviteRequestBypassRegexp,
    resendInviteRegex: resendInviteRegexp
  };
}
AuthenticationService.$inject = ['$rootScope', '$location', '$q', 'BackendClientService', 'UserSessionService'];
angular.module('em.services').factory('AuthenticationService', AuthenticationService);
