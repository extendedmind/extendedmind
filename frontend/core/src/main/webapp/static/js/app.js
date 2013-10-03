/*global angular, templateUrlPrefix*/

( function() {'use strict';

    angular.module('em.app', ['ngRoute', 'ngAnimate', 'ngTouch', 'angular-carousel', 'em.directives', 'em.filters', 'em.services']);
    angular.module('em.directives', []);
    angular.module('em.filters', []);
    angular.module('angular-carousel', []);
    angular.module('em.services', ['em.base64']);

    angular.module('em.app').config(['$locationProvider', '$routeProvider',
    function($locationProvider, $routeProvider) {

      $routeProvider.when('/', {
        redirectTo : '/login'
      });

      $routeProvider.when('/404', {
        templateUrl : 'static/partials/pageNotFound.html',
        controller : 'PageNotFoundController'
      });

      $routeProvider.when('/login', {
        templateUrl : 'static/partials/login.html',
        controller : 'LoginController'
      });

      $routeProvider.when('/my', {
        controller : 'MyController',
        templateUrl : 'static/partials/my.html',
        resolve : {
          authenticationRequired : ['$rootScope',
          function($rootScope) {
            $rootScope.$broadcast('event:authenticationRequired');
          }],
          slideIndex : ['Enum',
          function(Enum) {
            return Enum.my.my;
          }]

        }
      });

      $routeProvider.when('/my/notes', {
        controller : 'NotesController',
        templateUrl : 'static/partials/my/notesSlides.html',
        resolve : {
          authenticationRequired : ['$rootScope',
          function($rootScope) {
            $rootScope.$broadcast('event:authenticationRequired');
          }],
          slideIndex : ['Enum',
          function(Enum) {
            return Enum.my.notes;
          }]

        }
      });

      $routeProvider.when('/my/notes/context/:uuid', {
        controller : 'ContextController',
        templateUrl : 'static/partials/my/notes/context.html',
        resolve : {
          authenticationRequired : ['$rootScope',
          function($rootScope) {
            $rootScope.$broadcast('event:authenticationRequired');
          }]

        }
      });

      $routeProvider.when('/my/notes/edit/:uuid', {
        controller : 'NoteEditController',
        templateUrl : 'static/partials/my/notes/edit.html',
        resolve : {
          authenticationRequired : ['$rootScope',
          function($rootScope) {
            $rootScope.$broadcast('event:authenticationRequired');
          }]

        }
      });

      $routeProvider.when('/my/tasks', {
        controller : 'TasksController',
        templateUrl : 'static/partials/my/tasksSlides.html',
        resolve : {
          authenticationRequired : ['$rootScope',
          function($rootScope) {
            $rootScope.$broadcast('event:authenticationRequired');
          }],
          slideIndex : ['Enum',
          function(Enum) {
            return Enum.my.tasks;
          }]

        }
      });

      $routeProvider.when('/my/tasks/context/:uuid', {
        controller : 'ContextController',
        templateUrl : 'static/partials/my/tasks/context.html',
        resolve : {
          authenticationRequired : ['$rootScope',
          function($rootScope) {
            $rootScope.$broadcast('event:authenticationRequired');
          }]

        }
      });

      $routeProvider.when('/my/tasks/new/:uuid', {
        controller : 'NewTaskController',
        templateUrl : 'static/partials/my/tasks/new.html',
        resolve : {
          authenticationRequired : ['$rootScope',
          function($rootScope) {
            $rootScope.$broadcast('event:authenticationRequired');
          }]

        }
      });

      $routeProvider.when('/my/tasks/project/:uuid', {
        controller : 'ProjectController',
        templateUrl : 'static/partials/my/tasks/project.html',
        resolve : {
          authenticationRequired : ['$rootScope',
          function($rootScope) {
            $rootScope.$broadcast('event:authenticationRequired');
          }]

        }
      });

      $routeProvider.otherwise({
        controller : 'PageNotFoundController',
        redirectTo : '404'
      });

      $locationProvider.html5Mode(true);
    }]);

    angular.module('em.app').run(['$document', '$location', '$rootScope', 'userAuthenticate',
    function($document, $location, $rootScope, userAuthenticate) {

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
