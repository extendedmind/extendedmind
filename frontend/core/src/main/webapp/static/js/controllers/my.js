/*global angular*/
/*jslint plusplus: true*/

( function() {'use strict';

    angular.module('em.app').controller('MyController', ['$location', '$rootScope', '$scope', 'activeItem', 'errorHandler', 'itemsArray', 'itemsRequest', 'itemsResponse', 'location', 'locationHandler', 'notesArray', 'pageTitle', 'tagsArray', 'tasksArray',
    function($location, $rootScope, $scope, activeItem, errorHandler, itemsArray, itemsRequest, itemsResponse, location, locationHandler, notesArray, pageTitle, tagsArray, tasksArray) {

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
