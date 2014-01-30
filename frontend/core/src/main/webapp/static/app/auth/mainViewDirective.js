'use strict';

function mainView() {
  return {
    restrict: 'A',
    replace: 'true',
    templateUrl: 'static/app/auth/main.html',
    link: function($scope) {
      $scope.showFailureModal = false;
      $scope.showTipModal = false;

      // TODO: Add functions to change scope values 
    }
  };
}
angular.module('em.directives').directive('mainView', mainView);
