"use strict";

var emControllers = angular.module('em.controllers', ['em.item', 'em.userAuthenticate']);

emControllers.controller('HomeController', ['$scope', 'Item',
function($scope, Item) {
  $scope.addNewItem = function() {
    Item.AddNewItem($scope.item, function(result) {
      $scope.newItem = $scope.item;
      $scope.toggle();
    }, function(error) {
    });
  };
}]);

emControllers.controller('LoginController', ['$scope', 'UserAuthenticate',
function($scope, UserAuthenticate) {
  $scope.user = {
    "email" : 'timo@ext.md'
  };
  $scope.userLogin = function() {
    UserAuthenticate.userLogin($scope.user, function(result) {
      $scope.authResponse = result;
    }, function(error) {
      $scope.authResponse = error;
    });
  };
}]);

emControllers.controller('MainController', ['$scope',
function($scope) {

}]);
