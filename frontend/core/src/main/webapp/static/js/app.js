'use strict';

var emApp = angular.module('em.app', ['em.controllers', 'em.directives', 'em.filters', 'em.services']);

var emControllers = angular.module('em.controllers', []);
var emDirectives = angular.module('em.directives', []);
var emFilters = angular.module('em.filters', []);
var emServices = angular.module('em.services', ['em.base64']);

emApp.config(['$locationProvider', '$routeProvider',
function($locationProvider, $routeProvider) {

  $routeProvider.when('/my', {
    templateUrl : '/static/partials/my.html',
    controller : 'MyController',
    resolve : {
      userItems : ['userItems',
      function(userItems) {
        userItems.getItems();
      }]

    }
  });
  $routeProvider.when('/login', {
    templateUrl : '/static/partials/login.html',
    controller : 'LoginController'
  });
  $routeProvider.when('/notes', {
    templateUrl : '/static/partials/notes.html',
    controller : 'NotesController',
    resolve : {
      userItems : ['userItems',
      function(userItems) {
        userItems.getItems();
      }]

    }
  });
  $routeProvider.when('/tasks', {
    templateUrl : '/static/partials/tasks.html',
    controller : 'TasksController',
    resolve : {
      userItems : ['userItems',
      function(userItems) {
        userItems.getItems();
      }]

    }
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
      // Http 401 will cause a browser to display a login dialog
      // http://stackoverflow.com/questions/86105/how-can-i-supress-the-browsers-authentication-dialog
      if (rejection.status === 403) {
        $rootScope.$broadcast('event:authenticationRequired');
      } else if (rejection.status === 419) {
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
