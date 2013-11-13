/*global angular */
/*jslint white: true */

( function() {'use strict';

  function OmniBarController($scope, itemsRequest) {

    $scope.addNewItem = function(item) {
      $scope.newItem = {};
      itemsRequest.putItem(item);
    };
  }

  OmniBarController.$inject = ['$scope', 'itemsRequest'];
  angular.module('em.app').controller('OmniBarController', OmniBarController);
}());
