'use strict';

function AboutController($http, $q, $scope, $window, AnalyticsService, ModalService) {
  var policyModalElement, contentHeight, footerHeight;

  AnalyticsService.visit('about');

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

AboutController['$inject'] = ['$http', '$q', '$scope', '$window', 'AnalyticsService', 'ModalService'];
angular.module('em.app').controller('AboutController', AboutController);
