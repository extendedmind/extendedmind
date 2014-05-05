'use strict';

function HeaderController($scope, $location, UserSessionService) {

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
      $location.path(UserSessionService.getOwnerPrefix() + '/items/new');
    } else if ($scope.isFeatureActive('tasks')) {
      $location.path(UserSessionService.getOwnerPrefix() + '/tasks/new');
    } else if ($scope.isFeatureActive('notes')) {
      $location.path(UserSessionService.getOwnerPrefix() + '/notes/new');
    }
  };
}

HeaderController['$inject'] = ['$scope', '$location', 'UserSessionService'];
angular.module('em.app').controller('HeaderController', HeaderController);
