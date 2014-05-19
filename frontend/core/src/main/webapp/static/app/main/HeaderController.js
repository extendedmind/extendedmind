'use strict';

function HeaderController($scope, UISessionService, SwiperService) {

  // SWIPER SERVICE HOOKS

  SwiperService.registerSlideChangeCallback(slideChangedCallback, 'tasks', 'HeaderController');
  SwiperService.registerSlideChangeCallback(slideChangedCallback, 'notes', 'HeaderController');
  UISessionService.registerFeatureChangedCallback(featureChangedCallback, 'HeaderController');

  var currentHeading = 'timeline';

  function featureChangedCallback(name, data, state){
    // Controllers set as state the new main slide path. This is needed because
    // SwiperService returns the old slide at this point
    setPageHeading(state);
  }

  function slideChangedCallback(/*activeSlidePath*/){
    setPageHeading();
  }

  // Register callback to active feature or slide change which will update heading
  function setPageHeading(overrideActiveSlide) {
    if ($scope.isFeatureActive('inbox')) {
      currentHeading = 'inbox';
    } else {
      var activeSlide = SwiperService.getActiveSlidePath($scope.getActiveFeature());

      if (overrideActiveSlide && (activeSlide !== overrideActiveSlide)){
        activeSlide = overrideActiveSlide;
      }

      if (!activeSlide) {
        if ($scope.isFeatureActive('tasks')) {
          currentHeading = 'timeline';
        } else if ($scope.isFeatureActive('notes')) {
          currentHeading = 'unsorted';
        }
      } else {
        if (activeSlide.endsWith('home')) {
          if ($scope.isFeatureActive('tasks')) {
            currentHeading = 'timeline';
          } else if ($scope.isFeatureActive('notes')) {
            currentHeading = 'unsorted';
          }
        } else if (activeSlide.endsWith('details')) {
          currentHeading = $scope.getActiveFeature();
        } else {
          var lastSlashIndex = activeSlide.lastIndexOf('/');
          if (lastSlashIndex !== -1) {
            currentHeading = activeSlide.substring(lastSlashIndex + 1);
          }
        }
      }
    }
    if (!$scope.$$phase) {
      $scope.$digest();
    }
  }
  $scope.getCurrentHeading = function(){
    return currentHeading;
  }

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
      UISessionService.changeFeature('itemEdit');
    } else if ($scope.isFeatureActive('tasks')) {
      UISessionService.changeFeature('taskEdit');
    } else if ($scope.isFeatureActive('notes')) {
      UISessionService.changeFeature('noteEdit');
    }
  };
}

HeaderController['$inject'] = ['$scope', 'UISessionService', 'SwiperService'];
angular.module('em.app').controller('HeaderController', HeaderController);
