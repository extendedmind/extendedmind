/*global localStorage, sessionStorage */
/*jslint eqeq: true, white: true */
'use strict';

angular.module('em.services').factory('auth', ['$location', '$q', 'authenticateRequest', 'itemsRequest', 'userLocalStorage', 'userSession', 'userSessionStorage',
  function($location, $q, authenticateRequest, itemsRequest, userLocalStorage, userSession, userSessionStorage) {
    var swapTokenTimeThreshold = 10; // hours

    function hoursFromAuth() {
      var lastAuth = Date.now() - userLocalStorage.getAuthenticated();
      // http://stackoverflow.com/a/10874133
      lastAuth = (lastAuth / (1000 * 60 * 60)) % 24;

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
        initUserData();
      });
    }

    return {
      check: function() {
        var deferred = $q.defer();

        if (!userSessionStorage.getAuthenticated()) { // new session
          if (!userLocalStorage.getAuthenticated()) { // login
            deferred.reject();
          }
          else { // remembered
            if (hoursFromAuth() >= swapTokenTimeThreshold) { // auth expired
              swapToken().then(function() {
                deferred.resolve();
              });
            }
            else { // auth valid
              userSession.setUserSessionStorageData();
              deferred.resolve();
              initUserData();
            }
          }
        }
        else { // current session
          if (!userSession.getCredentials()) { // refresh
            userSession.setEncodedCredentials(userSessionStorage.getHttpAuthorizationHeader());
            initUserData();
          }
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
      }
    };

  }]);


