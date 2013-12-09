/*global angular, html5Mode */
'use strict';

angular.module('em.app', ['ngRoute', 'ngAnimate', 'ngTouch', 'em.directives', 'em.filters', 'em.services']);
angular.module('em.directives', []);
angular.module('em.filters', []);
angular.module('em.services', ['em.base64']);

angular.module('em.app').config(['$locationProvider', '$routeProvider',
  function($locationProvider, $routeProvider) {

    var h5m = (typeof html5Mode !== 'undefined') ? html5Mode : true;
    $locationProvider.html5Mode(h5m);

    $routeProvider.when('/', {
      redirectTo: 'my'
    });

    $routeProvider.when('/accept/:hex_code', {
      templateUrl: 'static/partials/signup.html',
      controller: 'SignupController',
      resolve: {
        routes: ['$location', '$route',
        function($location, $route) {
          if (!$route.current.params.hex_code || !$route.current.params.email) {
            $location.path('/login');
          }
        }]
      }
    });

    $routeProvider.when('/404', {
      templateUrl: 'static/partials/pageNotFound.html',
      controller: 'PageNotFoundController'
    });

    $routeProvider.when('/login', {
      templateUrl: 'static/partials/login.html',
      controller: 'LoginController'
    });

    $routeProvider.when('/my/account', {
      templateUrl : 'static/partials/account.html',
      controller : 'AccountController',
      resolve : {
        auth: ['auth',
        function(auth) {
          return auth.check();
        }],
        prefix : ['userPrefix',
        function(userPrefix) {
          userPrefix.setMyPrefix();
        }]

      }
    });

    $routeProvider.when('/my', {
      controller : 'MyController',
      templateUrl : 'static/partials/emSlides.html',
      resolve : {
        auth: ['auth',
        function(auth) {
          return auth.check();
        }],
        slide: ['Enum', 'swiperSlides',
        function(Enum, swiperSlides) {
          swiperSlides.setInitialSlideIndex(Enum.MY);
        }],
        prefix : ['userPrefix',
        function(userPrefix) {
          userPrefix.setMyPrefix();
        }]

      }
    });

    $routeProvider.when('/collective/:collectiveUUID', {
      controller : 'MyController',
      templateUrl : 'static/partials/emSlides.html',
      resolve : {
        auth: ['auth',
        function(auth) {
          return auth.check();
        }],
        slide: ['Enum', 'swiperSlides',
        function(Enum, swiperSlides) {
          swiperSlides.setInitialSlideIndex(Enum.MY);
        }],
        prefix : ['userPrefix',
        function(userPrefix) {
          userPrefix.setCollectivePrefix();
        }]

      }
    });

    $routeProvider.when('/my/inbox', {
      controller: 'InboxController',
      templateUrl : 'static/partials/emSlides.html',
      resolve: {
        auth: ['auth',
        function(auth) {
          return auth.check();
        }],
        slide: ['Enum', 'swiperSlides',
        function(Enum, swiperSlides) {
          swiperSlides.setInitialSlideIndex(Enum.INBOX);
        }],
        prefix : ['userPrefix',
        function(userPrefix) {
          userPrefix.setMyPrefix();
        }]
      }
    });

    $routeProvider.when('/collective/:collectiveUUID/inbox', {
      controller: 'InboxController',
      templateUrl : 'static/partials/emSlides.html',
      resolve: {
        auth: ['auth',
        function(auth) {
          return auth.check();
        }],
        slide: ['Enum', 'swiperSlides',
        function(Enum, swiperSlides) {
          swiperSlides.setInitialSlideIndex(Enum.INBOX);
        }],
        prefix : ['userPrefix',
        function(userPrefix) {
          userPrefix.setCollectivePrefix();
        }]
      }
    });

    $routeProvider.when('/my/notes', {
      controller : 'NotesController',
      templateUrl : 'static/partials/emSlides.html',
      resolve : {
        auth: ['auth',
        function(auth) {
          return auth.check();
        }],
        slide: ['Enum', 'swiperSlides',
        function(Enum, swiperSlides) {
          swiperSlides.setInitialSlideIndex(Enum.NOTES);
        }],
        prefix : ['userPrefix',
        function(userPrefix) {
          userPrefix.setMyPrefix();
        }]

      }
    });

    $routeProvider.when('/collective/:collectiveUUID/notes', {
      controller : 'NotesController',
      templateUrl : 'static/partials/emSlides.html',
      resolve : {
        auth: ['auth',
        function(auth) {
          return auth.check();
        }],
        slide: ['Enum', 'swiperSlides',
        function(Enum, swiperSlides) {
          swiperSlides.setInitialSlideIndex(Enum.NOTES);
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
        auth: ['auth',
        function(auth) {
          return auth.check();
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
        auth: ['auth',
        function(auth) {
          return auth.check();
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
        auth: ['auth',
        function(auth) {
          return auth.check();
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
        auth: ['auth',
        function(auth) {
          return auth.check();
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
        auth: ['auth',
        function(auth) {
          return auth.check();
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
        auth: ['auth',
        function(auth) {
          return auth.check();
        }],
        prefix : ['userPrefix',
        function(userPrefix) {
          userPrefix.setCollectivePrefix();
        }]

      }
    });

    $routeProvider.when('/my/tasks', {
      controller : 'TasksController',
      templateUrl : 'static/partials/emSlides.html',
      resolve : {
        auth: ['auth',
        function(auth) {
          return auth.check();
        }],
        slide: ['Enum', 'swiperSlides',
        function(Enum, swiperSlides) {
          swiperSlides.setInitialSlideIndex(Enum.TASKS);
        }],
        prefix : ['userPrefix',
        function(userPrefix) {
          userPrefix.setMyPrefix();
        }]

      }
    });

    $routeProvider.when('/collective/:collectiveUUID/tasks', {
      controller : 'TasksController',
      templateUrl : 'static/partials/emSlides.html',
      resolve : {
        auth: ['auth',
        function(auth) {
          return auth.check();
        }],
        slide: ['Enum', 'swiperSlides',
        function(Enum, swiperSlides) {
          swiperSlides.setInitialSlideIndex(Enum.TASKS);
        }],
        prefix : ['userPrefix',
        function(userPrefix) {
          userPrefix.setCollectivePrefix();
        }]

      }
    });

    $routeProvider.when('/my/tasks/today', {
      controller: 'TasksController',
      templateUrl : 'static/partials/emSlides.html',
      resolve: {
        auth: ['auth',
        function(auth) {
          return auth.check();
        }],
        slide: ['Enum', 'swiperSlides',
        function(Enum, swiperSlides) {
          swiperSlides.setInitialSlideIndex(Enum.TODAY);
        }],
        prefix: ['userPrefix',
        function(userPrefix) {
          userPrefix.setMyPrefix();
        }]
      }
    });

    $routeProvider.when('/collective/:collectiveUUID/tasks/today', {
      controller: 'TasksController',
      templateUrl : 'static/partials/emSlides.html',
      resolve: {
        auth: ['auth',
        function(auth) {
          return auth.check();
        }],
        slide: ['Enum', 'swiperSlides',
        function(Enum, swiperSlides) {
          swiperSlides.setInitialSlideIndex(Enum.TODAY);
        }],
        prefix: ['userPrefix',
        function(userPrefix) {
          userPrefix.setCollectivePrefix();
        }]
      }
    });

    $routeProvider.when('/my/tasks/context/:uuid', {
      controller : 'ContextController',
      templateUrl : 'static/partials/my/tasks/context.html',
      resolve : {
        auth: ['auth',
        function(auth) {
          return auth.check();
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
        auth: ['auth',
        function(auth) {
          return auth.check();
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
        auth: ['auth',
        function(auth) {
          return auth.check();
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
        auth: ['auth',
        function(auth) {
          return auth.check();
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
        auth: ['auth',
        function(auth) {
          return auth.check();
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
        auth: ['auth',
        function(auth) {
          return auth.check();
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
        auth: ['auth',
        function(auth) {
          return auth.check();
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
        auth: ['auth',
        function(auth) {
          return auth.check();
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
  }]);

angular.module('em.app').run(['$rootScope', 'analytics', 'errorHandler',
  function($rootScope, analytics, errorHandler) {

    $rootScope.$on('$routeChangeSuccess', function() {
      errorHandler.clear();
    });

    $rootScope.$on('$viewContentLoaded', function() {
     analytics.open();
   });

  }]);
