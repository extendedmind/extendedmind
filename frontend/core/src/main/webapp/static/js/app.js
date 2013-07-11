"use strict";

var emApp = angular.module('em.app', ['em.controllers', 'em.filters', 'em.services', 'em.directives', 'em.userAuthenticate']);

emApp.config(function($routeProvider, $locationProvider) {

  $routeProvider.when('/', {
    templateUrl : '/static/partials/home.html',
    controller : 'HomeController'
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
  $routeProvider.otherwise({
    redirectTo : '/'
  });

  $locationProvider.html5Mode(true);
});

emApp.run(['$rootScope', '$location', 'UserAuthenticate',
function($rootScope, $location, UserAuthenticate) {
  if (UserAuthenticate.isUserLoggedIn())
    $location.path('/');
  else
    $location.path('/login');
}]);
