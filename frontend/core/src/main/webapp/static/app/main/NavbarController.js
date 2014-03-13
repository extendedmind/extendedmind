'use strict';

function NavbarController($location, $scope, SwiperService, UserSessionService) {

  var tasksNavigationPaths = ['tasks/dates', 'tasks/menu', 'tasks/lists'];
  var notesNavigationPaths = ['notes/recent', 'notes/menu', 'notes/lists'];

  $scope.user = UserSessionService.getUserUUID();
  $scope.collectives = UserSessionService.getCollectives();
  $scope.ownerPrefix = UserSessionService.getOwnerPrefix();

  // Register a callback to swiper service
  SwiperService.registerSlideChangeCallback(slideChangeCallback, 'tasks', 'NavbarController');
  SwiperService.registerSlideChangeCallback(slideChangeCallback, 'notes', 'NavbarController');
  function slideChangeCallback(activeSlidePath){
    // Run digest to change only navbar when swiping to new location
    $scope.$digest();
  }

  $scope.isActiveSlide = function(pathFragment) {    
    var activeSlide = SwiperService.getActiveSlidePath($scope.feature);
    if (activeSlide && (activeSlide.indexOf(pathFragment) != -1)){
      return true;
    }
  };

  $scope.getFeatureClasses = function(feature) {
    var classes = '', i;
    var activeSlide = SwiperService.getActiveSlidePath($scope.feature);
    if (activeSlide && feature === $scope.feature){
      classes += 'active-feature';
      if ($scope.feature === 'tasks'){
        for (i = 0; i < tasksNavigationPaths.length; i++) {
          if (tasksNavigationPaths[i] === activeSlide){
            classes += ' active-slide-parent';
            break;
          }
        }
      }else if ($scope.feature === 'notes'){
        for (i = 0; i < notesNavigationPaths.length; i++) {
          if (notesNavigationPaths[i] === activeSlide){
            classes += ' active-slide-parent';
            break;
          }
        }
      }
    }
    return classes;
  };
}

NavbarController.$inject = ['$location', '$scope', 'SwiperService', 'UserSessionService'];
angular.module('em.app').controller('NavbarController', NavbarController);
