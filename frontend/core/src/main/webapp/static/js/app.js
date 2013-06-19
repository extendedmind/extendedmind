"use strict";

angular.module('em', ['em.filters', 'em.services', 'em.directives'], function($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
        templateUrl : '/static/partials/home.html',
        controller : HomeCtrl
    });
    $routeProvider.when('/about', {
        templateUrl : '/static/partials/about.html',
        controller : AboutCtrl
    });
    $routeProvider.when('/login', {
        templateUrl : '/static/partials/login.html',
        controller : LoginCtrl
    });
    $routeProvider.otherwise({
        redirectTo : '/'
    });
    $locationProvider.html5Mode(true);
});
