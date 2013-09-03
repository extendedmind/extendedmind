/*global angular*/

( function() {'use strict';

    angular.module('em.app').controller('PageNotFoundController', ['$scope', 'errorHandler',
    function($scope, errorHandler) {

      $scope.errorHandler = errorHandler;

    }]);
  }());
