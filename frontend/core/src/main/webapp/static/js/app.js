/*global angular*/

( function() {'use strict';

    angular.module('em.app', ['em.directives', 'em.filters', 'em.services']);
    angular.module('em.directives', []);
    angular.module('em.filters', []);
    angular.module('em.services', ['em.base64']);

    angular.module('em.app').config(['$locationProvider', '$routeProvider',
    function($locationProvider, $routeProvider) {

      $routeProvider.when('/', {
        templateUrl : '/static/partials/home.html',
        controller : 'HomeController'
      });

      $routeProvider.when('/404', {
        templateUrl : '/static/partials/pageNotFound.html',
        controller : 'PageNotFoundController'
      });

      $routeProvider.when('/login', {
        templateUrl : '/static/partials/login.html',
        controller : 'LoginController'
      });

      $routeProvider.when('/my', {
        controller : 'MyController',
        templateUrl : '/static/partials/my.html',
        resolve : {
          authenticationRequired : ['$rootScope',
          function($rootScope) {
            $rootScope.$broadcast('event:authenticationRequired');
          }]

        }
      });

      $routeProvider.when('/mynotes', {
        controller : 'NotesController',
        templateUrl : '/static/partials/mynotes.html',
        resolve : {
          authenticationRequired : ['$rootScope',
          function($rootScope) {
            $rootScope.$broadcast('event:authenticationRequired');
          }]

        }
      });

      $routeProvider.when('/mytasks', {
        controller : 'TasksController',
        templateUrl : '/static/partials/mytasks.html',
        resolve : {
          authenticationRequired : ['$rootScope',
          function($rootScope) {
            $rootScope.$broadcast('event:authenticationRequired');
          }]

        }
      });

      $routeProvider.otherwise({
        redirectTo : '/404'
      });

      $locationProvider.html5Mode(true);
    }]);

    angular.module('em.app').run(['$location', '$rootScope', 'userAuthenticate',
    function($location, $rootScope, userAuthenticate) {
      $rootScope.$on('event:authenticationRequired', function() {
        userAuthenticate.authenticate();
      });
      $rootScope.$on('event:loginRequired', function() {
        $location.path('/login');
      });
      $rootScope.$on('event:loginSuccess', function() {
        $location.path('/my');
      });
    }]);
  }());
