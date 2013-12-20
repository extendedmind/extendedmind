/*global angular */
'use strict';

function auth($location, $q, authenticateRequest, itemsRequest, userLocalStorage, userSession, userSessionStorage) {
  var swapTokenTimeThreshold = 10*60*60*1000; // 10 hours in milliseconds

  function millisecondsFromAuth() {
    var lastAuth = Date.now() - userLocalStorage.getAuthenticated();
    return lastAuth;
  }

  function initUserData() {
    itemsRequest.getItems();
  }

  function swapToken() {
    userSession.setEncodedCredentials(userLocalStorage.getHttpAuthorizationHeader());
    userSession.setUserRemembered(true);

    return authenticateRequest.login().then(function(authenticateResponse) {
      userSession.setUserData(authenticateResponse);
    });
  }

  return {
    check: function() {
      var deferred = $q.defer();

      // 1. should the user be sent to login
      if (!userSessionStorage.getAuthenticated() && 
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
          userSession.setUserSessionStorageData();
          deferred.resolve();
          initUserData();
        }else{
          deferred.resolve();
        }
      } // 5. current session but refresh needed
      else if (userSessionStorage.getAuthenticated() && !userSession.getCredentials()){ 
        userSession.setEncodedCredentials(userSessionStorage.getHttpAuthorizationHeader());
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
      userSession.setCredentials(user.username, user.password);
      userSession.setUserRemembered(user.remember);

      return authenticateRequest.login().then(function(authenticateResponse) {
        userSession.setUserData(authenticateResponse);
        initUserData();
      });
    },
    switchActiveUUID: function(uuid) {
      userSessionStorage.setActiveUUID(uuid);
      initUserData();
    }
  };
}
auth.$inject = ['$location', '$q', 'authenticateRequest', 'itemsRequest', 'userLocalStorage', 'userSession', 'userSessionStorage'];
angular.module('em.services').factory('auth', auth);

function userSession($q, base64, httpBasicAuth, userLocalStorage, userSessionStorage) {
  var rememberMe = false;

  return {
    setUserData: function(authenticateResponse) {
      var authEpoch = Date.now();

      this.setCredentials('token', authenticateResponse.token);
      userSessionStorage.setHttpAuthorizationHeader(this.getCredentials());

      userSessionStorage.setUserUUID(authenticateResponse.userUUID);
      userSessionStorage.setUserType(authenticateResponse.userType);
      userSessionStorage.setCollectives(authenticateResponse.collectives);
      userSessionStorage.setActiveUUID(authenticateResponse.userUUID);
      userSessionStorage.setAuthenticated(authEpoch);

      if (this.getUserRemembered()) {
        userLocalStorage.setUserUUID(authenticateResponse.userUUID);
        userLocalStorage.setHttpAuthorizationHeader(this.getCredentials());
        userLocalStorage.setUserType(authenticateResponse.userType);
        userLocalStorage.setCollectives(authenticateResponse.collectives);
        userLocalStorage.setAuthenticated(authEpoch);
      }

    },
    setUserSessionStorageData: function() {
      userSessionStorage.setUserUUID(userLocalStorage.getUserUUID());
      userSessionStorage.setHttpAuthorizationHeader(userLocalStorage.getHttpAuthorizationHeader());
      userSessionStorage.setUserType(userLocalStorage.getUserType());
      userSessionStorage.setCollectives(userLocalStorage.getCollectives());
      userSessionStorage.setActiveUUID(userLocalStorage.getUserUUID());
      userSessionStorage.setAuthenticated(userLocalStorage.getAuthenticated());
      this.setEncodedCredentials(userSessionStorage.getHttpAuthorizationHeader());
    },
    setCredentials: function(username, password) {
      this.setEncodedCredentials(base64.encode(username + ':' + password));
    },
    setEncodedCredentials: function(userpass) {
      httpBasicAuth.setEncodedCredentials(userpass);
    },
    getCredentials: function() {
      return httpBasicAuth.getCredentials();
    },
    setUserRemembered: function(remember) {
      rememberMe = remember || false;
    },
    getUserRemembered: function() {
      return rememberMe;
    },
    getAuth: function() {
      if (localStorage.getItem('authenticated') && sessionStorage.getItem('authenticated') !== localStorage.getItem('authenticated')) {

        userSessionStorage.setUserUUID(userLocalStorage.getUserUUID());
        userSessionStorage.setHttpAuthorizationHeader(userLocalStorage.getHttpAuthorizationHeader());
        userSessionStorage.setUserType(userLocalStorage.getUserType());
        userSessionStorage.setCollectives(userLocalStorage.getCollectives());
        userSessionStorage.setActiveUUID(userLocalStorage.getUserUUID());
        userSessionStorage.setAuthenticated(userLocalStorage.getAuthenticated());

        this.setEncodedCredentials(userSessionStorage.getHttpAuthorizationHeader());
      }
    }
  };
}
userSession.$inject = ['$q', 'base64', 'httpBasicAuth', 'userLocalStorage', 'userSessionStorage'];
angular.module('em.services').factory('userSession', userSession);

