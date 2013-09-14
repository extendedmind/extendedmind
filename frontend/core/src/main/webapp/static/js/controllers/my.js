/*global angular*/
/*jslint plusplus: true*/

( function() {'use strict';

    angular.module('em.app').controller('MyController', ['$location', '$rootScope', '$scope', 'activeItem', 'errorHandler', 'itemsArray', 'itemsRequest', 'itemsResponse', 'locationHandler', 'notesArray', 'pageTitle', 'tagsArray', 'tasksArray',
    function($location, $rootScope, $scope, activeItem, errorHandler, itemsArray, itemsRequest, itemsResponse, locationHandler, notesArray, pageTitle, tagsArray, tasksArray) {

      $scope.errorHandler = errorHandler;
      $rootScope.pageAnimation = null;
      $rootScope.pageTitle = 'my';
      $rootScope.subtitle = null;

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

      $scope.swipeLeft = function() {
        $rootScope.pageAnimation = {
          enter : 'em-animate-enter-right',
          leave : 'em-animate-leave-left'
        };
        $location.path('/my/tasks');
      };

      $scope.swipeRight = function() {
        $rootScope.pageAnimation = {
          enter : 'em-animate-enter-left',
          leave : 'em-animate-leave-right'
        };
        $location.path('/my/notes');
      };
    }]);
  }());
