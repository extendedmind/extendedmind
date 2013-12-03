/*jslint white: true */
'use strict';

function PageNotFoundController($location, $scope, analytics, errorHandler, userPrefix) {

  $scope.errorHandler = errorHandler;
  $scope.prefix = userPrefix.getPrefix();

  var data = {
    host: $location.host().toString(),
    port: $location.port().toString(),
    path: $location.path().toString()
  };
  analytics.multitag('Page Not Found',data);
}

PageNotFoundController.$inject = ['$location', '$scope', 'analytics', 'errorHandler', 'userPrefix'];
angular.module('em.app').controller('PageNotFoundController', PageNotFoundController);