function userSession($q, base64, httpBasicAuth, userCookie, userLocalStorage, userSessionStorage) {

  var rememberMe = false;

  return {
    setUserSessionData : function(authenticateResponse) {

      userSessionStorage.setUserUUID(authenticateResponse.userUUID);

      userSessionStorage.setActiveUUID(authenticateResponse.userUUID);

      this.setCredentials('token', authenticateResponse.token);
      userSessionStorage.setHttpAuthorizationHeader(this.getCredentials());

      if (this.getUserRemembered()) {
        userCookie.setUserToken(authenticateResponse.token);
      } else {
        // temporary token cookie clear for new user login, when !rememberMe
        // TODO: no login page when user is logged in
        userCookie.clearUserToken();
      }

      if (authenticateResponse.collectives) {
        userSessionStorage.setCollectives(authenticateResponse.collectives);
      }

    },
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
    setCredentials : function(username, password) {
      this.setEncodedCredentials(base64.encode(username + ':' + password));
    },
    setEncodedCredentials : function(userpass) {
      httpBasicAuth.setEncodedCredentials(userpass);
    },
    getCredentials : function() {
      return httpBasicAuth.getCredentials();
    },
    setUserRemembered : function(remember) {
      rememberMe = remember || false;
    },
    getUserRemembered : function() {
      return rememberMe;
    },
    getAuth: function() {
      if (localStorage.getItem('authenticated') && sessionStorage.getItem('authenticated') !== localStorage.getItem('authenticated')){

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
userSession.$inject = ['$q', 'base64', 'httpBasicAuth', 'userCookie', 'userLocalStorage', 'userSessionStorage'];
angular.module('em.services').factory('userSession', userSession);

angular.module('em.services').factory('authenticateRequest', ['httpRequest', 'userCookie', 'userSession', 'userSessionStorage',
  function(httpRequest, userCookie, userSession, userSessionStorage) {

    function clearUser() {
      userSessionStorage.clearActiveUUID();
      userSessionStorage.clearUserUUID();
      userSessionStorage.clearCollectives();
      userSessionStorage.clearHttpAuthorizationHeader();

      userCookie.clearUserToken();
    }

    return {
      login : function() {
        return httpRequest.post('/api/authenticate', {
          rememberMe : userSession.getUserRemembered()
        }).then(function(authenticateResponse) {
          return authenticateResponse.data;
        });
      },
      logout : function() {
        return httpRequest.post('/api/logout').then(function(logoutResponse) {
          clearUser();
          return logoutResponse.data;
        });
      },
      account : function() {
        return httpRequest.get('/api/account').then(function(accountResponse) {
          return accountResponse.data;
        });
      }
    };
  }]);

angular.module('em.services').factory('userCookie', [
  function() {

    return {
      setUserToken : function(token) {
        $.cookie('token', token, {
          expires : 7,
          path : '/'
        });
      },
      getUserToken : function() {
        return $.cookie('token');
      },
      clearUserToken : function() {
        $.removeCookie('token');
      },
      isUserRemembered : function() {
        return $.cookie('token') != null;
      }
    };
  }]);

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
      getUserUUID : function() {
        return localStorage.getItem('userUUID');
      },
      getHttpAuthorizationHeader : function() {
        return localStorage.getItem('authorizationHeader');
      },
      getUserType : function() {
        return localStorage.getItem('userType');
      },
      getCollectives : function() {
        return JSON.parse(localStorage.getItem('collectives'));
      },
      getAuthenticated: function() {
        return localStorage.getItem('authenticated');
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
      getUserUUID : function() {
        return sessionStorage.getItem('userUUID');
      },
      getHttpAuthorizationHeader : function() {
        return sessionStorage.getItem('authorizationHeader');
      },
      getUserType : function() {
        return sessionStorage.getItem('userType');
      },
      getCollectives : function() {
        return JSON.parse(sessionStorage.getItem('collectives'));
      },
      getActiveUUID: function() {
        return sessionStorage.getItem('activeUUID');
      },
      getAuthenticated: function() {
        return sessionStorage.getItem('authenticated');
      },

      // clear
      clearHttpAuthorizationHeader : function() {
        sessionStorage.removeItem('authorizationHeader');
      },
      clearActiveUUID : function() {
        sessionStorage.removeItem('activeUUID');
      },
      clearUserUUID : function() {
        sessionStorage.removeItem('userUUID');
      },
      clearCollectives : function() {
        sessionStorage.removeItem('collectives');
      },
      isUserAuthenticated : function() {
        return sessionStorage.getItem('authorizationHeader') != null;
      }
    };
  }]);

function userAuthenticate($injector, $location, $rootScope, authenticateRequest, itemsRequest, userSession, userCookie, userSessionStorage) {

  function initData() {
    itemsRequest.getItems();
  }

  function isUserAuthenticated() {
    if (userSessionStorage.isUserAuthenticated()) {
      if (!userSession.getCredentials()) {
        userSession.setEncodedCredentials(userSessionStorage.getHttpAuthorizationHeader());
        initData();
      }
      return true;
    }
  }

  return {
    authenticate : function(deferred) {

      if (isUserAuthenticated()) {
        deferred.resolve();
      } else if (userCookie.isUserRemembered()) {

        userSession.setCredentials('token', userCookie.getUserToken());
        userSession.setUserRemembered(true);

        authenticateRequest.login().then(function(authenticateResponse) {
          userSession.setUserSessionData(authenticateResponse);
          deferred.resolve();
          initData();
        }, function() {
          $location.path('/login');
          deferred.reject();
        });
      } else {
        $location.path('/login');
        deferred.reject();
      }
      return deferred.promise;
    },
    setActiveUUID : function(uuid) {
      userSessionStorage.setActiveUUID(uuid);
      initData();
    },
    checkActiveUUIDOnResponseError : function() {
      return userSessionStorage.isUserAuthenticated();
    },
    authenticateOnResponseError : function() {

      if (userCookie.isUserRemembered()) {

        userSession.setCredentials('token', userCookie.getUserToken());
        userSession.setUserRemembered(true);

        return true;
      }
      return false;
    },
    loginAndRetryRequest : function(rejection) {
      var httpRequest;

      authenticateRequest.login().then(function(authenticateResponse) {
        userSession.setUserSessionData(authenticateResponse);

        httpRequest = httpRequest || $injector.get('httpRequest');
        httpRequest.config(rejection.config).then(function(response) {
          return response;
        }, function(response) {
          return response;
        });
      });
    }
  };
}
userAuthenticate.$inject = ['$injector', '$location', '$rootScope', 'authenticateRequest', 'itemsRequest', 'userSession', 'userCookie', 'userSessionStorage'];
angular.module('em.services').factory('userAuthenticate', userAuthenticate);

