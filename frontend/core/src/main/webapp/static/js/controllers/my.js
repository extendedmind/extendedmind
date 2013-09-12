/*global angular*/
/*jslint plusplus: true*/

( function() {'use strict';

    angular.module('em.app').controller('MyController', ['$location', '$rootScope', '$scope', 'activeItem', 'errorHandler', 'itemsArray', 'itemsRequest', 'itemsResponse', 'locationHandler', 'notesArray', 'pageTitle', 'tagsArray', 'tasksArray',
    function($location, $rootScope, $scope, activeItem, errorHandler, itemsArray, itemsRequest, itemsResponse, locationHandler, notesArray, pageTitle, tagsArray, tasksArray) {

      $scope.errorHandler = errorHandler;
      $rootScope.pageAnimation = null;
      $scope.pageIndex = 0;

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
        if ($scope.pageIndex < 2) {
          $scope.pageIndex++;
        } else {
          $scope.pageIndex = 0;
        }
        $scope.template = $scope.templates[$scope.pageIndex];
        $rootScope.subtitle = $scope.template.name;
      };

      $scope.swipeRight = function() {
        $rootScope.pageAnimation = {
          enter : 'em-page-enter-left',
          leave : 'em-page-leave-right'
        };
        if ($scope.pageIndex > 0) {
          $scope.pageIndex--;
        } else {
          $scope.pageIndex = 2;
        }
        $scope.template = $scope.templates[$scope.pageIndex];
        $rootScope.subtitle = $scope.template.name;
      };

      $scope.templates = [{
        name : 'my',
        url : 'static/partials/myMy.html'
      }, {
        name : 'tasks',
        url : 'static/partials/my/tasks.html'
      }, {
        name : 'notes',
        url : 'static/partials/my/notes.html'
      }];
      $scope.template = $scope.templates[$scope.pageIndex];
      $rootScope.subtitle = $scope.template.name;
    }]);
  }());
