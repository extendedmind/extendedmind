'use strict';

function HeaderController($scope, $location, UISessionService) {

  $scope.getLabelWidth = function() {
    if ($scope.currentWidth <= 568){
      // Mobile, leave 78 pixels on both sides
      return $scope.currentWidth - 156;
    } else {
      return 412;
    }
  };

  $scope.addNew = function() {
    if ($scope.isFeatureActive('inbox')) {
      UISessionService.changeFeature({name: 'itemEdit'});
    } else if ($scope.isFeatureActive('tasks')) {
      UISessionService.changeFeature({name: 'taskEdit'});
    } else if ($scope.isFeatureActive('notes')) {
      UISessionService.changeFeature({name: 'noteEdit'});
    }
  };
}

HeaderController['$inject'] = ['$scope', '$location', 'UISessionService'];
angular.module('em.app').controller('HeaderController', HeaderController);
