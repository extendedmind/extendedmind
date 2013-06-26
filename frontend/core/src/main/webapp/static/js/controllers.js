"use strict";

var emControllers = angular.module('controllers', ['auth']);

emControllers.controller('LoginCtrl', ['$scope', 'Auth',
function($scope, Auth) {
  $scope.userLogin = function() {
    Auth.userLogin($scope.user, function(res) {
      $scope.authResponse = res;
    }, function(err) {
      $scope.authResponse = err;
    });
  };
}]);

emControllers.controller('MainCtrl', ['$scope',
function($scope) {

}]);

emControllers.controller('HomeCtrl', ['$scope',
function($scope) {

}]);
