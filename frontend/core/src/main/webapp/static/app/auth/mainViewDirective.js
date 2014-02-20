'use strict';

function mainViewDirective($rootScope) {
  return {
    restrict: 'A',
    replace: 'true',
    templateUrl: 'static/app/auth/main.html',
    controller: function($scope) {
      // Listen to exceptions emitted to rootscope
      var unbindEmException = $rootScope.$on('emException', function(exception) {
        // TODO: Use modals here
        console.log(exception);
      });

      // Clean up listening by executing the variable
      $scope.$on('$destroy', unbindEmException);
    }
  };
}
mainViewDirective['$inject'] = ['$rootScope'];
angular.module('em.directives').directive('mainView', mainViewDirective);
