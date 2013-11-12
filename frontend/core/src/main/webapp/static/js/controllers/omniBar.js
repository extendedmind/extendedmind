/*global angular */
/*jslint white: true */

( function() {'use strict';

  function OmniBarController($scope, itemsArray, itemsRequest, itemsResponse) {

    $scope.addNewItem = function() {

      itemsRequest.putItem($scope.newItem).then(function(putItemResponse) {

        itemsResponse.putItemContent($scope.newItem, putItemResponse);
        itemsArray.putNewItem($scope.newItem);
        $scope.newItem = {};
      });
    };
  }

  OmniBarController.$inject = ['$scope', 'itemsArray', 'itemsRequest', 'itemsResponse'];
  angular.module('em.app').controller('OmniBarController', OmniBarController);
}());
