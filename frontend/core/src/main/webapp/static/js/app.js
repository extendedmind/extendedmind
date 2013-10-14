/*global angular*/

( function() {'use strict';

    angular.module('em.app', ['ngRoute', 'ngAnimate', 'ngTouch', 'em.directives', 'em.filters', 'em.services']);
    angular.module('em.directives', []);
    angular.module('em.filters', []);
    angular.module('em.services', ['em.base64']);

    angular.module('em.app').config(['$locationProvider', '$routeProvider',
    function($locationProvider, $routeProvider) {

      $routeProvider.when('/', {
        redirectTo : 'my'
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
          'authenticationRequired' : ['userAuthenticate',
          function(userAuthenticate) {
            userAuthenticate.authenticate();
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
          'authenticationRequired' : ['userAuthenticate',
          function(userAuthenticate) {
            return userAuthenticate.authenticate();
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
          'authenticationRequired' : ['userAuthenticate',
          function(userAuthenticate) {
            return userAuthenticate.authenticate();
          }]

        }
      });

      $routeProvider.when('/my/notes/edit/:uuid', {
        controller : 'NoteEditController',
        templateUrl : 'static/partials/my/notes/edit.html',
        resolve : {
          'authenticationRequired' : ['userAuthenticate',
          function(userAuthenticate) {
            return userAuthenticate.authenticate();
          }]

        }
      });

      $routeProvider.when('/my/notes/new/:uuid', {
        controller : 'NewNoteController',
        templateUrl : 'static/partials/my/notes/new.html',
        resolve : {
          'authenticationRequired' : ['userAuthenticate',
          function(userAuthenticate) {
            return userAuthenticate.authenticate();
          }]

        }
      });

      $routeProvider.when('/my/tasks', {
        controller : 'MyController',
        templateUrl : 'static/partials/my/tasksSlides.html',
        resolve : {
          'authenticationRequired' : ['userAuthenticate',
          function(userAuthenticate) {
            return userAuthenticate.authenticate();
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
          'authenticationRequired' : ['userAuthenticate',
          function(userAuthenticate) {
            return userAuthenticate.authenticate();
          }]

        }
      });

      $routeProvider.when('/my/tasks/edit/:uuid', {
        controller : 'EditTaskController',
        templateUrl : 'static/partials/my/tasks/edit.html',
        resolve : {
          'authenticationRequired' : ['userAuthenticate',
          function(userAuthenticate) {
            return userAuthenticate.authenticate();
          }]

        }
      });

      $routeProvider.when('/my/tasks/new/:uuid', {
        controller : 'NewTaskController',
        templateUrl : 'static/partials/my/tasks/new.html',
        resolve : {
          'authenticationRequired' : ['userAuthenticate',
          function(userAuthenticate) {
            return userAuthenticate.authenticate();
          }]

        }
      });

      $routeProvider.when('/my/tasks/project/:uuid', {
        controller : 'ProjectController',
        templateUrl : 'static/partials/my/tasks/project.html',
        resolve : {
          'authenticationRequired' : ['userAuthenticate',
          function(userAuthenticate) {
            return userAuthenticate.authenticate();
          }]

        }
      });

      $routeProvider.otherwise({
        controller : 'PageNotFoundController',
        redirectTo : '404'
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
