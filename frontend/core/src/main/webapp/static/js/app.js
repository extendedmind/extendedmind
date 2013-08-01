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
  // $routeProvider.when('/', {
  // templateUrl : '/static/partials/home.html',
  // controller : 'HomeController'
  // });
  $routeProvider.otherwise({
    redirectTo : '/',
    templateUrl : '/static/partials/home.html',
    controller : 'HomeController'
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
    if (response.status === 401) {// HTTP Error 401 Unauthorized
      $rootScope.$broadcast('event:loginRequired');
    }
    return $q.reject(response);
  };
  return function(promise) {
    return promise.then(success, error);
  };
}]);

emApp.run(['$location', '$rootScope',
function($location, $scope) {
  $scope.$on('event:loginRequired', function() {
    $location.path('/login');
  });
  $scope.$on('event:loginSuccess', function() {
    if ($location.path() === '/login')
      $location.path('/my');
  });
}]);

emApp.run(['$location', '$rootScope', 'User', 'UserAuthenticate',
function($location, $rootScope, User, UserAuthenticate) {
  $rootScope.$on('$locationChangeStart', function() {
    if (!User.isUserAuthenticated()) {
      if (!User.isUserRemembered()) {
        if ($location.path() != '/login') {
          $location.path('/login');
        }
      } else {
        UserAuthenticate.userAuthenticate('token', User.getUserToken(), true);
      }
    }
  });
}]);
