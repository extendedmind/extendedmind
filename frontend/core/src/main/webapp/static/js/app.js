/*global angular, templateUrlPrefix*/

( function() {'use strict';

    angular.module('em.app', ['ngMobile', 'angular-carousel', 'em.directives', 'em.filters', 'em.services']);
    angular.module('em.directives', []);
    angular.module('em.filters', []);
    angular.module('em.services', ['em.base64']);

    angular.module('em.app').config(['$locationProvider', '$routeProvider',
    function($locationProvider, $routeProvider) {

      $routeProvider.when('/', {
        templateUrl : 'static/partials/home.html',
        controller : 'HomeController'
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
        controller : 'MyPagesController',
        templateUrl : 'static/partials/myPages.html',
        resolve : {
          authenticationRequired : ['$rootScope',
          function($rootScope) {
            $rootScope.$broadcast('event:authenticationRequired');
          }],
          slideIndex : ['Enum', 'slideUrl',
          function(Enum, slideUrl) {
            return slideUrl.setSlideUrl(Enum.my.my);
          }]

        }
      });

      $routeProvider.when('/my/notes', {
        controller : 'MyPagesController',
        templateUrl : 'static/partials/myPages.html',
        resolve : {
          authenticationRequired : ['$rootScope',
          function($rootScope) {
            $rootScope.$broadcast('event:authenticationRequired');
          }],
          slideIndex : ['Enum', 'slideUrl',
          function(Enum, slideUrl) {
            return slideUrl.setSlideUrl(Enum.my.notes);
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
        controller : 'MyPagesController',
        templateUrl : 'static/partials/myPages.html',
        resolve : {
          authenticationRequired : ['$rootScope',
          function($rootScope) {
            $rootScope.$broadcast('event:authenticationRequired');
          }],
          slideIndex : ['Enum', 'slideUrl',
          function(Enum, slideUrl) {
            return slideUrl.setSlideUrl(Enum.my.tasks);
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

    angular.module('em.app').run(['$document', '$location', '$rootScope', 'location', 'slideUrl', 'userAuthenticate',
    function($document, $location, $rootScope, location, slideUrl, userAuthenticate) {

      $rootScope.pageAnimation = {
        enter : 'fade-show',
        hide : 'fade-hide'
      };

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
        $rootScope.pageAnimation = {
          enter : 'fade-show',
          hide : 'fade-hide'
        };
      });

      // $rootScope.$on('event:slideIndexChanged', function() {
      //
      // var asd = slideUrl.getSlideUrl();
      //
      // switch(asd) {
      // case 0:
      // if ($location.path() !== '/my/notes') {
      // location.skipReload().path('/my/notes');
      // }
      // break;
      // case 1:
      // if ($location.path() !== '/my') {
      // location.skipReload().path('/my');
      // }
      // break;
      // case 2:
      // if ($location.path() !== '/my/tasks') {
      // console.log('ads');
      // // location.skipReload().path('/my/tasks');
      // }
      // break;
      // default:
      // break;
      // }
      // });
    }]);
  }());
