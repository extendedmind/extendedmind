/*global angular*/

( function() {'use strict';

    angular.module('em.app', ['em.directives', 'em.filters', 'em.services', 'em.swiper']);
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

      $routeProvider.when('/mySwipe', {
        templateUrl : '/static/partials/mySwipe.html'
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

      $routeProvider.when('/my/notes', {
        controller : 'NotesController',
        templateUrl : '/static/partials/my/notes.html',
        resolve : {
          authenticationRequired : ['$rootScope',
          function($rootScope) {
            $rootScope.$broadcast('event:authenticationRequired');
          }]

        }
      });

      $routeProvider.when('/my/tasks', {
        controller : 'TasksController',
        templateUrl : '/static/partials/my/tasks.html',
        resolve : {
          authenticationRequired : ['$rootScope',
          function($rootScope) {
            $rootScope.$broadcast('event:authenticationRequired');
          }]

        }
      });

      $routeProvider.when('/my/tasks/context/:uuid', {
        controller : 'ContextController',
        templateUrl : '/static/partials/my/tasks/context.html',
        resolve : {
          authenticationRequired : ['$rootScope',
          function($rootScope) {
            $rootScope.$broadcast('event:authenticationRequired');
          }]

        }
      });

      $routeProvider.when('/my/tasks/new/:uuid', {
        controller : 'NewTaskController',
        templateUrl : '/static/partials/my/tasks/new.html',
        resolve : {
          authenticationRequired : ['$rootScope',
          function($rootScope) {
            $rootScope.$broadcast('event:authenticationRequired');
          }]

        }
      });

      $routeProvider.when('/my/tasks/project/:uuid', {
        controller : 'ProjectController',
        templateUrl : '/static/partials/my/tasks/project.html',
        resolve : {
          authenticationRequired : ['$rootScope',
          function($rootScope) {
            $rootScope.$broadcast('event:authenticationRequired');
          }]

        }
      });

      $routeProvider.otherwise({
        controller : 'PageNotFoundController',
        redirectTo : '/404'
      });

      $locationProvider.html5Mode(true);
    }]);

    angular.module('em.app').run(['$document', '$location', '$rootScope', 'userAuthenticate', 'swiper',
    function($document, $location, $rootScope, userAuthenticate, swiper) {
      $rootScope.$on('event:authenticationRequired', function() {
        userAuthenticate.authenticate();
      });
      $rootScope.$on('event:loginRequired', function() {
        $location.path('/login');
      });
      $rootScope.$on('event:loginSuccess', function() {
        $location.path('/my');
      });
      $rootScope.$on('$viewContentLoaded', function() {
        swiper.reinitSwiper();      });
    }]);
  }());
