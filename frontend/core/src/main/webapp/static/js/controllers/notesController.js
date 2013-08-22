/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('NotesController', ['$scope', 'itemsFactory',
    function($scope, itemsFactory) {
      $scope.filterArgument = 'NOTE';

      $scope.items = itemsFactory.getUserItems();
      $scope.newItems = itemsFactory.getUserNewItems();
    }]);
  }());
