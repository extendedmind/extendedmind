/* global angular, html5Mode, FastClick */
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
      resolve: {
        userStatus: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.checkAndRedirectUser();
        }]
      }
    });

    $routeProvider.when('/launch', {
      templateUrl: 'static/app/auth/launch.html'
    });

    $routeProvider.when('/waiting', {
      templateUrl: 'static/app/auth/waiting.html',
      resolve: {
        isEmailOrUUID: ['$location', '$route',
        function($location, $route) {
          if (!$route.current.params.email && !$route.current.params.uuid) {
            $location.path('/login').search({});
          }
        }]
      }
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

    $routeProvider.when('/forgot', {
      templateUrl: 'static/app/auth/forgot.html'
    });

    $routeProvider.when('/reset/:hex_code', {
      templateUrl: 'static/app/auth/forgot.html',
      resolve: {
        routes: ['$location', '$route', 'AuthenticationService',
        function($location, $route, AuthenticationService) {
          if (!$route.current.params.hex_code || !$route.current.params.email) {
            $location.path('/login');
          }else{
            // make sure code is valid
            AuthenticationService.getPasswordResetExpires($route.current.params.hex_code, $route.current.params.email).then(
              function(passwordResetExpiresResponse){
                if (!passwordResetExpiresResponse.data || !passwordResetExpiresResponse.data.resetCodeExpires){
                  $location.path('/login');
                }
              }
              );
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
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }]
      }
    });

    $routeProvider.when('/about', {
      templateUrl: 'static/app/base/about.html'
    });

    $routeProvider.when('/my/account/password', {
      templateUrl: 'static/app/auth/changePassword.html'
    });


    // INBOX

    $routeProvider.when('/my/inbox', {
      templateUrl: 'static/app/main/inbox.html',
      resolve: {
        auth: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }],
        owner: ['UserSessionService',
        function(UserSessionService) {
          return UserSessionService.setMyActive();
        }]
      }
    });

    $routeProvider.when('/collective/:collectiveUUID/inbox', {
      templateUrl: 'static/app/main/inbox.html',
      resolve: {
        auth: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }],
        owner: ['$route', 'UserSessionService',
        function($route, UserSessionService) {
          UserSessionService.setCollectiveActive($route.current.params.collectiveUUID);
        }]
      }
    });

    // ITEMS

    $routeProvider.when('/my/items/new', {
      templateUrl: 'static/app/main/editItem.html',
      resolve: {
        auth: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }],
        owner: ['UserSessionService',
        function(UserSessionService) {
          UserSessionService.setMyActive();
        }]

      }
    });

    $routeProvider.when('/collective/:collectiveUUID/items/new', {
      templateUrl: 'static/app/main/editItem.html',
      resolve: {
        auth: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }],
        owner: ['$route', 'UserSessionService',
        function($route, UserSessionService) {
          UserSessionService.setCollectiveActive($route.current.params.collectiveUUID);
        }]
      }
    });

    $routeProvider.when('/my/items/edit/:uuid', {
      templateUrl: 'static/app/main/editItem.html',
      resolve: {
        auth: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }],
        owner: ['UserSessionService',
        function(UserSessionService) {
          UserSessionService.setMyActive();
        }]

      }
    });

    $routeProvider.when('/collective/:collectiveUUID/items/edit/:uuid', {
      templateUrl: 'static/app/main/editItem.html',
      resolve: {
        auth: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }],
        owner: ['$route', 'UserSessionService',
        function($route, UserSessionService) {
          UserSessionService.setCollectiveActive($route.current.params.collectiveUUID);
        }]
      }
    });

    // TASKS

    $routeProvider.when('/my/tasks', {
      templateUrl: 'static/app/tasks/tasksSlides.html',
      resolve: {
        auth: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }],
        owner: ['UserSessionService',
        function(UserSessionService) {
          UserSessionService.setMyActive();
        }]
      }
    });

    $routeProvider.when('/collective/:collectiveUUID/tasks', {
      templateUrl: 'static/app/tasks/tasksSlides.html',
      resolve: {
        auth: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }],
        owner: ['$route', 'UserSessionService',
        function($route, UserSessionService) {
          UserSessionService.setCollectiveActive($route.current.params.collectiveUUID);
        }]
      }
    });

    $routeProvider.when('/my/tasks/edit/:uuid', {
      templateUrl: 'static/app/tasks/editTask.html',
      resolve: {
        auth: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }],
        owner: ['UserSessionService',
        function(UserSessionService) {
          UserSessionService.setMyActive();
        }]
      }
    });

    $routeProvider.when('/collective/:collectiveUUID/tasks/edit/:uuid', {
      templateUrl: 'static/app/tasks/editTask.html',
      resolve: {
        auth: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }],
        owner: ['$route', 'UserSessionService',
        function($route, UserSessionService) {
          UserSessionService.setCollectiveActive($route.current.params.collectiveUUID);
        }]

      }
    });

    $routeProvider.when('/my/tasks/new', {
      templateUrl: 'static/app/tasks/editTask.html',
      resolve: {
        auth: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }],
        owner: ['UserSessionService',
        function(UserSessionService) {
          UserSessionService.setMyActive();
        }]

      }
    });

    $routeProvider.when('/collective/:collectiveUUID/tasks/new', {
      templateUrl: 'static/app/tasks/editTask.html',
      resolve: {
        auth: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }],
        owner: ['$route', 'UserSessionService',
        function($route, UserSessionService) {
          UserSessionService.setCollectiveActive($route.current.params.collectiveUUID);
        }]
      }
    });

    $routeProvider.when('/my/tasks/new/:parentUUID', {
      templateUrl: 'static/app/tasks/editTask.html',
      resolve: {
        auth: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }],
        owner: ['UserSessionService',
        function(UserSessionService) {
          UserSessionService.setMyActive();
        }]
      }
    });

    $routeProvider.when('/collective/:collectiveUUID/tasks/new/:parentUUID', {
      templateUrl: 'static/app/tasks/editTask.html',
      resolve: {
        auth: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }],
        owner: ['$route', 'UserSessionService',
        function($route, UserSessionService) {
          UserSessionService.setCollectiveActive($route.current.params.collectiveUUID);
        }]
      }
    });

    // NOTES

    $routeProvider.when('/my/notes', {
      templateUrl: 'static/app/notes/notesSlides.html',
      resolve: {
        auth: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }],
        owner: ['UserSessionService',
        function(UserSessionService) {
          return UserSessionService.setMyActive();
        }]
      }
    });

    $routeProvider.when('/collective/:collectiveUUID/notes', {
      templateUrl: 'static/app/notes/notesSlides.html',
      resolve: {
        auth: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }],
        owner: ['$route', 'UserSessionService',
        function($route, UserSessionService) {
          UserSessionService.setCollectiveActive($route.current.params.collectiveUUID);
        }]
      }
    });

    $routeProvider.when('/my/notes/edit/:uuid', {
      templateUrl: 'static/app/notes/editNote.html',
      resolve: {
        auth: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }],
        owner: ['UserSessionService',
        function(UserSessionService) {
          UserSessionService.setMyActive();
        }]

      }
    });

    $routeProvider.when('/collective/:collectiveUUID/notes/edit/:uuid', {
      templateUrl: 'static/app/notes/editNote.html',
      resolve: {
        auth: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }],
        owner: ['$route', 'UserSessionService',
        function($route, UserSessionService) {
          UserSessionService.setCollectiveActive($route.current.params.collectiveUUID);
        }]

      }
    });

    $routeProvider.when('/my/notes/new', {
      templateUrl: 'static/app/notes/editNote.html',
      resolve: {
        auth: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }],
        owner: ['UserSessionService',
        function(UserSessionService) {
          UserSessionService.setMyActive();
        }]

      }
    });

    $routeProvider.when('/collective/:collectiveUUID/notes/new', {
      templateUrl: 'static/app/notes/editNote.html',
      resolve: {
        auth: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }],
        owner: ['$route', 'UserSessionService',
        function($route, UserSessionService) {
          UserSessionService.setCollectiveActive($route.current.params.collectiveUUID);
        }]
      }
    });

    $routeProvider.when('/my/notes/new/:parentUUID', {
      templateUrl: 'static/app/notes/editNote.html',
      resolve: {
        auth: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }],
        owner: ['UserSessionService',
        function(UserSessionService) {
          UserSessionService.setMyActive();
        }]
      }
    });

    $routeProvider.when('/collective/:collectiveUUID/notes/new/:parentUUID', {
      templateUrl: 'static/app/notes/editNote.html',
      resolve: {
        auth: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }],
        owner: ['$route', 'UserSessionService',
        function($route, UserSessionService) {
          UserSessionService.setCollectiveActive($route.current.params.collectiveUUID);
        }]
      }
    });

    // LISTS

    $routeProvider.when('/my/lists/edit/:uuid', {
      templateUrl: 'static/app/base/editList.html',
      resolve: {
        auth: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }],
        owner: ['UserSessionService',
        function(UserSessionService) {
          UserSessionService.setMyActive();
        }]

      }
    });

    $routeProvider.when('/collective/:collectiveUUID/lists/edit/:uuid', {
      templateUrl: 'static/app/base/editList.html',
      resolve: {
        auth: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }],
        owner: ['$route', 'UserSessionService',
        function($route, UserSessionService) {
          UserSessionService.setCollectiveActive($route.current.params.collectiveUUID);
        }]
      }
    });

    // TAGS

    $routeProvider.when('/my/contexts/edit/:uuid', {
      templateUrl: 'static/app/base/editContext.html',
      resolve: {
        auth: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }],
        owner: ['UserSessionService',
        function(UserSessionService) {
          UserSessionService.setMyActive();
        }]

      }
    });

    $routeProvider.when('/collective/:collectiveUUID/contexts/edit/:uuid', {
      templateUrl: 'static/app/base/editContext.html',
      resolve: {
        auth: ['AuthenticationService',
        function(AuthenticationService) {
          return AuthenticationService.verifyAndUpdateAuthentication();
        }],
        owner: ['$route', 'UserSessionService',
        function($route, UserSessionService) {
          UserSessionService.setCollectiveActive($route.current.params.collectiveUUID);
        }]
      }
    });

    // ERROR PAGE

    $routeProvider.otherwise({
      controller: 'PageNotFoundController',
      redirectTo: '404'
    });
  }]);

angular.module('em.app').run(function() {
  // http://stackoverflow.com/a/21113518
  // http://www.youtube.com/watch?v=xOAG7Ab_Oz0#t=2314
  FastClick.attach(document.body);
});
