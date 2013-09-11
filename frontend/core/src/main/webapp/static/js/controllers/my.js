/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('MyController', ['$location', '$rootScope', '$scope', 'activeItem', 'errorHandler', 'itemsArray', 'itemsRequest', 'itemsResponse','locationHandler', 'notesArray', 'tagsArray', 'tasksArray',
    function($location, $rootScope, $scope, activeItem, errorHandler, itemsArray, itemsRequest, itemsResponse, locationHandler,notesArray, tagsArray, tasksArray) {

      $scope.errorHandler = errorHandler;
      $rootScope.pageAnimation = null;
      
      locationHandler.setPreviousLocation('/my/tasks');
      locationHandler.setNextLocation('/my/notes');

      itemsRequest.getItems(function(itemsResponse) {

        itemsArray.setItems(itemsResponse.items);
        notesArray.setNotes(itemsResponse.notes);
        tagsArray.setTags(itemsResponse.tags);
        tasksArray.setTasks(itemsResponse.tasks);

        $scope.items = itemsArray.getItems();
        $scope.notes = notesArray.getNotes();
        $scope.tags = tagsArray.getTags();
        $scope.tasks = tasksArray.getTasks();

      }, function(error) {
      });

      $scope.addNewItem = function() {

        itemsRequest.putItem($scope.newItem, function(putItemResponse) {
          itemsResponse.putItemContent($scope.newItem, putItemResponse);
          itemsArray.putNewItem($scope.newItem);
          $scope.newItem = {};

        }, function(error) {
        });
      };

      $scope.setActiveItem = function(item) {
        activeItem.setItem(item);
      };

      $scope.swipeLeft = function(asd) {
        $rootScope.pageAnimation = {
          enter : 'em-page-enter-right',
          leave : 'em-page-leave-left'
        };
        $location.path('/my/tasks');
      };

      $scope.swipeRight = function() {
        $rootScope.pageAnimation = {
          enter : 'em-page-enter-left',
          leave : 'em-page-leave-right'
        };
        $location.path('/my/notes');
      };
    }]);
  }());
