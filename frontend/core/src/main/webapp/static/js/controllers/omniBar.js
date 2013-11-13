/*global angular */
/*jslint white: true */

( function() {'use strict';

  function OmniBarController($scope, itemsRequest) {

    $scope.addNewItem = function(item) {
      // FIXME: refactor jQuery into directive!
      $('#omniItem').focus();
      $scope.newItem = {};
      $scope.focusOmnibar = true;
      itemsRequest.putItem(item);
    };
  }

  OmniBarController.$inject = ['$scope', 'itemsRequest'];
  angular.module('em.app').controller('OmniBarController', OmniBarController);
}());
