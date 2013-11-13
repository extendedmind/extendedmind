/*global angular */
/*jslint white: true */

( function() {'use strict';

  function TasksController($location, $rootScope, $scope, Enum, errorHandler, filterService, location, slideIndex, tagsArray, tasksArray, userPrefix) {

    $scope.slide = slideIndex;

    $scope.tags = tagsArray.getTags();
    $scope.tasks = tasksArray.getTasks();

    $scope.filterService = filterService;
    $scope.prefix = userPrefix.getPrefix();
    $scope.errorHandler = errorHandler;

    function changePath() {
      switch($scope.slide) {
        case Enum.my.my:
        if ($location.path() !== '/' + $scope.prefix) {
          location.skipReload().path('/' + $scope.prefix);
        }
        break;
        case Enum.my.tasks:
        if ($location.path() !== '/' + $scope.prefix + '/tasks') {
          location.skipReload().path('/' + $scope.prefix + '/tasks');
        }
        break;
        default:
        break;
      }
    }

    $rootScope.$on('event:slideIndexChanged', function() {
      changePath();
    });

    $scope.gotoHome = function() {
      $scope.slide = 0;
      changePath();
    };

    $scope.prevSlide = function() {
      $scope.slide--;
      changePath();
    };

    $scope.nextSlide = function() {
      $scope.slide++;
      changePath();
    };

    $scope.addNew = function() {
      $location.path(userPrefix.getPrefix() + '/tasks/new');
    };
  }

  TasksController.$inject = ['$location', '$rootScope', '$scope', 'Enum', 'errorHandler', 'filterService', 'location', 'slideIndex', 'tagsArray', 'tasksArray', 'userPrefix'];
  angular.module('em.app').controller('TasksController', TasksController);
}());
