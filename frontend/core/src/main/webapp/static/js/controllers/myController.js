/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('MyController', ['$scope', 'errorService', 'itemFactory', 'itemsFactory', 'userItemsFactory',
    function($scope, errorService, itemFactory, itemsFactory, userItemsFactory) {

      $scope.errorService = errorService;

      userItemsFactory.getItems(function() {
        $scope.items = itemsFactory.getUserItems();
        $scope.notes = itemsFactory.getUserNotes();
        $scope.tasks = itemsFactory.getUserTasks();
        $scope.newItems = itemsFactory.getUserNewItems();
      }, function(error) {
      });

      $scope.putItem = function() {
        itemFactory.putItem($scope.item, function() {
        }, function(error) {
        });
      };
    }]);
  }());
