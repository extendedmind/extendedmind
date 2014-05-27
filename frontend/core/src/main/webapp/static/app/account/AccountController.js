'use strict';

function AccountController($rootScope, $location, $scope, AccountService, AnalyticsService, UserSessionService) {

  $scope.isUserVerified = false;
  AnalyticsService.visit('account');

  $scope.settings = {};

  AccountService.getAccount().then(function(accountResponse) {
    $scope.isUserVerified = accountResponse.emailVerified ? true : false;
    $scope.email = accountResponse.email;
    var userPreferences = UserSessionService.getPreferences();
    if (userPreferences.ui){
      if (userPreferences.ui.hidePlus !== undefined){
        $scope.settings.hidePlus = userPreferences.ui.hidePlus;
      }
      if (userPreferences.ui.hideFooter !== undefined){
        $scope.settings.hideFooter = userPreferences.ui.hideFooter;
      }
    }

  });

  $scope.gotoChangePassword = function gotoChangePassword() {
    $location.path('/my/account/password');
  };

  $scope.showOnboardingChecked = function() {
    var userPreferences = UserSessionService.getPreferences();
    if ($scope.settings.showOnboarding){
      UserSessionService.setPreference('onboarded', undefined);
    }else{
      UserSessionService.setPreference('onboarded', $rootScope.packaging);
    }
    AccountService.updateAccountPreferences();
  };

  function updateHideSetting(name, hideValue){
    var userPreferences = UserSessionService.getPreferences();
    if (!userPreferences.ui) userPreferences.ui = {}
    if (hideValue){
      userPreferences.ui[name] = true;
    }else{
      userPreferences.ui[name] = false;
    }
    UserSessionService.setPreferences(userPreferences);
    AccountService.updateAccountPreferences();
  }

  $scope.hidePlus = function() {
    updateHideSetting('hidePlus', $scope.settings.hidePlus);
  };

  $scope.hideFooter = function() {
    updateHideSetting('hideFooter', $scope.settings.hideFooter);
    $scope.refreshContentFeature('tasks');
    $scope.refreshContentFeature('notes');
    $scope.refreshContentFeature('dashboard');
    $scope.refreshContentFeature('archive');
  };
}

AccountController['$inject'] = ['$rootScope', '$location', '$scope', 'AccountService', 'AnalyticsService', 'UserSessionService'];
angular.module('em.app').controller('AccountController', AccountController);
