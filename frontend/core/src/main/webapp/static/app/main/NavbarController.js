/*jshint sub:true*/
'use strict';

function NavbarController($location, $scope, $window, AuthenticationService, SwiperService, OwnerService, UserSessionService) {

  // TODO: Use these to build * * * * * subnavigation on top of iconś
  var tasksSubNavigationPaths = ['tasks/dates', 'tasks/menu', 'tasks/lists', 'tasks/single'];
  var notesSubNavigationPaths = ['notes/recent', 'notes/menu', 'notes/lists'];


  $scope.user = UserSessionService.getUserUUID();
  $scope.collectives = UserSessionService.getCollectives();
  $scope.prefix = OwnerService.getPrefix();

  // Register a callback to swiper service
  SwiperService.registerSlideChangeCallback(slideChangeCallback, 'tasks', 'NavbarController');
  SwiperService.registerSlideChangeCallback(slideChangeCallback, 'notes', 'NavbarController');
  function slideChangeCallback(activeSlidePath){
    // Run digest to change only navbar when swiping to new location
    $scope.$digest();
  }

  $scope.isActiveSlide = function(pathFragment) {
    if ($location.path().indexOf($scope.feature != -1)){
      var activeSlide = SwiperService.getActiveSlidePath($scope.feature);
      if (activeSlide && (activeSlide.indexOf(pathFragment) != -1)){
        return true;
      }
    }
  };

  $scope.getFeatureClasses = function(feature) {
    var classes = '', i;
    var activeSlide = SwiperService.getActiveSlidePath($scope.feature);
    if (activeSlide && feature === $scope.feature){
      classes += 'active-feature';
      if ($scope.feature === 'tasks'){
        for (i = 0; i < tasksSubNavigationPaths.length; i++) {
          if (tasksSubNavigationPaths[i] === activeSlide){
            classes += ' active-slide-parent';
            break;
          }
        }
      }else if ($scope.feature === 'notes'){
        for (i = 0; i < notesSubNavigationPaths.length; i++) {
          if (notesSubNavigationPaths[i] === activeSlide){
            classes += ' active-slide-parent';
            break;
          }
        }
      }
    }
    return classes;
  };
}

NavbarController['$inject'] = ['$location', '$scope', '$window', 'AuthenticationService', 'SwiperService','OwnerService', 'UserSessionService'];
angular.module('em.app').controller('NavbarController', NavbarController);
