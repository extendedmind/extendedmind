/*global angular */
/*jslint white: true */

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

      $routeProvider.when('/my/account', {
        templateUrl : 'static/partials/account.html',
        controller : 'AccountController',
        resolve : {
          'authenticationRequired' : ['$q', 'userAuthenticate',
          function($q, userAuthenticate) {
            var deferred = $q.defer();
            userAuthenticate.authenticate(deferred);
            return deferred.promise;
          }],
          prefix : ['userPrefix',
          function(userPrefix) {
            userPrefix.setMyPrefix();
          }]

        }
      });

      $routeProvider.when('/my', {
        controller : 'MyController',
        templateUrl : 'static/partials/my.html',
        resolve : {
          'authenticationRequired' : ['$q', 'userAuthenticate',
          function($q, userAuthenticate) {
            var deferred = $q.defer();
            userAuthenticate.authenticate(deferred);
            return deferred.promise;
          }],
          slideIndex : ['Enum',
          function(Enum) {
            return Enum.my.my;
          }],
          prefix : ['userPrefix',
          function(userPrefix) {
            userPrefix.setMyPrefix();
          }]

        }
      });

      $routeProvider.when('/collective/:collectiveUUID', {
        controller : 'MyController',
        templateUrl : 'static/partials/my.html',
        resolve : {
          'authenticationRequired' : ['$q', 'userAuthenticate',
          function($q, userAuthenticate) {
            var deferred = $q.defer();
            userAuthenticate.authenticate(deferred);
            return deferred.promise;
          }],
          slideIndex : ['Enum',
          function(Enum) {
            return Enum.my.my;
          }],
          prefix : ['userPrefix',
          function(userPrefix) {
            userPrefix.setCollectivePrefix();
          }]

        }
      });

      $routeProvider.when('/my/notes', {
        controller : 'NotesController',
        templateUrl : 'static/partials/my/notesSlides.html',
        resolve : {
          'authenticationRequired' : ['$q', 'userAuthenticate',
          function($q, userAuthenticate) {
            var deferred = $q.defer();
            userAuthenticate.authenticate(deferred);
            return deferred.promise;
          }],
          slideIndex : ['Enum',
          function(Enum) {
            return Enum.my.notes;
          }],
          prefix : ['userPrefix',
          function(userPrefix) {
            userPrefix.setMyPrefix();
          }]

        }
      });

      $routeProvider.when('/collective/:collectiveUUID/notes', {
        controller : 'NotesController',
        templateUrl : 'static/partials/my/notesSlides.html',
        resolve : {
          'authenticationRequired' : ['$q', 'userAuthenticate',
          function($q, userAuthenticate) {
            var deferred = $q.defer();
            userAuthenticate.authenticate(deferred);
            return deferred.promise;
          }],
          slideIndex : ['Enum',
          function(Enum) {
            return Enum.my.notes;
          }],
          prefix : ['userPrefix',
          function(userPrefix) {
            userPrefix.setCollectivePrefix();
          }]

        }
      });

      $routeProvider.when('/my/notes/context/:uuid', {
        controller : 'ContextController',
        templateUrl : 'static/partials/my/notes/context.html',
        resolve : {
          'authenticationRequired' : ['$q', 'userAuthenticate',
          function($q, userAuthenticate) {
            var deferred = $q.defer();
            userAuthenticate.authenticate(deferred);
            return deferred.promise;
          }],
          prefix : ['userPrefix',
          function(userPrefix) {
            userPrefix.setMyPrefix();
          }]

        }
      });

      $routeProvider.when('/collective/:collectiveUUID/notes/context/:uuid', {
        controller : 'ContextController',
        templateUrl : 'static/partials/my/notes/context.html',
        resolve : {
          'authenticationRequired' : ['$q', 'userAuthenticate',
          function($q, userAuthenticate) {
            var deferred = $q.defer();
            userAuthenticate.authenticate(deferred);
            return deferred.promise;
          }],
          prefix : ['userPrefix',
          function(userPrefix) {
            userPrefix.setCollectivePrefix();
          }]

        }
      });

      $routeProvider.when('/my/notes/edit/:uuid', {
        controller : 'NoteEditController',
        templateUrl : 'static/partials/my/notes/edit.html',
        resolve : {
          'authenticationRequired' : ['$q', 'userAuthenticate',
          function($q, userAuthenticate) {
            var deferred = $q.defer();
            userAuthenticate.authenticate(deferred);
            return deferred.promise;
          }],
          prefix : ['userPrefix',
          function(userPrefix) {
            userPrefix.setMyPrefix();
          }]

        }
      });

      $routeProvider.when('/collective/:collectiveUUID/notes/edit/:uuid', {
        controller : 'NoteEditController',
        templateUrl : 'static/partials/my/notes/edit.html',
        resolve : {
          'authenticationRequired' : ['$q', 'userAuthenticate',
          function($q, userAuthenticate) {
            var deferred = $q.defer();
            userAuthenticate.authenticate(deferred);
            return deferred.promise;
          }],
          prefix : ['userPrefix',
          function(userPrefix) {
            userPrefix.setCollectivePrefix();
          }]

        }
      });

      $routeProvider.when('/my/notes/new', {
        controller : 'NewNoteController',
        templateUrl : 'static/partials/my/notes/new.html',
        resolve : {
          'authenticationRequired' : ['$q', 'userAuthenticate',
          function($q, userAuthenticate) {
            var deferred = $q.defer();
            userAuthenticate.authenticate(deferred);
            return deferred.promise;
          }],
          prefix : ['userPrefix',
          function(userPrefix) {
            userPrefix.setMyPrefix();
          }]

        }
      });

      $routeProvider.when('/collective/:collectiveUUID/notes/new', {
        controller : 'NewNoteController',
        templateUrl : 'static/partials/my/notes/new.html',
        resolve : {
          'authenticationRequired' : ['$q', 'userAuthenticate',
          function($q, userAuthenticate) {
            var deferred = $q.defer();
            userAuthenticate.authenticate(deferred);
            return deferred.promise;
          }],
          prefix : ['userPrefix',
          function(userPrefix) {
            userPrefix.setCollectivePrefix();
          }]

        }
      });

      $routeProvider.when('/my/tasks', {
        controller : 'TasksController',
        templateUrl : 'static/partials/my/tasksSlides.html',
        resolve : {
          'authenticationRequired' : ['$q', 'userAuthenticate',
          function($q, userAuthenticate) {
            var deferred = $q.defer();
            userAuthenticate.authenticate(deferred);
            return deferred.promise;
          }],
          slideIndex : ['Enum',
          function(Enum) {
            return Enum.my.tasks;
          }],
          prefix : ['userPrefix',
          function(userPrefix) {
            userPrefix.setMyPrefix();
          }]

        }
      });

      $routeProvider.when('/collective/:collectiveUUID/tasks', {
        controller : 'TasksController',
        templateUrl : 'static/partials/my/tasksSlides.html',
        resolve : {
          'authenticationRequired' : ['$q', 'userAuthenticate',
          function($q, userAuthenticate) {
            var deferred = $q.defer();
            userAuthenticate.authenticate(deferred);
            return deferred.promise;
          }],
          slideIndex : ['Enum',
          function(Enum) {
            return Enum.my.tasks;
          }],
          prefix : ['userPrefix',
          function(userPrefix) {
            userPrefix.setCollectivePrefix();
          }]

        }
      });

      $routeProvider.when('/my/tasks/context/:uuid', {
        controller : 'ContextController',
        templateUrl : 'static/partials/my/tasks/context.html',
        resolve : {
          'authenticationRequired' : ['$q', 'userAuthenticate',
          function($q, userAuthenticate) {
            var deferred = $q.defer();
            userAuthenticate.authenticate(deferred);
            return deferred.promise;
          }],
          prefix : ['userPrefix',
          function(userPrefix) {
            userPrefix.setMyPrefix();
          }]

        }
      });

      $routeProvider.when('/collective/:collectiveUUID/tasks/context/:uuid', {
        controller : 'ContextController',
        templateUrl : 'static/partials/my/tasks/context.html',
        resolve : {
          'authenticationRequired' : ['$q', 'userAuthenticate',
          function($q, userAuthenticate) {
            var deferred = $q.defer();
            userAuthenticate.authenticate(deferred);
            return deferred.promise;
          }],
          prefix : ['userPrefix',
          function(userPrefix) {
            userPrefix.setCollectivePrefix();
          }]

        }
      });

      $routeProvider.when('/my/tasks/edit/:uuid', {
        controller : 'EditTaskController',
        templateUrl : 'static/partials/my/tasks/edit.html',
        resolve : {
          'authenticationRequired' : ['$q', 'userAuthenticate',
          function($q, userAuthenticate) {
            var deferred = $q.defer();
            userAuthenticate.authenticate(deferred);
            return deferred.promise;
          }],
          prefix : ['userPrefix',
          function(userPrefix) {
            userPrefix.setMyPrefix();
          }]

        }
      });

      $routeProvider.when('/collective/:collectiveUUID/tasks/edit/:uuid', {
        controller : 'EditTaskController',
        templateUrl : 'static/partials/my/tasks/edit.html',
        resolve : {
          'authenticationRequired' : ['$q', 'userAuthenticate',
          function($q, userAuthenticate) {
            var deferred = $q.defer();
            userAuthenticate.authenticate(deferred);
            return deferred.promise;
          }],
          prefix : ['userPrefix',
          function(userPrefix) {
            userPrefix.setCollectivePrefix();
          }]

        }
      });

      $routeProvider.when('/my/tasks/new', {
        controller : 'NewTaskController',
        templateUrl : 'static/partials/my/tasks/new.html',
        resolve : {
          'authenticationRequired' : ['$q', 'userAuthenticate',
          function($q, userAuthenticate) {
            var deferred = $q.defer();
            userAuthenticate.authenticate(deferred);
            return deferred.promise;
          }],
          prefix : ['userPrefix',
          function(userPrefix) {
            userPrefix.setMyPrefix();
          }]

        }
      });

      $routeProvider.when('/collective/:collectiveUUID/tasks/new', {
        controller : 'NewTaskController',
        templateUrl : 'static/partials/my/tasks/new.html',
        resolve : {
          'authenticationRequired' : ['$q', 'userAuthenticate',
          function($q, userAuthenticate) {
            var deferred = $q.defer();
            userAuthenticate.authenticate(deferred);
            return deferred.promise;
          }],
          prefix : ['userPrefix',
          function(userPrefix) {
            userPrefix.setCollectivePrefix();
          }]

        }
      });

      $routeProvider.when('/my/tasks/project/:uuid', {
        controller : 'ProjectController',
        templateUrl : 'static/partials/my/tasks/project.html',
        resolve : {
          'authenticationRequired' : ['$q', 'userAuthenticate',
          function($q, userAuthenticate) {
            var deferred = $q.defer();
            userAuthenticate.authenticate(deferred);
            return deferred.promise;
          }],
          prefix : ['userPrefix',
          function(userPrefix) {
            userPrefix.setMyPrefix();
          }]

        }
      });

      $routeProvider.when('/collective/:collectiveUUID/tasks/project/:uuid', {
        controller : 'ProjectController',
        templateUrl : 'static/partials/my/tasks/project.html',
        resolve : {
          'authenticationRequired' : ['$q', 'userAuthenticate',
          function($q, userAuthenticate) {
            var deferred = $q.defer();
            userAuthenticate.authenticate(deferred);
            return deferred.promise;
          }],
          prefix : ['userPrefix',
          function(userPrefix) {
            userPrefix.setCollectivePrefix();
          }]

        }
      });

      $routeProvider.otherwise({
        controller : 'PageNotFoundController',
        redirectTo : '404'
      });

      $locationProvider.html5Mode(true);
    }]);

angular.module('em.app').run(['$location', '$rootScope', 'errorHandler', 'userAuthenticate', 'userPrefix',
  function($location, $rootScope, errorHandler, userAuthenticate, userPrefix) {

    $rootScope.$on('$routeChangeSuccess', function() {
      errorHandler.clear();
    });

  }]);
}());
