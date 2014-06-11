'use strict';

function SettingsController($http, $q, $rootScope, $scope, $window, AccountService, AnalyticsService, UserSessionService, ModalService) {

  $scope.isUserVerified = false;
  AnalyticsService.visit('settings');

  $scope.settings = {};

  AccountService.getAccount().then(function(accountResponse) {
    var userPreferences = UserSessionService.getPreferences();
    if (userPreferences.ui){
      if (userPreferences.ui.hideFooter !== undefined){
        $scope.settings.hideFooter = userPreferences.ui.hideFooter;
      }
    }
  });

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

  $scope.hideFooter = function() {
    updateHideSetting('hideFooter', $scope.settings.hideFooter);
    $scope.refreshContentFeature('tasks');
    $scope.refreshContentFeature('notes');
    $scope.refreshContentFeature('dashboard');
    $scope.refreshContentFeature('archive');
  };


  var policyModalElement, contentHeight, footerHeight;
  $scope.openTermsOfServiceModal = function openTermsOfServiceModal() {
    AnalyticsService.visit('terms');
    constructPolicyModal('http://ext.md/terms.html');
  };

  $scope.openPrivacyPolicyModal = function openPrivacyPolicyModal() {
    AnalyticsService.visit('privacy');
    constructPolicyModal('http://ext.md/privacy.html');
  };

  $scope.closePolicyModal = function closePolicyModal() {
    $scope.$modalSuccess();
  };

  $scope.$on('$destroy', tearDown);
  function tearDown() {
    angular.element($window).unbind('resize', adjustModalMaxHeightAndPosition);
  }

  function constructPolicyModal(policyModalTemplateUrl) {
    var policyModalOptions = {
      scope: $scope,
      id: 'policy-modal',
      showHeaderCloseButton: false
    };

    $q.all([
      $http.get(policyModalTemplateUrl),
      $http.get('static/app/base/policyModalFooter.html')
      ]).then(initializePolicyModal);

    function initializePolicyModal(policyModalElements) {
      policyModalOptions.template = policyModalElements[0].data;
      policyModalOptions.footerTemplate = policyModalElements[1].data;

      ModalService.createDialog(null, policyModalOptions);
      policyModalElement = document.getElementById('policy-modal');

      angular.element(policyModalElement).bind('show.bs.modal', adjustModalMaxHeightAndPosition);
      angular.element($window).bind('resize', adjustModalMaxHeightAndPosition);
    }
  }

  function adjustModalMaxHeightAndPosition() {
    if (!policyModalElement.classList.contains('in')){
      policyModalElement.style.display = 'block';
    }

    contentHeight = $window.innerHeight - 20;
    footerHeight = policyModalElement.getElementsByClassName('modal-footer')[0].offsetHeight;

    policyModalElement.getElementsByClassName('modal-content')[0].style.maxHeight = contentHeight;
    policyModalElement.getElementsByClassName('modal-body')[0].style.maxHeight = (contentHeight - footerHeight) + 'px';

    var modalDialogElement = policyModalElement.getElementsByClassName('modal-dialog')[0];

    modalDialogElement.style.marginTop = -(modalDialogElement.offsetHeight / 2) + 'px';
    modalDialogElement.style.marginLeft = -(modalDialogElement.offsetWidth / 2) + 'px';

    if (!policyModalElement.classList.contains('in')){
      policyModalElement.style.display = '';
    }
  }

}

SettingsController['$inject'] = ['$http', '$q', '$rootScope', '$scope', '$window', 'AccountService', 'AnalyticsService', 'UserSessionService', 'ModalService'];
angular.module('em.app').controller('SettingsController', SettingsController);
