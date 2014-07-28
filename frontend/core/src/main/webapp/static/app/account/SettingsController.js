/* Copyright 2013-2014 Extended Mind Technologies Oy
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 'use strict';

 function SettingsController($http, $q, $rootScope, $scope, $window, AccountService, AnalyticsService, ModalService, UserSessionService) {

  $scope.isUserVerified = false;
  AnalyticsService.visit('settings');

  $scope.settings = {};

  AccountService.getAccount().then(function(/*accountResponse*/) {
    var userPreferences = UserSessionService.getPreferences();
    if (userPreferences.ui) {
      if (userPreferences.ui.hideFooter !== undefined) {
        $scope.settings.hideFooter = userPreferences.ui.hideFooter;
      }
    }
  });

  $scope.onboardingChecked = function onboardingChecked() {
    UserSessionService.getPreferences();
    if ($scope.settings.showOnboarding) {
      UserSessionService.setPreference('onboarded', undefined);
    } else {
      UserSessionService.setPreference('onboarded', $rootScope.packaging);
    }
    AccountService.updateAccountPreferences();
  };

  $scope.showOnboardingCheckbox = function showOnboardingCheckbox() {
    return UserSessionService.getUserType() === 0 || UserSessionService.getUserType() === 1;
  };

  function updateHideSetting(name, hideValue) {
    var userPreferences = UserSessionService.getPreferences();
    if (!userPreferences.ui) userPreferences.ui = {};
    if (hideValue) {
      userPreferences.ui[name] = true;
    } else {
      userPreferences.ui[name] = false;
    }
    UserSessionService.setPreferences(userPreferences);
    AccountService.updateAccountPreferences();
  }

  $scope.hideFooter = function hideFooter() {
    updateHideSetting('hideFooter', $scope.settings.hideFooter);
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
    if (!policyModalElement.classList.contains('in')) {
      policyModalElement.style.display = 'block';
    }

    contentHeight = $window.innerHeight - 20;
    footerHeight = policyModalElement.getElementsByClassName('modal-footer')[0].offsetHeight;

    policyModalElement.getElementsByClassName('modal-content')[0].style.maxHeight = contentHeight;
    policyModalElement.getElementsByClassName('modal-body')[0].style.maxHeight = (contentHeight - footerHeight) + 'px';

    var modalDialogElement = policyModalElement.getElementsByClassName('modal-dialog')[0];

    modalDialogElement.style.marginTop = -(modalDialogElement.offsetHeight / 2) + 'px';
    modalDialogElement.style.marginLeft = -(modalDialogElement.offsetWidth / 2) + 'px';

    if (!policyModalElement.classList.contains('in')) {
      policyModalElement.style.display = '';
    }
  }
}

SettingsController['$inject'] = ['$http', '$q', '$rootScope', '$scope', '$window', 'AccountService', 'AnalyticsService', 'ModalService', 'UserSessionService'];
angular.module('em.app').controller('SettingsController', SettingsController);
