/* Copyright 2013-2014 Extended Mind Technologies Oy
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 'use strict';

 function AuthenticationService($location, $q, $rootScope, BackendClientService, UserSessionService) {

  var acceptRegex = /\/accept/;
  var authenticateRegex = /authenticate/;
  var emailRegex = /\?email=.+/;
  var inviteRegex = /invite\//;
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
  signUpRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    /signup/.source +
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
  BackendClientService.registerPrimaryPostResultCallback(swapTokenCallback);

  function getAuthenticatePayload(remember) {
    var payload = {rememberMe: remember};
    if (remember && $rootScope.packaging.endsWith('cordova')) {
      // In apps use extended 90 day replaceable authentication
      payload.extended = true;
    }
    return payload;
  }

  // Register authentication create callback
  var createAuthenticationRequest = function() {
    if (UserSessionService.isAuthenticated() &&
      !UserSessionService.isAuthenticateValid() &&
      UserSessionService.isAuthenticateReplaceable()) {
      // Make sure the latest credentials are in use
    BackendClientService.setCredentials(UserSessionService.getCredentials());
      // Create new primary request
      return {url: '/api/authenticate', data: getAuthenticatePayload(true)};
    }
  };
  BackendClientService.registerPrimaryPostCreateCallback(createAuthenticationRequest);

  function swapTokenAndAuthenticate() {
    var remember = true;
    return authenticate(remember).then(function(authenticateResponse) {
      var encodedCredentials = UserSessionService.setAuthenticateInformation(authenticateResponse.data);
      // Update backend client with new token
      BackendClientService.setCredentials(encodedCredentials);
      if (UserSessionService.isOfflineEnabled()) {
        // As offline is still enabled, we want to remove possible duplicate swap token
        // calls from the backend client
        BackendClientService.clearPrimary();
      }
      return authenticateResponse;
    });
  }

  function sanitizeEmail(email) {
    if (email) {
      return email.toLowerCase();
    }
  }

  function authenticate(remember) {
    return BackendClientService.postOnline('/api/authenticate', postAuthenticateRegexp,
      getAuthenticatePayload(remember),
      true, [0, 403, 404, 502]);
  }

  function verifyAndUpdateAuthentication(online) {
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
          if (UserSessionService.isOfflineEnabled() && !online) {
            // Push token swap to be the first thing that is done
            // when online connection is up
            BackendClientService.postPrimary('/api/authenticate', postAuthenticateRegexp, getAuthenticatePayload(true));
            validateAuthentication();
          } else {
            // Online
            swapTokenAndAuthenticate().then(function() {
              validateAuthentication();
            },function(error) {
              // Error branch, emit onlineRequired
              if (BackendClientService.isOffline(error.status)) {
                // Emit online required exception
                $rootScope.$emit('emException', {
                  type: 'onlineRequired',
                  status: error.status,
                  data: error.data,
                  retry: swapTokenAndAuthenticate,
                  redirectUrl: '/',
                  promise: deferredAuthentication
                });
              }else {
                $rootScope.$emit('emException', {type: 'http', status: error.status, data: error.data, url: error.config.url});
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
    user.email = sanitizeEmail(user.email);
    // Redirect user with new invite request to waiting page, then show queue.
    if (inviteRequestResponse.data.resultType === 'newInviteRequest') {
      redirectToInviteWaitingPage();
    }
    // Redirect user with existing invite request to waiting page, then show queue.
    else if (inviteRequestResponse.data.resultType === 'inviteRequest') {
      redirectToInviteWaitingPage();
    }
    // Redirect invited user either to sign up page or to to waiting page
    else if (inviteRequestResponse.data.resultType === 'invite') {
      if (inviteRequestResponse.data.code) {
        // Code given directly, go to sign up
        $location.path('/accept/' + inviteRequestResponse.data.code);
        $location.search({
          email: user.email,
          bypass: true
        });
      } else {
        $location.path('/waiting');
        $location.search({
          uuid: inviteRequestResponse.data.result.uuid,
          email: user.email,
          invite: true
        });
      }
    }
    // Redirect existing user to front page.
    else if (inviteRequestResponse.data.resultType === 'user') {
      $location.path('/login');
    // Redirect coupon to waiting page with possibility to give coupon
  } else if (inviteRequestResponse.data.resultType === 'inviteCoupon') {
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
        function(inviteResponse) {
          if (inviteResponse.data) {
            $location.path('/accept/' + inviteResponse.data.code);
            $location.search({
              email: user.email,
              bypass: true
            });
          }
        }, function(/*error*/) {
          return false;
        });
    // Redirect user to sign up
  } else if (inviteRequestResponse.data.resultType === 'signUp') {
    $location.path('/signup');
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
  var payload = {email: sanitizeEmail(email)};
  if (coupon) {
    payload.inviteCoupon = coupon;
  }
  return BackendClientService.postOnline(
    '/api/invite/request/' + uuid + '/bypass',
    postInviteRequestBypassRegexp,
    payload,
    true,
    [0, 400, 404, 502]);
}

