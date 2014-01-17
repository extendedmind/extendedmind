/*global angular */
'use strict';

function NavbarController($location, $scope, $window, AuthenticationService, SwiperService, TasksSlidesService, OwnerService, UserSessionService) {

  // TODO: Use these to build * * * * * subnavigation on top of tasks icon
  var tasksSubNavigationPaths = ['tasks/dates', 'tasks/lists', 'tasks/projects', 'tasks/single'];

  $scope.user = UserSessionService.getUserUUID();
  $scope.collectives = UserSessionService.getCollectives();
  $scope.prefix = OwnerService.getPrefix();

  // Register a callback to swiper service
  SwiperService.registerSlideChangeCallback(slideChangeCallback, 'tasks', 'navbar-tasks');
  function slideChangeCallback(activeSlidePath){
    // Run digest to change only navbar when swiping to new location
    $scope.$digest();
  }

  $scope.logout = function() {
    AuthenticationService.logout().then(function() {
      $location.path('/login');
    });
  };

  $scope.setCollectiveActive = function(uuid) {
    AuthenticationService.switchActiveUUID(uuid);
    $location.path('/collective/' + uuid + '/' + TasksSlidesService.HOME);
  };
  
  $scope.setMyActive = function() {
    AuthenticationService.switchActiveUUID(UserSessionService.getUserUUID());
    $location.path('/my/tasks/home');
  };
  
  $scope.addNew = function() {
    $location.path($scope.prefix + '/tasks/new');
  };

  $scope.gotoInbox = function() {
    if ($location.path().indexOf("/tasks/") != -1){
      SwiperService.swipeTo(TasksSlidesService.INBOX);
    }else{
      $location.path($scope.prefix + '/' + TasksSlidesService.INBOX);
    }
  };

  $scope.gotoHome = function() {
    if ($location.path().indexOf("/tasks/") != -1){
      SwiperService.swipeTo(TasksSlidesService.HOME);
    }else{
      $location.path($scope.prefix + '/' + TasksSlidesService.HOME);
    }
  };

  $scope.gotoTasks = function() {
    if ($location.path().indexOf("/tasks/") != -1){
      SwiperService.swipeTo(TasksSlidesService.DATES);
    }else{
      $location.path($scope.prefix + '/' + TasksSlidesService.DATES);
    }
  };

  $scope.useCollectives = function () {
    if (UserSessionService.getCollectives() && Object.keys(UserSessionService.getCollectives()).length > 1) {
      return true;
    }
  };

  $scope.goToProject = function(uuid) {
    SwiperService.swipeTo(TasksSlidesService.PROJECTS + '/' + uuid);
  };

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

NavbarController.$inject = ['$location', '$scope', '$window', 'AuthenticationService', 'SwiperService', 'TasksSlidesService', 'OwnerService', 'UserSessionService'];
angular.module('em.app').controller('NavbarController', NavbarController);
