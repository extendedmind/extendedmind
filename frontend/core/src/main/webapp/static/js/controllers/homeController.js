"use strict";

emControllers.controller('HomeController', ['$scope', 'Item', 'UserAuthenticate',
function($scope, Item, UserAuthenticate) {
  var loggedUser = UserAuthenticate.getUser();
  Item.getUserItems(loggedUser.userUUID, function(itemsResponse) {
    $scope.items = itemsResponse;
  });

  $scope.putItem = function() {
    Item.putItem($scope.itemTitle, function(result) {
    }, function(error) {
    });
  };
}]);
