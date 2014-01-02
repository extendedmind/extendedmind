/*global angular, html5Mode */
'use strict';

angular.module('em.app', ['ngRoute', 'ngAnimate', 'ngTouch', 'em.directives', 'em.filters', 'em.services']);
angular.module('em.directives', []);
angular.module('em.filters', []);
angular.module('em.services', ['em.base64']);

angular.module('em.app').config(['$locationProvider', '$routeProvider',
  function($locationProvider, $routeProvider) {

    var h5m = (typeof html5Mode !== 'undefined') ? html5Mode: true;
    $locationProvider.html5Mode(h5m);

    $routeProvider.when('/', {
      redirectTo: 'my'
    });

    $routeProvider.when('/accept/:hex_code', {
      templateUrl: 'static/app/entry/signup.html',
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
      templateUrl: 'static/app/main/pageNotFound.html',
      controller: 'PageNotFoundController'
    });

    $routeProvider.when('/login', {
      templateUrl: 'static/app/entry/login.html',
      controller: 'LoginController'
    });

    $routeProvider.when('/my/account', {
      templateUrl: 'static/app/account/account.html',
      controller: 'AccountController',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.check();
        }],
        prefix: ['userPrefix',
        function(userPrefix) {
          userPrefix.setMyPrefix();
        }]

      }
    });

    $routeProvider.when('/my', {
      controller: 'HomeController',
      templateUrl: 'static/app/main/tasksSlides.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.check();
        }],
        slide: ['Enum', 'emSwiper',
        function(Enum, emSwiper) {
          emSwiper.setSlides(Enum.HOME);
        }],
        prefix: ['userPrefix',
        function(userPrefix) {
          userPrefix.setMyPrefix();
        }]

      }
    });

    $routeProvider.when('/collective/:collectiveUUID', {
      controller: 'HomeController',
      templateUrl: 'static/app/main/tasksSlides.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.check();
        }],
        slide: ['Enum', 'emSwiper',
        function(Enum, emSwiper) {
          emSwiper.setSlides(Enum.HOME);
        }],
        prefix: ['userPrefix',
        function(userPrefix) {
          userPrefix.setCollectivePrefix();
        }]

      }
    });

    $routeProvider.when('/my/inbox', {
      controller: 'InboxController',
      templateUrl: 'static/app/main/tasksSlides.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.check();
        }],
        slide: ['Enum', 'emSwiper',
        function(Enum, emSwiper) {
          emSwiper.setSlides(Enum.INBOX);
        }],
        prefix: ['userPrefix',
        function(userPrefix) {
          userPrefix.setMyPrefix();
        }]
      }
    });

    $routeProvider.when('/collective/:collectiveUUID/inbox', {
      controller: 'InboxController',
      templateUrl: 'static/app/main/tasksSlides.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.check();
        }],
        slide: ['Enum', 'emSwiper',
        function(Enum, emSwiper) {
          emSwiper.setSlides(Enum.INBOX);
        }],
        prefix: ['userPrefix',
        function(userPrefix) {
          userPrefix.setCollectivePrefix();
        }]
      }
    });

    $routeProvider.when('/my/tasks/lists', {
      controller: 'TasksSlidesController',
      templateUrl: 'static/app/main/tasksSlides.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.check();
        }],
        slide: ['Enum', 'emSwiper',
        function(Enum, emSwiper) {
          emSwiper.setSlides(Enum.LISTS);
        }],
        prefix: ['userPrefix',
        function(userPrefix) {
          userPrefix.setMyPrefix();
        }]

      }
    });

    $routeProvider.when('/collective/:collectiveUUID/tasks/lists', {
      controller: 'TasksSlidesController',
      templateUrl: 'static/app/main/tasksSlides.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.check();
        }],
        slide: ['Enum', 'emSwiper',
        function(Enum, emSwiper) {
          emSwiper.setSlides(Enum.LISTS);
        }],
        prefix: ['userPrefix',
        function(userPrefix) {
          userPrefix.setCollectivePrefix();
        }]

      }
    });

    $routeProvider.when('/my/tasks/projects', {
      controller: 'ProjectController',
      templateUrl: 'static/app/main/tasksSlides.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.check();
        }],
        slide: ['Enum', 'emSwiper',
        function(Enum, emSwiper) {
          emSwiper.setSlides(Enum.PROJECTS);
        }],
        prefix: ['userPrefix',
        function(userPrefix) {
          userPrefix.setMyPrefix();
        }]
      }
    });

    $routeProvider.when('/collective/:collectiveUUID/tasks/projects', {
      controller: 'ProjectController',
      templateUrl: 'static/app/main/tasksSlides.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.check();
        }],
        slide: ['Enum', 'emSwiper',
        function(Enum, emSwiper) {
          emSwiper.setSlides(Enum.PROJECTS);
        }],
        prefix: ['userPrefix',
        function(userPrefix) {
          userPrefix.setCollectivePrefix();
        }]
      }
    });

    $routeProvider.when('/my/tasks/projects/:uuid', {
      controller: 'ProjectController',
      templateUrl: 'static/app/main/tasksSlides.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.check();
        }],
        slide: ['$route', 'Enum', 'emSwiper',
        function($route, Enum, emSwiper) {
          emSwiper.setSlides(Enum.PROJECTS, $route.current.params.uuid);
        }],
        prefix: ['userPrefix',
        function(userPrefix) {
          userPrefix.setMyPrefix();
        }]
      }
    });

    $routeProvider.when('/collective/:collectiveUUID/tasks/projects/:uuid', {
      controller: 'ProjectController',
      templateUrl: 'static/app/main/tasksSlides.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.check();
        }],
        slide: ['$route', 'Enum', 'emSwiper',
        function($route, Enum, emSwiper) {
          emSwiper.setSlides(Enum.PROJECTS, $route.current.params.uuid);
        }],
        prefix: ['userPrefix',
        function(userPrefix) {
          userPrefix.setCollectivePrefix();
        }]
      }
    });

    $routeProvider.when('/my/tasks/dates', {
      controller: 'DatesController',
      templateUrl: 'static/app/main/tasksSlides.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.check();
        }],
        slide: ['Enum', 'emSwiper',
        function(Enum, emSwiper) {
          emSwiper.setSlides(Enum.DATES);
        }],
        prefix: ['userPrefix',
        function(userPrefix) {
          userPrefix.setMyPrefix();
        }]
      }
    });

    $routeProvider.when('/collective/:collectiveUUID/tasks/dates', {
      controller: 'DatesController',
      templateUrl: 'static/app/main/tasksSlides.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.check();
        }],
        slide: ['Enum', 'emSwiper',
        function(Enum, emSwiper) {
          emSwiper.setSlides(Enum.DATES);
        }],
        prefix: ['userPrefix',
        function(userPrefix) {
          userPrefix.setCollectivePrefix();
        }]
      }
    });

    $routeProvider.when('/my/tasks/dates/:date', {
      controller: 'DatesController',
      templateUrl: 'static/app/main/tasksSlides.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.check();
        }],
        slide: ['$route', 'Enum', 'emSwiper',
        function($route, Enum, emSwiper) {
          emSwiper.setSlides(Enum.DATES, $route.current.params.date);
        }],
        prefix: ['userPrefix',
        function(userPrefix) {
          userPrefix.setMyPrefix();
        }]
      }
    });

    $routeProvider.when('/collective/:collectiveUUID/tasks/dates/:date', {
      controller: 'DatesController',
      templateUrl: 'static/app/main/tasksSlides.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.check();
        }],
        slide: ['$route', 'Enum', 'emSwiper',
        function($route, Enum, emSwiper) {
          emSwiper.setSlides(Enum.DATES, $route.current.params.date);
        }],
        prefix: ['userPrefix',
        function(userPrefix) {
          userPrefix.setCollectivePrefix();
        }]
      }
    });

    $routeProvider.when('/my/tasks/single', {
      controller: 'TasksSlidesController',
      templateUrl: 'static/app/main/tasksSlides.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.check();
        }],
        slide: ['Enum', 'emSwiper',
        function(Enum, emSwiper) {
          emSwiper.setSlides(Enum.SINGLE_TASKS);
        }],
        prefix: ['userPrefix',
        function(userPrefix) {
          userPrefix.setMyPrefix();
        }]

      }
    });

    $routeProvider.when('/collective/:collectiveUUID/tasks/single', {
      controller: 'TasksSlidesController',
      templateUrl: 'static/app/main/tasksSlides.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.check();
        }],
        slide: ['Enum', 'emSwiper',
        function(Enum, emSwiper) {
          emSwiper.setSlides(Enum.SINGLE_TASKS);
        }],
        prefix: ['userPrefix',
        function(userPrefix) {
          userPrefix.setCollectivePrefix();
        }]
      }
    });

    $routeProvider.when('/my/tasks/context/:uuid', {
      controller: 'ContextController',
      templateUrl: 'static/app/tasks/context.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.check();
        }],
        prefix: ['userPrefix',
        function(userPrefix) {
          userPrefix.setMyPrefix();
        }]

      }
    });

    $routeProvider.when('/collective/:collectiveUUID/tasks/context/:uuid', {
      controller: 'ContextController',
      templateUrl: 'static/app/tasks/context.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.check();
        }],
        prefix: ['userPrefix',
        function(userPrefix) {
          userPrefix.setCollectivePrefix();
        }]

      }
    });

    $routeProvider.when('/my/tasks/edit/:uuid', {
      controller: 'EditTaskController',
      templateUrl: 'static/app/tasks/editTask.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.check();
        }],
        prefix: ['userPrefix',
        function(userPrefix) {
          userPrefix.setMyPrefix();
        }]

      }
    });

    $routeProvider.when('/collective/:collectiveUUID/tasks/edit/:uuid', {
      controller: 'EditTaskController',
      templateUrl: 'static/app/tasks/editTask.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.check();
        }],
        prefix: ['userPrefix',
        function(userPrefix) {
          userPrefix.setCollectivePrefix();
        }]

      }
    });

    $routeProvider.when('/my/tasks/new', {
      controller: 'NewTaskController',
      templateUrl: 'static/app/tasks/newTask.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.check();
        }],
        prefix: ['userPrefix',
        function(userPrefix) {
          userPrefix.setMyPrefix();
        }]

      }
    });

    $routeProvider.when('/collective/:collectiveUUID/tasks/new', {
      controller: 'NewTaskController',
      templateUrl: 'static/app/tasks/newTask.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.check();
        }],
        prefix: ['userPrefix',
        function(userPrefix) {
          userPrefix.setCollectivePrefix();
        }]

      }
    });

    $routeProvider.otherwise({
      controller: 'PageNotFoundController',
      redirectTo: '404'
    });
  }]);

angular.module('em.app').run(['$rootScope', 'AnalyticsService', 'ErrorHandlerService',
  function($rootScope, AnalyticsService, ErrorHandlerService) {

    $rootScope.$on('$routeChangeSuccess', function() {
      ErrorHandlerService.clear();
    });

    $rootScope.$on('$viewContentLoaded', function() {
     AnalyticsService.open();
   });

  }]);
