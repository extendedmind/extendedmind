/*global angular*/
/*jslint plusplus: true*/

( function() {'use strict';

    angular.module('em.app').controller('MyTasksController', ['$location', '$rootScope', '$scope', 'Enum', 'errorHandler', 'itemsArray', 'itemsRequest', 'location', 'notesArray', 'slideIndex', 'tagsArray', 'tasksArray',
    function($location, $rootScope, $scope, Enum, errorHandler, itemsArray, itemsRequest, location, notesArray, slideIndex, tagsArray, tasksArray) {

      itemsRequest.getItems(function(itemsResponse) {

        itemsArray.setItems(itemsResponse.items);
        notesArray.setNotes(itemsResponse.notes);
        tagsArray.setTags(itemsResponse.tags);
        tasksArray.setTasks(itemsResponse.tasks);

      }, function(error) {
      });

      $scope.errorHandler = errorHandler;
      
      $scope.slide = slideIndex;

      $rootScope.$on('event:slideIndexChanged', function() {
        switch($scope.slide) {
          case Enum.my.my:
            if ($location.path() !== '/my') {
              location.skipReload().path('/my');
            }
            break;
          case Enum.my.tasks:
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
