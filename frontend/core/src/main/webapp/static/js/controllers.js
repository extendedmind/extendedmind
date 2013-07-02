"use strict";

var emControllers = angular.module('em.controllers', ['em.userAuthenticate']);

emControllers.controller('LoginController', ['$scope', 'UserAuthenticate',
function($scope, UserAuthenticate) {
  $scope.user = {
    "email" : 'timo@ext.md'
  };
  $scope.userLogin = function() {
    UserAuthenticate.userLogin($scope.user, function(res) {
      $scope.authResponse = res;
    }, function(err) {
      $scope.authResponse = err;
    });
  };
}]);

emControllers.controller('MainController', ['$scope',
function($scope) {

}]);

emControllers.controller('HomeController', ['$scope',
function($scope) {
  $scope.addNewItem = function() {
    console.log($scope.item);
  };
}]);
