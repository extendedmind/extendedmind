"use strict";

var emApp = angular.module('em.app', ['em.controllers', 'em.directives', 'em.filters', 'em.services', 'em.userAuthenticate']);

emApp.config(['$locationProvider', '$routeProvider',
function($locationProvider, $routeProvider) {

  $routeProvider.when('/my', {
    templateUrl : '/static/partials/my.html',
    controller : 'MyController'
  });
  $routeProvider.when('/login', {
    templateUrl : '/static/partials/login.html',
    controller : 'LoginController'
  });
  $routeProvider.when('/notes', {
    templateUrl : '/static/partials/notes.html',
    controller : 'NotesController'
  });
  $routeProvider.when('/tasks', {
    templateUrl : '/static/partials/tasks.html',
    controller : 'TasksController'
  });
  $routeProvider.when('/', {
    templateUrl : '/static/partials/home.html',
    controller : 'HomeController'
  });
  $routeProvider.when('/404', {
    templateUrl : '/static/partials/pageNotFound.html',
    controller : 'PageNotFoundController'
  });
  $routeProvider.otherwise({
    redirectTo : '/404'
  });

  $locationProvider.html5Mode(true);
}]);

emApp.config(['$httpProvider',
function($httpProvider) {
  $httpProvider.responseInterceptors.push('httpInterceptor');
}]);

emApp.factory('httpInterceptor', ['$q', '$rootScope',
function($q, $rootScope) {
  function success(response) {
    return response;
  };
  function error(response) {
    if (response.status === 403) {// HTTP Error 401 Unauthorized
      $rootScope.$broadcast('event:loginRequired');
    }
    return $q.reject(response);
  };
  return function(promise) {
    return promise.then(success, error);
  };
}]);

emApp.factory('LocationHandler', [
function() {
  var nextLocationPath;
  return {
    setNextLocationPath : function(nextPath) {
      nextLocationPath = nextPath;
    },
    getNextLocationPath : function() {
      return nextLocationPath;
    }
  };
}]);

emApp.run(['$location', '$rootScope', 'LocationHandler',
function($location, $scope, LocationHandler) {
  $scope.$on('event:loginRequired', function() {
    LocationHandler.setNextLocationPath($location.path());
    $location.path('/login');
  });
  $scope.$on('event:loginSuccess', function() {
    if ($location.path() === '/login') {
      if (LocationHandler.getNextLocationPath())
        $location.path(LocationHandler.getNextLocationPath());
      else
        $location.path('/my');
    }
  });
}]);

emApp.run(['$location', '$rootScope', 'LocationHandler', 'UserCookie', 'UserSessionStorage', 'UserAuthenticate',
function($location, $rootScope, LocationHandler, UserCookie, UserSessionStorage, UserAuthenticate) {
  $rootScope.$on('$routeChangeStart', function(event, next, current) {
    if ($location.path() != '/') {
      if (!UserSessionStorage.isUserAuthenticated()) {
        if (!UserCookie.isUserRemembered()) {
          if ($location.path() != '/login') {
            $rootScope.$broadcast('event:loginRequired');
          }
        } else {
          UserAuthenticate.userAuthenticate(undefined);
          UserAuthenticate.userLogin(function(success) {
            $rootScope.$broadcast('event:loginSuccess');
          }, function(error) {
            $rootScope.$broadcast('event:loginRequired');
          });
        }
      }
    }
  });
}]);
