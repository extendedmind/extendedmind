'use strict';

function WaitingController($routeParams, $scope, $window, $location, AnalyticsService, AuthenticationService) {

  AnalyticsService.visit('waiting');

  $scope.user = {};

  if ($routeParams.email){
    $scope.user.email = $routeParams.email;
  }
  if ($routeParams.uuid){
    $scope.user.uuid = $routeParams.uuid;
  }
  if ($routeParams.queueNumber !== undefined){
    $scope.user.inviteQueueNumber = $routeParams.queueNumber;
  }
  if ($routeParams.coupon){
    $scope.coupon = true;
  }
  if ($routeParams.invite){
    $scope.invite = true;
  }
  if ($routeParams.request){
    $scope.request = true;
  }

  $scope.useCoupon = function() {
    $scope.invalidCoupon = false;
    AuthenticationService.postInviteRequestBypass($scope.user.uuid, $scope.user.email, $scope.user.coupon).then(
      function(inviteResponse){
        if (inviteResponse.data){
          $location.path('/accept/' + inviteResponse.data.code);
          $location.search({
            email: $scope.user.email,
            bypass: true
          });
        }
      }, function(error){
        $scope.invalidCoupon = true;
      });
  }

  $scope.openEMBlogInNewWindow = function openBlogInNewWindow() {
    AnalyticsService.visit('blog');
    $window.open('http://extendedmind.org/', '_system');
  };
}

WaitingController['$inject'] = ['$routeParams', '$scope', '$window', '$location', 'AnalyticsService', 'AuthenticationService'];
angular.module('em.app').controller('WaitingController', WaitingController);
