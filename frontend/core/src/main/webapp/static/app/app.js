'use strict';

angular.module('em.app', ['ngRoute', 'common', 'em.directives', 'em.filters', 'em.services']);
angular.module('em.directives', ['common']);
angular.module('em.filters', ['common']);
angular.module('em.services', ['common', 'em.base64']);

angular.module('em.app').config(['$locationProvider', '$routeProvider',
  function($locationProvider, $routeProvider) {

    var h5m = (typeof html5Mode !== 'undefined') ? html5Mode: true;
    $locationProvider.html5Mode(h5m);

    $routeProvider.when('/', {
      redirectTo: 'my/tasks'
    });

    $routeProvider.when('/accept/:hex_code', {
      templateUrl: 'static/app/auth/signup.html',
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
      templateUrl: 'static/app/auth/login.html'
    });

    $routeProvider.when('/my/account', {
      templateUrl: 'static/app/account/account.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.checkAuthentication();
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setMyPrefix();
        }]

      }
      
    });

    $routeProvider.when('/my/tasks', {
      templateUrl: 'static/app/main/tasksSlides.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.checkAuthentication();
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

    $routeProvider.when('/collective/:collectiveUUID/tasks', {
      templateUrl: 'static/app/main/tasksSlides.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.checkAuthentication();
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

    $routeProvider.when('/my/tasks/context/:uuid', {
      controller: 'ContextController',
      templateUrl: 'static/app/tasks/context.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.checkAuthentication();
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
          return auth.checkAuthentication();
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
          return auth.checkAuthentication();
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
          return auth.checkAuthentication();
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
          return auth.checkAuthentication();
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
          return auth.checkAuthentication();
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setCollectivePrefix();
        }]

      }
    });

    $routeProvider.when('/my/items/new', {
      templateUrl: 'static/app/main/editItem.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.checkAuthentication();
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setMyPrefix();
        }]

      }
    });

    $routeProvider.when('/collective/:collectiveUUID/items/new', {
      templateUrl: 'static/app/tasks/editItem.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.checkAuthentication();
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setCollectivePrefix();
        }]
      }
    });

    $routeProvider.when('/my/items/edit/:uuid', {
      templateUrl: 'static/app/main/editItem.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.checkAuthentication();
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setMyPrefix();
        }]

      }
    });

    $routeProvider.when('/collective/:collectiveUUID/items/edit/:uuid', {
      templateUrl: 'static/app/tasks/editItem.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.checkAuthentication();
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

angular.module('em.app').run(['$rootScope', 'ErrorHandlerService',
  function($rootScope, ErrorHandlerService) {

    $rootScope.$on('$routeChangeSuccess', function() {
      ErrorHandlerService.clear();
    });
  }]);
