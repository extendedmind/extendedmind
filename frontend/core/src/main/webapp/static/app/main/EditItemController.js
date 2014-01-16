/*global angular */
'use strict';

function EditItemController($scope, $routeParams, ErrorHandlerService, itemsArray, itemsRequest, OwnerService) {

  $scope.errorHandler = ErrorHandlerService;
  $scope.prefix = OwnerService.getPrefix();

  if ($routeParams.uuid) {
    var item = itemsArray.getItemByUUID(itemsArray.getItems(), $routeParams.uuid);
    if (item) {
      $scope.item = item;
    } else {
      $scope.item = {};
    }
  }

  $scope.editItem = function() {
    itemsRequest.putExistingItem($scope.item).then(function() {
      $scope.item = {};
    });
    window.history.back();
  };

  $scope.cancelEdit = function() {
    window.history.back();
  };
}

EditItemController.$inject = ['$scope', '$routeParams', 'ErrorHandlerService', 'itemsArray', 'itemsRequest', 'OwnerService'];
angular.module('em.app').controller('EditItemController', EditItemController);