function authenticateRequest(httpRequest, userLocalStorage, userSession, userSessionStorage) {

  function clearUser() {
    userSessionStorage.clearUser();
    userLocalStorage.clearUser();
  }

  return {
    login: function() {
      return httpRequest.post('/api/authenticate', {
        rememberMe: userSession.getUserRemembered()
      }).then(function(authenticateResponse) {
        return authenticateResponse.data;
      });
    },
    logout: function() {
      return httpRequest.post('/api/logout').then(function(logoutResponse) {
        clearUser();
        return logoutResponse.data;
      });
    },
    account: function() {
      return httpRequest.get('/api/account').then(function(accountResponse) {
        return accountResponse.data;
      });
    }
  };
}
authenticateRequest.$inject = ['httpRequest', 'userLocalStorage', 'userSession', 'userSessionStorage'];
angular.module('em.services').factory('authenticateRequest', authenticateRequest);

angular.module('em.services').factory('userLocalStorage', [
  function() {
    return {

      // setters
      setUserUUID: function(uuid) {
        localStorage.setItem('userUUID', uuid);
      },
      setHttpAuthorizationHeader: function(authorizationHeader) {
        localStorage.setItem('authorizationHeader', authorizationHeader);
      },
      setUserType: function(userType) {
        localStorage.setItem('userType', userType);
      },
      setCollectives: function(collectives) {
        localStorage.setItem('collectives', JSON.stringify(collectives));
      },
      setAuthenticated: function(epoch) {
        localStorage.setItem('authenticated', epoch);
      },

      // getters
      getUserUUID: function() {
        return localStorage.getItem('userUUID');
      },
      getHttpAuthorizationHeader: function() {
        return localStorage.getItem('authorizationHeader');
      },
      getUserType: function() {
        return localStorage.getItem('userType');
      },
      getCollectives: function() {
        return JSON.parse(localStorage.getItem('collectives'));
      },
      getAuthenticated: function() {
        return localStorage.getItem('authenticated');
      },

      clearUser: function() {
        localStorage.removeItem('userUUID');
        localStorage.removeItem('authorizationHeader');
        localStorage.removeItem('userType');
        localStorage.removeItem('collectives');
        localStorage.removeItem('authenticated');
      }
    };
  }]);

angular.module('em.services').factory('userSessionStorage', [
  function() {
    return {

      // setters
      setUserUUID: function(userUUID) {
        sessionStorage.setItem('userUUID', userUUID);
      },
      setHttpAuthorizationHeader: function(authorizationHeader) {
        sessionStorage.setItem('authorizationHeader', authorizationHeader);
      },
      setUserType: function(userType) {
        sessionStorage.setItem('userType', userType);
      },
      setCollectives: function(collectives) {
        sessionStorage.setItem('collectives', JSON.stringify(collectives));
      },
      setActiveUUID: function(uuid) {
        sessionStorage.setItem('activeUUID', uuid);
      },
      setAuthenticated: function(epoch) {
        sessionStorage.setItem('authenticated', epoch);
      },

      // getters
      getUserUUID: function() {
        return sessionStorage.getItem('userUUID');
      },
      getHttpAuthorizationHeader: function() {
        return sessionStorage.getItem('authorizationHeader');
      },
      getUserType: function() {
        return sessionStorage.getItem('userType');
      },
      getCollectives: function() {
        return JSON.parse(sessionStorage.getItem('collectives'));
      },
      getActiveUUID: function() {
        return sessionStorage.getItem('activeUUID');
      },
      getAuthenticated: function() {
        return sessionStorage.getItem('authenticated');
      },

      clearUser: function() {
        sessionStorage.removeItem('userUUID');
        sessionStorage.removeItem('authorizationHeader');
        sessionStorage.removeItem('userType');
        sessionStorage.removeItem('collectives');
        sessionStorage.removeItem('activeUUID');
        sessionStorage.removeItem('authenticated');
      }
    };
  }]);
