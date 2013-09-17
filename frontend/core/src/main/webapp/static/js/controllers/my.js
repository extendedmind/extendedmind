/*global angular*/
/*jslint plusplus: true*/

( function() {'use strict';

    angular.module('em.app').controller('MyController', ['$location', '$rootScope', '$scope', 'activeItem', 'errorHandler', 'itemsArray', 'itemsRequest', 'itemsResponse', 'location', 'locationHandler', 'notesArray', 'pageTitle', 'slideIndex', 'tagsArray', 'tasksArray',
    function($location, $rootScope, $scope, activeItem, errorHandler, itemsArray, itemsRequest, itemsResponse, location, locationHandler, notesArray, pageTitle, slideIndex, tagsArray, tasksArray) {

      $scope.slide = slideIndex;
      $scope.$watch('slide', function(newValue) {
        switch(newValue) {
          case 0:
            if ($location.path() !== '/my/notes') {
              location.skipReload().path('/my/notes');
            }
            break;
          case 1:
            if ($location.path() !== '/my') {
              location.skipReload().path('/my');
            }
            break;
          case 2:
            if ($location.path() !== '/my/tasks') {
              location.skipReload().path('/my/tasks');
            }
            break;
          default:
            break;
        }
      });

      $scope.errorHandler = errorHandler;
      $rootScope.pageTitle = 'my';
      $rootScope.subtitle = null;
      activeItem.setItem(null);

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
    }]);
  }());
