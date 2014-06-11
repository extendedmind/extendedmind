'use strict';

function MenuController($location, $scope, AuthenticationService, UISessionService, UserSessionService, AnalyticsService) {

  $scope.isAdmin = function isAdmin() {
    return UserSessionService.getUserType() === 0;
  };

  $scope.getActiveOwnerName = function(){
    var activeUUID = UISessionService.getActiveUUID();
    var ownerName;
    if (activeUUID === UserSessionService.getUserUUID()){
      ownerName = UserSessionService.getEmail();
    }else{
      angular.forEach($scope.collectives, function(collective, uuid){
        if (activeUUID === uuid){
          ownerName = collective[0];
        }
      })
    }
    var maximumOwnerNameLength = 22;
    if (ownerName.length > maximumOwnerNameLength){
      return ownerName.substring(0, maximumOwnerNameLength) + '...';
    }
    return ownerName;
  }

  $scope.getFeatureClass = function getFeatureClass(feature) {
    if (UISessionService.getCurrentFeatureName() === feature) {
      return 'active';
    }
  };

  $scope.gotoFeature = function gotoFeature(feature) {
    if (UISessionService.getCurrentFeatureName() !== feature) {
      var state = UISessionService.getFeatureState(feature);
      if (!state && feature === 'notes'){
        state = 'notes/home';
      }
      UISessionService.changeFeature(feature, undefined, state);
      AnalyticsService.visit(feature);
    }
    $scope.toggleMenu();
  };
}

MenuController.$inject = ['$location', '$scope', 'AuthenticationService', 'UISessionService', 'UserSessionService', 'AnalyticsService'];
angular.module('em.app').controller('MenuController', MenuController);
