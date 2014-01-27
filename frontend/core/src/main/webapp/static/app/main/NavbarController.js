/*global angular */
'use strict';

function NavbarController($location, $scope, $window, AuthenticationService, SwiperService, OwnerService, UserSessionService) {

  // TODO: Use these to build * * * * * subnavigation on top of tasks icon
  var tasksSubNavigationPaths = ['tasks/dates', 'tasks/lists', 'tasks/projects', 'tasks/single'];

  $scope.user = UserSessionService.getUserUUID();
  $scope.collectives = UserSessionService.getCollectives();
  $scope.prefix = OwnerService.getPrefix();

  // Register a callback to swiper service
  SwiperService.registerSlideChangeCallback(slideChangeCallback, 'tasks', 'NavbarController');
  function slideChangeCallback(activeSlidePath){
    // Run digest to change only navbar when swiping to new location
    $scope.$digest();
  }

  $scope.isActiveSlide = function(pathFragment) {
    if ($location.path().indexOf("tasks" != -1)){
      var activeSlide = SwiperService.getActiveSlidePath("tasks");
      if (activeSlide && (activeSlide.indexOf(pathFragment) != -1)){
        return true;
      }
    }
  };

  $scope.getFeatureClasses = function(feature) {
    var classes = "";
    var activeSlide = SwiperService.getActiveSlidePath("tasks");
    if (activeSlide){
      classes += "active-feature";
      for (var i = 0; i < tasksSubNavigationPaths.length; i++) {
        if (tasksSubNavigationPaths[i] === activeSlide){
          classes += " active-slide-parent";
          break;
        }
      }
    }
    return classes;
  }
}

NavbarController.$inject = ['$location', '$scope', '$window', 'AuthenticationService', 'SwiperService','OwnerService', 'UserSessionService'];
angular.module('em.app').controller('NavbarController', NavbarController);
