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
      $location.path(UISessionService.getOwnerPrefix() + '/items/new');
    } else if ($scope.isFeatureActive('tasks')) {
      $location.path(UISessionService.getOwnerPrefix() + '/tasks/new');
    } else if ($scope.isFeatureActive('notes')) {
      $location.path(UISessionService.getOwnerPrefix() + '/notes/new');
    }
  };
}

HeaderController['$inject'] = ['$scope', '$location', 'UISessionService'];
angular.module('em.app').controller('HeaderController', HeaderController);
