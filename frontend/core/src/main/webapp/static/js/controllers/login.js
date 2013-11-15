/*jslint white: true */
'use strict';

function LoginController($location, $scope, authenticateRequest, errorHandler, itemsRequest, userSession) {

  $scope.errorHandler = errorHandler;

  $scope.userLogin = function() {

    userSession.setCredentials($scope.user.username, $scope.user.password);

    if ($scope.user.remember) {
      userSession.setUserRemembered($scope.user.remember);
    }
    authenticateRequest.login().then(function(authenticateResponse) {
      userSession.setUserSessionData(authenticateResponse);
      itemsRequest.getItems();
      $location.path('/my');
    }, function(authenticateResponse){
      $scope.errorHandler.errorMessage = authenticateResponse.data;
    });
  };
}

LoginController.$inject = ['$location', '$scope', 'authenticateRequest', 'errorHandler', 'itemsRequest', 'userSession'];
angular.module('em.app').controller('LoginController', LoginController);
