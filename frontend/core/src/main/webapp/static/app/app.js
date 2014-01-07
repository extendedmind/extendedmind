/*global angular, html5Mode */
'use strict';

angular.module('em.app', ['ngRoute', 'ngAnimate', 'ngTouch', 'common', 'em.directives', 'em.filters', 'em.services']);
angular.module('em.directives', ['common']);
angular.module('em.filters', ['common']);
angular.module('em.services', ['common', 'em.base64']);

angular.module('em.app').config(['$locationProvider', '$routeProvider',
  function($locationProvider, $routeProvider) {

    var h5m = (typeof html5Mode !== 'undefined') ? html5Mode: true;
    $locationProvider.html5Mode(h5m);

    $routeProvider.when('/', {
      redirectTo: 'my/tasks/home'
    });

    $routeProvider.when('/accept/:hex_code', {
      templateUrl: 'static/app/auth/signup.html',
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
      templateUrl: 'static/app/auth/login.html',
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
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setMyPrefix();
        }]

      }
      
    });

    $routeProvider.when('/my/tasks/home', {
      controller: 'HomeController',
      templateUrl: 'static/app/main/tasksSlides.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.check();
        }],
        slide: ['TasksSlidesService', 'SwiperService',
        function(TasksSlidesService, SwiperService) {
          SwiperService.setInitialSlidePath(TasksSlidesService.HOME);
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setMyPrefix();
        }]

      }
    });

    $routeProvider.when('/collective/:collectiveUUID/tasks/home', {
      controller: 'HomeController',
      templateUrl: 'static/app/main/tasksSlides.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.check();
        }],
        slide: ['TasksSlidesService', 'SwiperService',
        function(TasksSlidesService, SwiperService) {
          SwiperService.setInitialSlidePath(TasksSlidesService.HOME);
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setCollectivePrefix();
        }]

      }
    });

    $routeProvider.when('/my/tasks/inbox', {
      controller: 'InboxController',
      templateUrl: 'static/app/main/tasksSlides.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.check();
        }],
        slide: ['TasksSlidesService', 'SwiperService',
        function(TasksSlidesService, SwiperService) {
          SwiperService.setInitialSlidePath(TasksSlidesService.INBOX);
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setMyPrefix();
        }]
      }
    });

    $routeProvider.when('/collective/:collectiveUUID/tasks/inbox', {
      controller: 'InboxController',
      templateUrl: 'static/app/main/tasksSlides.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.check();
        }],
        slide: ['TasksSlidesService', 'SwiperService',
        function(TasksSlidesService, SwiperService) {
          SwiperService.setInitialSlidePath(TasksSlidesService.INBOX);
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setCollectivePrefix();
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
        slide: ['TasksSlidesService', 'SwiperService',
        function(TasksSlidesService, SwiperService) {
          SwiperService.setInitialSlidePath(TasksSlidesService.LISTS);
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setMyPrefix();
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
        slide: ['TasksSlidesService', 'SwiperService',
        function(TasksSlidesService, SwiperService) {
          SwiperService.setInitialSlidePath(TasksSlidesService.LISTS);
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setCollectivePrefix();
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
        slide: ['TasksSlidesService', 'SwiperService',
        function(TasksSlidesService, SwiperService) {
          SwiperService.setInitialSlidePath(TasksSlidesService.PROJECTS);
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setMyPrefix();
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
        slide: ['TasksSlidesService', 'SwiperService',
        function(TasksSlidesService, SwiperService) {
          SwiperService.setInitialSlidePath(TasksSlidesService.PROJECTS);
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setCollectivePrefix();
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
        slide: ['$route', 'TasksSlidesService', 'SwiperService',
        function($route, TasksSlidesService, SwiperService) {
          SwiperService.setInitialSlidePath(
            TasksSlidesService.PROJECTS,
            TasksSlidesService.getProjectSlidePath($route.current.params.uuid));
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setMyPrefix();
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
        slide: ['$route', 'TasksSlidesService', 'SwiperService',
        function($route, TasksSlidesService, SwiperService) {
          SwiperService.setInitialSlidePath(
            TasksSlidesService.PROJECTS,
            TasksSlidesService.getProjectSlidePath($route.current.params.uuid));
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setCollectivePrefix();
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
        slide: ['TasksSlidesService', 'SwiperService',
        function(TasksSlidesService, SwiperService) {
          SwiperService.setInitialSlidePath(TasksSlidesService.DATES);
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setMyPrefix();
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
        slide: ['TasksSlidesService', 'SwiperService',
        function(TasksSlidesService, SwiperService) {
          SwiperService.setInitialSlidePath(TasksSlidesService.DATES);
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setCollectivePrefix();
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
        slide: ['$route', 'TasksSlidesService', 'SwiperService',
        function($route, TasksSlidesService, SwiperService) {
          SwiperService.setInitialSlidePath(
            TasksSlidesService.DATES,
            TasksSlidesService.getDateSlidePath($route.current.params.date));
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setMyPrefix();
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
        slide: ['$route', 'TasksSlidesService', 'SwiperService',
        function($route, TasksSlidesService, SwiperService) {
          SwiperService.setInitialSlidePath(
            TasksSlidesService.DATES,
            TasksSlidesService.getDateSlidePath($route.current.params.uuid));
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setCollectivePrefix();
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
        slide: ['TasksSlidesService', 'SwiperService',
        function(TasksSlidesService, SwiperService) {
          SwiperService.setInitialSlidePath(TasksSlidesService.SINGLE_TASKS);
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setMyPrefix();
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
        slide: ['TasksSlidesService', 'SwiperService',
        function(TasksSlidesService, SwiperService) {
          SwiperService.setInitialSlidePath(TasksSlidesService.SINGLE_TASKS);
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setCollectivePrefix();
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
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setMyPrefix();
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
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setCollectivePrefix();
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
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setMyPrefix();
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
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setCollectivePrefix();
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
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setMyPrefix();
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
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setCollectivePrefix();
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
