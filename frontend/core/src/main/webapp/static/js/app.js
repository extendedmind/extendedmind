"use strict";

var emApp = angular.module('em.app', ['em.controllers', 'em.directives', 'em.filters', 'em.services', 'em.userAuthenticate']);

emApp.config(['$locationProvider', '$routeProvider',
function($locationProvider, $routeProvider) {

  $routeProvider.when('/my', {
    templateUrl : '/static/partials/my.html',
    controller : 'MyController',
    resolve : {
      authenticated : function(UserAuthenticate) {
        // return UserAuthenticate.userAuthenticate();
      }
    }
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
  $httpProvider.interceptors.push('httpInterceptor');
}]);

emApp.factory('httpInterceptor', ['$q', '$rootScope',
function($q, $rootScope) {
  return {
    request : function(config) {
      return config || $q.when(config);
    },
    requestError : function(rejection) {
      return $q.reject(rejection);
    },
    response : function(response) {
      return response || $q.when(response);
    },
    responseError : function(rejection) {
      if (rejection.status === 403) {
        $rootScope.$broadcast('event:authenticationRequired');
      }
      return $q.reject(rejection);
    }
  };
}]);

emApp.run(['$location', '$rootScope', 'UserAuthenticate',
function($location, $rootScope, UserAuthenticate) {
  $rootScope.$on('event:authenticationRequired', function() {
    UserAuthenticate.userAuthenticate();
  });
  $rootScope.$on('event:loginRequired', function() {
    $location.path('/login');
  });
  $rootScope.$on('event:loginSuccess', function() {
    $location.path('/my');
  });
}]);
