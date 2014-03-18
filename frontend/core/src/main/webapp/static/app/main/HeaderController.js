/* global $ */
'use strict';

function HeaderController($q, $scope, $location, $document, $element, $rootScope, SwiperService, UserSessionService) {

  // Register callback to slide change which will update heading
  var featureSlideChangeCallback = function() {
    if(!$scope.$$phase) {
      $scope.$digest();
    }
  }
  SwiperService.registerSlideChangeCallback(featureSlideChangeCallback, $scope.feature, 'HeaderController');

  $scope.getLabelWidth = function() {
    if ($scope.currentWidth <= 568){
      // Mobile, leave 78 pixels on both sides
      return $scope.currentWidth - 156;
    }else{
      return 412;
    }
  }

  $scope.getCurrentHeading = function() {
    if ($scope.feature === 'inbox'){
      return 'inbox';
    }else{
      var activeSlide = SwiperService.getActiveSlidePath($scope.feature)
      if (activeSlide){
        if (activeSlide.endsWith('home')){
          if ($scope.feature === 'tasks'){
            return 'dates';
          }else if ($scope.feature === 'notes'){
            return 'recent';
          }
        }else{
          var lastSlashIndex = activeSlide.lastIndexOf('/')
          if (lastSlashIndex !== -1){
            return activeSlide.substring(lastSlashIndex+1);
          }
        }
      }
    }
  };

  $scope.addNew = function() {
    if ($scope.feature === 'inbox'){
      $location.path(UserSessionService.getOwnerPrefix() + '/items/new');
    }else if ($scope.feature === 'tasks'){
      $location.path(UserSessionService.getOwnerPrefix() + '/tasks/new');
    }else if ($scope.feature === 'notes'){
      $location.path(UserSessionService.getOwnerPrefix() + '/notes/new');
    }
  }

}

HeaderController['$inject'] = [
'$q', '$scope', '$location', '$document', '$element', '$rootScope', 'SwiperService', 'UserSessionService'];
angular.module('em.app').controller('HeaderController', HeaderController);
