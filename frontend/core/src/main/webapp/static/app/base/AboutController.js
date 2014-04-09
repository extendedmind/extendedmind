'use strict';

function AboutController($scope, $window, AnalyticsService) {

  AnalyticsService.visit('about');

  $scope.gotoTermsOfService = function gotoTermsOfService() {
    AnalyticsService.visit('terms');
    $window.open('http://ext.md/terms.html', '_system');
  };

  $scope.gotoPrivacyPolicy = function gotoPrivacyPolicy() {
    AnalyticsService.visit('privacy');
    $window.open('http://ext.md/privacy.html', '_system');
  };
}

AboutController['$inject'] = ['$scope', '$window', 'AnalyticsService'];
angular.module('em.app').controller('AboutController', AboutController);
