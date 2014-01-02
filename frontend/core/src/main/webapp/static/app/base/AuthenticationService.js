/*global angular */
'use strict';

function AuthenticationService($location, $q, httpRequest, itemsRequest, userLocalStorage, UserSessionService, userSessionStorage) {
  var swapTokenTimeThreshold = 10*60*60*1000; // 10 hours in milliseconds

  function millisecondsFromAuth() {
    var lastAuth = Date.now() - userLocalStorage.getAuthenticated();
    return lastAuth;
  }

  function initUserData() {
    itemsRequest.getItems();
  }

  function swapToken() {
    UserSessionService.setEncodedCredentials(userLocalStorage.getHttpAuthorizationHeader());
    UserSessionService.setUserRemembered(true);

    return requestLogin().then(function(authenticateResponse) {
      UserSessionService.setUserData(authenticateResponse);
    });
  }

  function clearUser() {
    userSessionStorage.clearUser();
    userLocalStorage.clearUser();
  }

  function requestLogin() {
    return httpRequest.post('/api/authenticate', {
        rememberMe: UserSessionService.getUserRemembered()
      }).then(function(authenticateResponse) {
      return authenticateResponse.data;
    });
  }

  return {
    check: function() {
      var deferred = $q.defer();

      // 1. should the user be sent to login
      if (!userSessionStorage.getAuthenticated() & 
          !userLocalStorage.getAuthenticated()) { // login
        deferred.reject();
      } // 2. is remember checked
      else if (userLocalStorage.getAuthenticated()){
        // 3. should token be swapped
        if (millisecondsFromAuth() >= swapTokenTimeThreshold) {
          swapToken().then(function() {
            deferred.resolve();
            initUserData();
          });
        } // 4. should session storage be reinitialized
        else if (!userSessionStorage.getAuthenticated()){
          UserSessionService.setUserSessionStorageData();
          deferred.resolve();
          initUserData();
        }else{
          deferred.resolve();
        }
      } // 5. current session but refresh needed
      else if (userSessionStorage.getAuthenticated() && !UserSessionService.getCredentials()){ 
        UserSessionService.setEncodedCredentials(userSessionStorage.getHttpAuthorizationHeader());
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
      return httpRequest.post('/api/logout').then(function(logoutResponse) {
        clearUser();
        return logoutResponse.data;
      });
    },
    switchActiveUUID: function(uuid) {
      userSessionStorage.setActiveUUID(uuid);
      initUserData();
    }
  };
}
AuthenticationService.$inject = ['$location', '$q', 'httpRequest', 'itemsRequest', 'userLocalStorage', 'UserSessionService', 'userSessionStorage'];
angular.module('em.services').factory('AuthenticationService', AuthenticationService);