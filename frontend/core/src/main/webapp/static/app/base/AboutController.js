'use strict';

function AboutController($scope, $window, AnalyticsService, ModalService) {
  var policyModalElement, contentHeight, footerHeight;

  AnalyticsService.visit('about');

  $scope.openTermsOfServiceModal = function openTermsOfServiceModal() {
    AnalyticsService.visit('terms');
    initializePolicyModal('http://ext.md/terms.html');
  };

  $scope.openPrivacyPolicyModal = function openPrivacyPolicyModal() {
    AnalyticsService.visit('privacy');
    initializePolicyModal('http://ext.md/privacy.html');
  };

  $scope.closePolicyModal = function closePolicyModal() {
    $scope.$modalSuccess();
  };

  $scope.$on('$destroy', tearDown);
  function tearDown() {
    angular.element($window).unbind('resize', adjustModalMaxHeightAndPosition);
  }

  function initializePolicyModal(templateUrl) {
    var policyModalOptions = {
      scope: $scope,
      id: 'policy-modal',
      showHeaderCloseButton: false,
      footerTemplateUrl: 'static/app/base/policyModalFooter.html'
    };

    ModalService.createDialog(templateUrl, policyModalOptions);
    policyModalElement = document.getElementById('policy-modal');

    angular.element(policyModalElement).bind('show.bs.modal', adjustModalMaxHeightAndPosition);
    angular.element($window).bind('resize', adjustModalMaxHeightAndPosition);
  }

  function adjustModalMaxHeightAndPosition() {
    if (!policyModalElement.classList.contains('in')){
      policyModalElement.style.display = 'block';
    }

    contentHeight = $window.innerHeight - 20;

    // TODO: may not exist yet!
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

AboutController['$inject'] = ['$scope', '$window', 'AnalyticsService', 'ModalService'];
angular.module('em.app').controller('AboutController', AboutController);