return {
  verifyAndUpdateAuthentication: function() {
    if (UserSessionService.getLatestModified(UserSessionService.getUserUUID()) !== undefined) {
      return verifyAndUpdateAuthentication();
    } else {
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
        $location.path('/my');
      } else if (UserSessionService.getEmail() && !UserSessionService.getUserUUID()) {
        BackendClientService.postOnline(
          '/api/invite/request',
          postInviteRequestRegexp,
          {email: sanitizeEmail(UserSessionService.getEmail()),
           bypass: true},
           true)
        .then(function(response) {
          checkEmailStatus(response, {email: sanitizeEmail(UserSessionService.getEmail())});
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
    getInvite: function(inviteResponseCode, email) {
      return BackendClientService.get('/api/invite/' + inviteResponseCode + '?email=' + sanitizeEmail(email),
        getInviteRegexp, true);
    },
    postInviteRequest: function(email) {
      return BackendClientService.postOnline(
        '/api/invite/request',
        postInviteRequestRegexp,
        {email: sanitizeEmail(email),
         bypass: true},
         true,
         [0, 400, 404, 502])
      .then(function(inviteRequestResponse) {
        UserSessionService.setEmail(sanitizeEmail(email));
        return inviteRequestResponse;
      });
    },
    postInviteRequestBypass: function(uuid, email, coupon) {
      return postInviteRequestBypass(uuid, sanitizeEmail(email), coupon);
    },
    resendInvite: function(uuid, email) {
      return BackendClientService.postOnline('/api/invite/' + uuid + '/resend',
        resendInviteRegexp, {email: sanitizeEmail(email)}, true);
    },
    acceptInvite: function(inviteResponseCode, data) {
      return BackendClientService.postOnline('/api/invite/' + inviteResponseCode + '/accept',
        acceptInviteRegexp, data, true, [0, 400, 404, 502]);
    },
    signUp: function(data) {
      return BackendClientService.postOnline('/api/signup',
        signUpRegexp, data, true, [0, 400, 404, 502]);
    },
    postForgotPassword: function(email) {
      return BackendClientService.postOnline(
        '/api/password/forgot',
        postForgotPasswordRegexp,
        {email: sanitizeEmail(email)}, true);
    },
    getPasswordResetExpires: function(resetCode, email) {
      return BackendClientService.get(
        '/api/password/' + resetCode + '?email=' + sanitizeEmail(email),
        getPasswordResetExpiresRegexp,
        {email: sanitizeEmail(email)});
    },
    postResetPassword: function(resetCode, email, password) {
      return BackendClientService.postOnline(
        '/api/password/' + resetCode + '/reset',
        postResetPasswordRegexp,
        {email: sanitizeEmail(email),
         password: password}, true);
    },
    postVerifyEmail: function(resetCode, email) {
      return BackendClientService.postOnline(
        '/api/email/' + resetCode + '/verify',
        postVerifyEmailRegexp,
        {email: sanitizeEmail(email)}, true);
    },
    putChangePassword: function(email, currentPassword, newPassword) {
      return BackendClientService.putOnlineWithUsernamePassword(
        '/api/password',
        this.putChangePasswordRegex,
        {password: newPassword},
        sanitizeEmail(email),
        currentPassword);
    },
    // Regular expressions for account requests
    acceptInviteRegex: acceptInviteRegexp,
    getInviteRegex: getInviteRegexp,
    postAuthenticateRegex: postAuthenticateRegexp,
    postInviteRequestRegex: postInviteRequestRegexp,
    postForgotPasswordRegex: postForgotPasswordRegexp,
    getPasswordResetExpiresRegex: getPasswordResetExpiresRegexp,
    postResetPasswordRegex: postResetPasswordRegexp,
    putChangePasswordRegex: putChangePasswordRegexp,
    postVerifyEmailRegex: postVerifyEmailRegexp,
    postInviteRequestBypassRegex: postInviteRequestBypassRegexp,
    resendInviteRegex: resendInviteRegexp
  };
}
AuthenticationService['$inject'] = ['$location', '$q', '$rootScope', 'BackendClientService', 'UserSessionService'];
angular.module('em.base').factory('AuthenticationService', AuthenticationService);
