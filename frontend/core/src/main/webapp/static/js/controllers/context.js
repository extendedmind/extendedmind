/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('ContextController', ['$scope', '$routeParams', 'activeItem', 'errorHandler', 'itemsArray', 'itemsRequest', 'tagsArray',
    function($scope, $routeParams, activeItem, errorHandler, itemsArray, itemsRequest, tagsArray) {

      $scope.errorHandler = errorHandler;

      if (activeItem.getItem()) {
        $scope.context = activeItem.getItem();
      } else {
        itemsRequest.getItems(function(itemsResponse) {

          itemsArray.setItems(itemsResponse.items);
          tagsArray.setTags(itemsResponse.tags);

          $scope.context = itemsArray.getItemByUuid(tagsArray.getTags(), $routeParams.uuid);

        }, function(error) {
        });
      }

    }]);
  }());
