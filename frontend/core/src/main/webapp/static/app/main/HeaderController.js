'use strict';

function HeaderController($scope, $rootScope, UISessionService) {

  $scope.getCurrentHeading = function getCurrentHeading() {
    var currentHeading = $scope.getActiveFeature();
    if (!$scope.online) {
      currentHeading += '*';
    }
    return currentHeading;
  }

  $scope.switchFeature = function(){
    var activeFeature = $scope.getActiveFeature();
    if (activeFeature === 'inbox'){
      UISessionService.changeFeature('tasks');
    }else if (activeFeature === 'tasks'){
      UISessionService.changeFeature('notes');
    }else if (activeFeature === 'notes'){
      UISessionService.changeFeature('archive');
    }else if (activeFeature === 'archive'){
      UISessionService.changeFeature('inbox');
    }
  };
}
HeaderController['$inject'] = ['$scope', '$rootScope', 'UISessionService'];
angular.module('em.app').controller('HeaderController', HeaderController);
