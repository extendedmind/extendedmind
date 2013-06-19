"use strict";

angular.module('em', ['em.filters', 'em.services', 'em.directives'], function($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
        templateUrl : '/static/partials/home.html',
        controller : HomeCtrl
    });
    $routeProvider.when('/login', {
        templateUrl : '/static/partials/login.html',
        controller : LoginCtrl
    });
    $routeProvider.when('/notes', {
        templateUrl : '/static/partials/notes.html',
        controller : NotesCtrl
    });
    $routeProvider.when('/tasks', {
        templateUrl : '/static/partials/tasks.html',
        controller : TasksCtrl
    });
    $routeProvider.otherwise({
        redirectTo : '/'
    });
    $locationProvider.html5Mode(true);
});
