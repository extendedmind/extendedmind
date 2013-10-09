/*global angular*/

( function() {'use strict';

    function PageNotFoundController($scope, errorHandler) {

      $scope.errorHandler = errorHandler;

    }


    PageNotFoundController.$inject = ['$scope', 'errorHandler'];
    angular.module('em.app').controller('PageNotFoundController', PageNotFoundController);
  }());
