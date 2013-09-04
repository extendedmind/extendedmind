/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('ContextController', ['$scope', '$routeParams', 'errorHandler', 'itemsArray', 'itemsRequest', 'tagsArray',
    function($scope, $routeParams, errorHandler, itemsArray, itemsRequest, tagsArray) {

      $scope.errorHandler = errorHandler;
      $scope.contextUuid = $routeParams.contextUuid;

      itemsRequest.getItems(function(itemsResponse) {
        itemsArray.setItems(itemsResponse.items);
        tagsArray.setTags(itemsResponse.tags);

        $scope.context = itemsArray.getItemByUuid(tagsArray.getTags(), $scope.contextUuid);

      }, function(error) {
      });

    }]);
  }());
