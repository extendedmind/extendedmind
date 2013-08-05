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
      console.log('asd');
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
  var nextLocation;
  return {
    setNextLocation : function(next) {
      nextLocation = next;
    },
    getNextLocation : function() {
      return nextLocation;
    }
  };
}]);

emApp.run(['$location', '$rootScope', 'LocationHandler',
function($location, $scope, LocationHandler) {
  $scope.$on('event:loginRequired', function() {
    $location.path('/login');
  });
  $scope.$on('event:loginSuccess', function() {
    console.log(LocationHandler.getNextLocation());
    if ($location.path() === '/login')
      $location.path('/my');
  });
}]);

emApp.run(['$location', '$rootScope', 'LocationHandler', 'UserCookie', 'UserSessionStorage', 'UserAuthenticate',
function($location, $rootScope, LocationHandler, UserCookie, UserSessionStorage, UserAuthenticate) {
  $rootScope.$on('$locationChangeStart', function(event, next, current) {
    LocationHandler.setNextLocation(next);
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
