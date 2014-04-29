'use strict';

function AccountController($rootScope, $location, $scope, AccountService, AnalyticsService, UserSessionService) {

  $scope.isUserVerified = false;
  AnalyticsService.visit('account');

  $scope.settings = {};

  AccountService.getAccount().then(function(accountResponse) {
    $scope.isUserVerified = accountResponse.emailVerified ? true : false;
    $scope.email = accountResponse.email;
  });

  $scope.gotoChangePassword = function gotoChangePassword() {
    $location.path('/my/account/password');
  };

  $scope.gotoMainPage = function gotoMainPage() {
    $location.path('/my/tasks');
  };

  $scope.showOnboardingChecked = function() {
    if ($scope.settings.showOnboarding){
      var userPreferences = UserSessionService.getPreferences();
      delete userPreferences.onboarded;
      AccountService.putAccountPreferences(userPreferences);
    }else{
      UserSessionService.setPreferences('onboarded', $rootScope.packaging);
      AccountService.putAccountPreferences(UserSessionService.getPreferences());
    }
  }

  $scope.showOnboardingSetting = function() {
    // Only show the onboarding checkbox for ALFA and ADMIN users
    if (UserSessionService.getUserType() === 0 || UserSessionService.getUserType() === 1){
      return true;
    }
  }

}

AccountController['$inject'] = ['$rootScope', '$location', '$scope', 'AccountService', 'AnalyticsService', 'UserSessionService'];
angular.module('em.app').controller('AccountController', AccountController);
