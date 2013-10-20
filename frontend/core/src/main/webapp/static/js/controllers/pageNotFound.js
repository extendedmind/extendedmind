/*global angular*/

( function() {'use strict';

    function PageNotFoundController($scope, errorHandler, userPrefix) {

      $scope.errorHandler = errorHandler;
      $scope.prefix = userPrefix.getPrefix();

    }


    PageNotFoundController.$inject = ['$scope', 'errorHandler', 'userPrefix'];
    angular.module('em.app').controller('PageNotFoundController', PageNotFoundController);
  }());
