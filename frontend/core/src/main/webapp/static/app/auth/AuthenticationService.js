/*global angular */
'use strict';

function AuthenticationService($location, $q, BackendClientService, itemsRequest, LocalStorageService, UserSessionService, SessionStorageService) {
  var swapTokenTimeThreshold = 10*60*60*1000; // 10 hours in milliseconds

  function millisecondsFromAuth() {
    var lastAuth = Date.now() - LocalStorageService.getAuthenticated();
    return lastAuth;
  }

  function initUserData() {
    itemsRequest.getItems();
  }

  function swapToken() {
    UserSessionService.setEncodedCredentials(LocalStorageService.getHttpAuthorizationHeader());
    UserSessionService.setUserRemembered(true);

    return requestLogin().then(function(authenticateResponse) {
      UserSessionService.setUserData(authenticateResponse);
    });
  }

  function clearUser() {
    SessionStorageService.clearUser();
    LocalStorageService.clearUser();
  }

  function requestLogin() {
    return BackendClientService.post('/api/authenticate', {
        rememberMe: UserSessionService.getUserRemembered()
      }).then(function(authenticateResponse) {
      return authenticateResponse.data;
    });
  }

  return {
    check: function() {
      var deferred = $q.defer();

      // 1. should the user be sent to login
      if (!SessionStorageService.getAuthenticated() && 
          !LocalStorageService.getAuthenticated()) { // login
        deferred.reject();
      } // 2. is remember checked
      else if (LocalStorageService.getAuthenticated()){
        // 3. should token be swapped
        if (millisecondsFromAuth() >= swapTokenTimeThreshold) {
          swapToken().then(function() {
            deferred.resolve();
            initUserData();
          });
        } // 4. should session storage be reinitialized
        else if (!SessionStorageService.getAuthenticated()){
          UserSessionService.setUserSessionStorageData();
          deferred.resolve();
          initUserData();
        }else{
          deferred.resolve();
        }
      } // 5. current session but refresh needed
      else if (SessionStorageService.getAuthenticated() && !UserSessionService.getCredentials()){ 
        UserSessionService.setEncodedCredentials(SessionStorageService.getHttpAuthorizationHeader());
        initUserData();
        deferred.resolve();
      } // 6. do nothing
      else {
        deferred.resolve();        
      }

      deferred.promise.then(function() {
      }, function() {
        $location.path('/login');
      });

      return deferred.promise;
    },
    login: function(user) {
      UserSessionService.setCredentials(user.username, user.password);
      UserSessionService.setUserRemembered(user.remember);

      return requestLogin().then(function(authenticateResponse) {
        UserSessionService.setUserData(authenticateResponse);
        initUserData();
      });
    },
    logout: function() {
      return BackendClientService.post('/api/logout').then(function(logoutResponse) {
        clearUser();
        return logoutResponse.data;
      });
    },
    switchActiveUUID: function(uuid) {
      SessionStorageService.setActiveUUID(uuid);
      initUserData();
    }
  };
}
AuthenticationService.$inject = ['$location', '$q', 'BackendClientService', 'itemsRequest', 'LocalStorageService', 'UserSessionService', 'SessionStorageService'];
angular.module('em.services').factory('AuthenticationService', AuthenticationService);