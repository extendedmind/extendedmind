'use strict';

function HeaderController($scope, UISessionService, SwiperService) {

  // SWIPER SERVICE HOOKS

  SwiperService.registerSlideChangeCallback(setPageHeading, 'tasks', 'HeaderController');
  SwiperService.registerSlideChangeCallback(setPageHeading, 'notes', 'HeaderController');
  UISessionService.registerFeatureChangedCallback(setPageHeading, 'HeaderController');

  // Register callback to active feature or slide change which will update heading
  function setPageHeading() {
    if ($scope.isFeatureActive('inbox')) {
      $scope.currentHeading = 'inbox';
    } else {
      var activeSlide = SwiperService.getActiveSlidePath($scope.getActiveFeature());
      if (!activeSlide) {
        if ($scope.isFeatureActive('tasks')) {
          $scope.currentHeading = 'dates';
        } else if ($scope.isFeatureActive('notes')) {
          $scope.currentHeading = 'unsorted';
        }
      } else {
        if (activeSlide.endsWith('home')) {
          if ($scope.isFeatureActive('tasks')) {
            $scope.currentHeading = 'dates';
          } else if ($scope.isFeatureActive('notes')) {
            $scope.currentHeading = 'unsorted';
          }
        } else if (activeSlide.endsWith('details')) {
          $scope.currentHeading = $scope.getActiveFeature();
        } else {
          var lastSlashIndex = activeSlide.lastIndexOf('/');
          if (lastSlashIndex !== -1) {
            $scope.currentHeading = activeSlide.substring(lastSlashIndex + 1);
          }
        }
      }
    }
    if (!$scope.$$phase) {
      $scope.$digest();
    }
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
      UISessionService.changeFeature({name: 'itemEdit'});
    } else if ($scope.isFeatureActive('tasks')) {
      UISessionService.changeFeature({name: 'taskEdit'});
    } else if ($scope.isFeatureActive('notes')) {
      UISessionService.changeFeature({name: 'noteEdit'});
    }
  };
}

HeaderController['$inject'] = ['$scope', 'UISessionService', 'SwiperService'];
angular.module('em.app').controller('HeaderController', HeaderController);
