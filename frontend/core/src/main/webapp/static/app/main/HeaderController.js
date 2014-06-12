'use strict';

function HeaderController($scope, $rootScope, UISessionService) {

  var featureChangedCallback = function featureChangedCallback(name, data/*, state*/){
    if (name === 'list'){
      if (data){
        var maximumHeadingLength = 30;
        if (data.title.length > maximumHeadingLength){
          $scope.overrideHeading = data.title.substring(0, maximumHeadingLength-2) + '...';
        }else{
          $scope.overrideHeading = data.title;
        }
      }
    }else{
      $scope.overrideHeading = undefined;
    }
  };
  UISessionService.registerFeatureChangedCallback(featureChangedCallback, 'HeaderController');

  $scope.getCurrentHeading = function getCurrentHeading() {
    var currentHeading;
    if ($scope.overrideHeading){
      currentHeading = $scope.overrideHeading;
    }else{
      currentHeading = $scope.getActiveFeature();
    }
    if (!$scope.online) {
      currentHeading += '*';
    }
    return currentHeading;
  }

  $scope.getHeadingClass = function getHeadingClass() {
    if ($scope.overrideHeading){
      if ($scope.overrideHeading.length > 9 && $scope.overrideHeading.length <= 15) {
        return 'medium-heading';
      }else if ($scope.overrideHeading.length > 15){
        return 'long-heading';
      }
    }
  }

  $scope.switchFeature = function(){
    var activeFeature = $scope.getActiveFeature();
    if (activeFeature === 'inbox'){
      UISessionService.changeFeature('tasks');
    }else if (activeFeature === 'tasks'){
      UISessionService.changeFeature('notes');
    }else if (activeFeature === 'notes'){
      UISessionService.changeFeature('lists');
    }else if (activeFeature === 'lists'){
      UISessionService.changeFeature('archive');
    }else if (activeFeature === 'archive'){
      UISessionService.changeFeature('inbox');
    }
  };
}
HeaderController['$inject'] = ['$scope', '$rootScope', 'UISessionService'];
angular.module('em.app').controller('HeaderController', HeaderController);
