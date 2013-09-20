/*global angular*/
/*jslint plusplus: true*/

( function() {'use strict';

    angular.module('em.app').controller('MyPagesController', ['$location', '$scope', 'errorHandler', 'itemsArray', 'itemsRequest', 'location', 'notesArray', 'slideIndex', 'tagsArray', 'tasksArray',
    function($location, $scope, errorHandler, itemsArray, itemsRequest, location, notesArray, slideIndex, tagsArray, tasksArray) {

      $scope.errorHandler = errorHandler;

      itemsRequest.getItems(function(itemsResponse) {

        itemsArray.setItems(itemsResponse.items);
        notesArray.setNotes(itemsResponse.notes);
        tagsArray.setTags(itemsResponse.tags);
        tasksArray.setTasks(itemsResponse.tasks);

      }, function(error) {
      });
      
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

    }]);
  }());
