/*jslint white: true */
'use strict';

function SignupController($location, $scope, $routeParams, authenticateRequest, errorHandler, httpRequest, itemsRequest, userSession) {

  $scope.user = {};
  var inviteResponseCode = $routeParams.hex_code;

  $scope.errorHandler = errorHandler;

  httpRequest.get('/api/invite/' + inviteResponseCode + '?email=' + $routeParams.email).then(function(inviteResponse) {
    if (inviteResponse.data.accepted) {
      $location.path('/login');
    } else {
      $scope.user.email = inviteResponse.data.email;
    }
  });

  function userLogin() {

    userSession.setCredentials($scope.user.email, $scope.user.password);

    authenticateRequest.login().then(function(authenticateResponse) {
      userSession.setUserSessionData(authenticateResponse);
      itemsRequest.getItems();
      $location.path('/my');
    }, function(authenticateResponse) {
      $scope.errorHandler.errorMessage = authenticateResponse.data;
    });
  }

  $scope.signUp = function() {
    httpRequest.post('/api/invite/' + inviteResponseCode + '/accept', {email: $scope.user.email, password: $scope.user.password}).then(function() {
      userLogin();
    });
  };
}

SignupController.$inject = ['$location', '$scope', '$routeParams', 'authenticateRequest', 'errorHandler', 'httpRequest', 'itemsRequest', 'userSession'];
angular.module('em.app').controller('SignupController', SignupController);
