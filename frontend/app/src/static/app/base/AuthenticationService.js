/* Copyright 2013-2016 Extended Mind Technologies Oy
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

 function AuthenticationService($q, $rootScope, BackendClientService, PlatformService,
                                UserSessionService, packaging) {

  var authenticateRegex = /authenticate/;
  var emailRegex = /\?email=.+/;
  var passwordRegex = /password/;

  var signUpRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    /signup/.source +
    /$/.source
    ),
  postAuthenticateRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    authenticateRegex.source +
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
  postAcceptShareRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    /agreement\//.source +
    BackendClientService.hexCodeRegex.source +
    /\/accept/.source +
    /$/.source
    ),
  putChangePasswordRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    /password$/.source
    ),
  putChangeEmailRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    /email/.source
    );

  // Register refresh credentials callback to backend
  BackendClientService.registerRefreshCredentialsCallback(verifyAndUpdateAuthentication);

  function setAuthenticateInformation(authenticateResponse, email){
    var encodedCredentials = UserSessionService.setAuthenticateInformation(authenticateResponse, email);
    // Update backend client with new token
    BackendClientService.setCredentials(encodedCredentials);

    if (PlatformService.isSupported('setInboxId')){
      PlatformService.setFeatureValue('setInboxId', authenticateResponse.inboxId).then(
        undefined,
        function(error){
          console.error("Could not save inboxId to user defaults: " + error);
        }
      );
    }
  }

  // Register swapTokenCallback to backend
  var swapTokenCallback = function(request, authenticateResponse) {
    setAuthenticateInformation(authenticateResponse);
  };
  BackendClientService.registerPrimaryPostResultCallback(swapTokenCallback);

  function getAuthenticatePayload(remember) {
    var payload = {rememberMe: remember};
    if (remember && packaging.endsWith('cordova')) {
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
    return authenticate(remember).then(function(response) {
      setAuthenticateInformation(response);
      // We want to remove possible duplicate swap token calls from the backend client
      BackendClientService.clearPrimary();
      return response;
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
      true, true);
  }

  function verifyAndUpdateAuthentication(online) {
    var deferredAuthentication = $q.defer();
    function validateAuthentication() {
      deferredAuthentication.resolve();
    }

    if (UserSessionService.isFakeUser()){
      deferredAuthentication.resolve();
    }else if (UserSessionService.isAuthenticated()) {
      if (UserSessionService.isAuthenticateValid()) {
        validateAuthentication();
      } else {
        if (UserSessionService.isAuthenticateReplaceable()) {
          // Make sure the latest credentials are in use
          BackendClientService.setCredentials(UserSessionService.getCredentials());
          if (!online) {
            // Push token swap to be the first thing that is done
            // when online connection is up
            BackendClientService.postPrimary('/api/authenticate',
                                             postAuthenticateRegexp,
                                             getAuthenticatePayload(true));
            validateAuthentication();
          } else {
            // Online
            swapTokenAndAuthenticate().then(function() {
              validateAuthentication();
            },function(error) {
              // Error branch, emit onlineRequired
              var rejection, emitType;
              if (error.type === 'offline') {
                emitType = 'emInteraction';
                rejection = {
                  type: 'onlineRequired',
                  value: {
                    status: error.value.status,
                    data: error.value.data,
                    retry: swapTokenAndAuthenticate,
                    redirectUrl: '/entry',
                    promise: deferredAuthentication.resolve
                  }
                };
              }else {
                emitType = 'emException';
                rejection = {
                  type: 'http',
                  value: {
                    status: error.value.status,
                    data: error.value.data,
                    url: error.value.config.url
                  }
                };
                deferredAuthentication.reject(rejection);
              }
              $rootScope.$emit(emitType, rejection);
            });
          }
        } else {
          deferredAuthentication.reject({type: 'authentication', value: 'authentication not replaceable'});
        }
      }
    } else {
      deferredAuthentication.reject({type: 'authentication', value: 'user not authenticated'});
    }

    deferredAuthentication.promise.then(null, function() {
      // On error, emit redirectToEntry
      $rootScope.$emit('emException', {type: 'redirectToEntry'});
    });

    return deferredAuthentication.promise;
  }

  return {
    verifyAndUpdateAuthentication: function() {
      if (UserSessionService.isItemsSynchronized(UserSessionService.getUserUUID())) {
        return verifyAndUpdateAuthentication();
      } else {
        // When there is no data in-memory, this needs to be done online
        return verifyAndUpdateAuthentication(true);
      }
    },
    login: function(user, processUUIDChangeFn) {
      var remember = user.remember || false;
      BackendClientService.setUsernamePassword(user.username, user.password);
      return authenticate(remember).then(function(response) {
        if (angular.isFunction(processUUIDChangeFn)){
          processUUIDChangeFn(UserSessionService.getUserUUID(), response.userUUID);
        }
        setAuthenticateInformation(response, user.username);
        return response;
      });
    },
    signUp: function(data) {
      return BackendClientService.postOnline('/api/signup', signUpRegexp, data, true, true);
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
    postAcceptShare: function(acceptCode, email) {
      return BackendClientService.postOnline(
        '/api/agreement/' + acceptCode + '/accept',
        postAcceptShareRegexp,
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
    putChangeEmail: function(email, password, newEmail) {
      return BackendClientService.putOnlineWithUsernamePassword(
        '/api/email',
        this.putChangeEmailRegex,
        {email: newEmail},
        sanitizeEmail(email),
        password);
    },
    sanitizeEmail: function(email) {
      return sanitizeEmail(email);
    },
    // Regular expressions for account requests
    postAuthenticateRegex: postAuthenticateRegexp,
    postForgotPasswordRegex: postForgotPasswordRegexp,
    getPasswordResetExpiresRegex: getPasswordResetExpiresRegexp,
    postResetPasswordRegex: postResetPasswordRegexp,
    putChangePasswordRegex: putChangePasswordRegexp,
    putChangeEmailRegex: putChangeEmailRegexp,
    postVerifyEmailRegex: postVerifyEmailRegexp,
    postAcceptShareRegex: postAcceptShareRegexp
  };
}
AuthenticationService['$inject'] = ['$q', '$rootScope', 'BackendClientService', 'PlatformService',
                                    'UserSessionService', 'packaging'];
angular.module('em.base').factory('AuthenticationService', AuthenticationService);
