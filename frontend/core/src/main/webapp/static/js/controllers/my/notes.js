/*global angular */
/*jslint white: true */

( function() {'use strict';

  function NotesController($location, $rootScope, $scope, Enum, errorHandler, location, notesArray, slideIndex, userPrefix) {

    $scope.slide = slideIndex;

    $scope.notes = notesArray.getNotes();

    $scope.errorHandler = errorHandler;
    $scope.prefix = userPrefix.getPrefix();

    function changePath() {
      switch($scope.slide) {
        case Enum.my.my:
        if ($location.path() !== '/' + $scope.prefix) {
          location.skipReload().path('/' + $scope.prefix);
        }
        break;
        case Enum.my.notes:
        if ($location.path() !== '/' + $scope.prefix + '/notes') {
          location.skipReload().path('/' + $scope.prefix + '/notes');
        }
        break;
        default:
        break;
      }
    }

    $rootScope.$on('event:slideIndexChanged', function() {
      changePath();
    });

    $scope.addNew = function() {
      $location.path(userPrefix.getPrefix() + '/notes/new');
    };
  }


  NotesController.$inject = ['$location', '$rootScope', '$scope', 'Enum', 'errorHandler', 'location', 'notesArray', 'slideIndex', 'userPrefix'];
  angular.module('em.app').controller('NotesController', NotesController);
}());
