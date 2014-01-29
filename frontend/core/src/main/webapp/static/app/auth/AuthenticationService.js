'use strict';

function AuthenticationService($location, $q, BackendClientService, itemsRequest, UserSessionService) {

  function checkAuthentication() {
    function validateAuthenticationAndRefreshItems() {
      deferredAuthentication.resolve();
      refreshItems();
    }
    var deferredAuthentication = $q.defer();

    if (UserSessionService.isAuthenticated()) {
      if (UserSessionService.isAuthenticateValid()) {
        validateAuthenticationAndRefreshItems();
      } else {
        if (UserSessionService.isAuthenticateReplaceable()) {
          swapToken().then(validateAuthenticationAndRefreshItems);
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

  function refreshItems() {
    itemsRequest.getItems();
  }

  function swapToken() {
    var remember = true;
    UserSessionService.setEncodedCredentialsFromLocalStorage();

    return requestLogin(remember);
  }

  function requestLogin(remember) {
    return BackendClientService.post('/api/authenticate', {
      rememberMe: remember
    }).then(function(authenticateResponse) {
      UserSessionService.setAuthenticateInformation(authenticateResponse.data);
    });
  }

  return {
    checkAuthentication: checkAuthentication,
    login: function(user) {
      var remember = user.remember || false;
      UserSessionService.setCredentials(user.username, user.password);

      return requestLogin(remember).then(refreshItems);
    },
    logout: function() {
      return BackendClientService.post('/api/logout').then(function(logoutResponse) {
        UserSessionService.clearUser();
        return logoutResponse.data;
      });
    },
    switchActiveUUID: function(uuid) {
      UserSessionService.setActiveUUID(uuid);
      refreshItems();
    }
  };
}
AuthenticationService.$inject = ['$location', '$q', 'BackendClientService', 'itemsRequest', 'UserSessionService'];
angular.module('em.services').factory('AuthenticationService', AuthenticationService);
