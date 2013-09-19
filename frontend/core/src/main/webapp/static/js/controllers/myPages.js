/*global angular*/
/*jslint plusplus: true*/

( function() {'use strict';

    angular.module('em.app').controller('MyPagesController', ['$location', '$rootScope', '$scope', 'errorHandler', 'itemsArray', 'itemsRequest', 'location', 'notesArray', 'slideUrl', 'tagsArray', 'tasksArray',
    function($location, $rootScope, $scope, errorHandler, itemsArray, itemsRequest, location, notesArray, slideUrl, tagsArray, tasksArray) {

      $scope.errorHandler = errorHandler;

      itemsRequest.getItems(function(itemsResponse) {

        itemsArray.setItems(itemsResponse.items);
        notesArray.setNotes(itemsResponse.notes);
        tagsArray.setTags(itemsResponse.tags);
        tasksArray.setTasks(itemsResponse.tasks);

      }, function(error) {
      });

      $scope.slide = slideUrl.getSlideUrl();
      // console.log($scope.slide);
      // slideUrl.setSlideUrl($scope.slide);

      $scope.$watch('slide', function(newValue) {
        slideUrl.setSlideUrl(newValue);
        // switch(newValue) {
        // case 0:
        // if ($location.path() !== '/my/notes') {
        // location.skipReload().path('/my/notes');
        // }
        // break;
        // case 1:
        // if ($location.path() !== '/my') {
        // location.skipReload().path('/my');
        // }
        // break;
        // case 2:
        // if ($location.path() !== '/my/tasks') {
        // location.skipReload().path('/my/tasks');
        // }
        // break;
        // default:
        // break;
        // }
      });

      $rootScope.$on('event:slideIndexChanged', function() {
        console.log($scope.slide);
        console.log(slideUrl.getSlideUrl());
        //
        // var asd = slideUrl.getSlideUrl();
        //
        switch($scope.slide) {
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
