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
          return auth.verifyAndUpdateAuthentication();
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
          return auth.verifyAndUpdateAuthentication();
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
          return auth.verifyAndUpdateAuthentication();
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

    $routeProvider.when('/my/tasks/edit/:uuid', {
      templateUrl: 'static/app/tasks/editTask.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.verifyAndUpdateAuthentication();
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setMyPrefix();
        }]

      }
    });

    $routeProvider.when('/collective/:collectiveUUID/tasks/edit/:uuid', {
      templateUrl: 'static/app/tasks/editTask.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.verifyAndUpdateAuthentication();
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setCollectivePrefix();
        }]

      }
    });

    $routeProvider.when('/my/tasks/new', {
      templateUrl: 'static/app/tasks/editTask.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.verifyAndUpdateAuthentication();
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setMyPrefix();
        }]

      }
    });

    $routeProvider.when('/collective/:collectiveUUID/tasks/new', {
      templateUrl: 'static/app/tasks/editTask.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.verifyAndUpdateAuthentication();
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setCollectivePrefix();
        }]
      }
    });

    $routeProvider.when('/my/tasks/new/:parentUUID', {
      templateUrl: 'static/app/tasks/editTask.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.verifyAndUpdateAuthentication();
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setMyPrefix();
        }]
      }
    });

    $routeProvider.when('/collective/:collectiveUUID/tasks/new/:parentUUID', {
      templateUrl: 'static/app/tasks/editTask.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.verifyAndUpdateAuthentication();
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setCollectivePrefix();
        }]
      }
    });

    // NOTES

    $routeProvider.when('/my/notes', {
      templateUrl: 'static/app/main/notesSlides.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.verifyAndUpdateAuthentication();
        }],
        slide: ['NotesSlidesService', 'SwiperService',
        function(NotesSlidesService, SwiperService) {
          SwiperService.setInitialSlidePath(NotesSlidesService.HOME);
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setMyPrefix();
        }]
      }
    });

    $routeProvider.when('/collective/:collectiveUUID/notes', {
      templateUrl: 'static/app/main/notesSlides.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.verifyAndUpdateAuthentication();
        }],
        slide: ['NotesSlidesService', 'SwiperService',
        function(NotesSlidesService, SwiperService) {
          SwiperService.setInitialSlidePath(NotesSlidesService.HOME);
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setCollectivePrefix();
        }]
      }
    });

    $routeProvider.when('/my/notes/edit/:uuid', {
      templateUrl: 'static/app/notes/editNote.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.verifyAndUpdateAuthentication();
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setMyPrefix();
        }]

      }
    });

    $routeProvider.when('/collective/:collectiveUUID/notes/edit/:uuid', {
      templateUrl: 'static/app/notes/editNote.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.verifyAndUpdateAuthentication();
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setCollectivePrefix();
        }]

      }
    });

    $routeProvider.when('/my/notes/new', {
      templateUrl: 'static/app/notes/editNote.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.verifyAndUpdateAuthentication();
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setMyPrefix();
        }]

      }
    });

    $routeProvider.when('/collective/:collectiveUUID/notes/new', {
      templateUrl: 'static/app/notes/editNote.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.verifyAndUpdateAuthentication();
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setCollectivePrefix();
        }]
      }
    });

    $routeProvider.when('/my/notes/new/:parentUUID', {
      templateUrl: 'static/app/notes/editNote.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.verifyAndUpdateAuthentication();
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setMyPrefix();
        }]
      }
    });

    $routeProvider.when('/collective/:collectiveUUID/notes/new/:parentUUID', {
      templateUrl: 'static/app/notes/editNote.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.verifyAndUpdateAuthentication();
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setCollectivePrefix();
        }]
      }
    });

    // ITEMS

    $routeProvider.when('/my/items/new', {
      templateUrl: 'static/app/main/editItem.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.verifyAndUpdateAuthentication();
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setMyPrefix();
        }]

      }
    });

    $routeProvider.when('/collective/:collectiveUUID/items/new', {
      templateUrl: 'static/app/main/editItem.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.verifyAndUpdateAuthentication();
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
          return auth.verifyAndUpdateAuthentication();
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setMyPrefix();
        }]

      }
    });

    $routeProvider.when('/collective/:collectiveUUID/items/edit/:uuid', {
      templateUrl: 'static/app/main/editItem.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.verifyAndUpdateAuthentication();
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setCollectivePrefix();
        }]
      }
    });

    // LISTS

    $routeProvider.when('/my/lists/edit/:uuid', {
      templateUrl: 'static/app/base/editList.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.verifyAndUpdateAuthentication();
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setMyPrefix();
        }]

      }
    });

    $routeProvider.when('/collective/:collectiveUUID/lists/edit/:uuid', {
      templateUrl: 'static/app/main/editList.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.verifyAndUpdateAuthentication();
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setCollectivePrefix();
        }]
      }
    });

    // TAGS

    $routeProvider.when('/my/contexts/edit/:uuid', {
      templateUrl: 'static/app/base/editContext.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.verifyAndUpdateAuthentication();
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setMyPrefix();
        }]

      }
    });

    $routeProvider.when('/collective/:collectiveUUID/contexts/edit/:uuid', {
      templateUrl: 'static/app/main/editContext.html',
      resolve: {
        auth: ['AuthenticationService',
        function(auth) {
          return auth.verifyAndUpdateAuthentication();
        }],
        prefix: ['OwnerService',
        function(OwnerService) {
          OwnerService.setCollectivePrefix();
        }]
      }
    });


    // ERROR PAGE

    $routeProvider.otherwise({
      controller: 'PageNotFoundController',
      redirectTo: '404'
    });
  }]);

angular.module('em.app').run(['$rootScope', 'ErrorHandlerService',
  function($rootScope, ErrorHandlerService) {

    // http://stackoverflow.com/a/21113518
    // http://www.youtube.com/watch?v=xOAG7Ab_Oz0#t=2314
    FastClick.attach(document.body);

    $rootScope.$on('$routeChangeSuccess', function() {
      ErrorHandlerService.clear();
    });
  }]);
