'use strict';

function AdminController($scope, DateService, AdminService, AuthenticationService, AnalyticsService) {

  AnalyticsService.visit('admin');

  AdminService.getStatistics().then(function(statisticsResponse) {
    if (statisticsResponse.data) {
      $scope.userCount = statisticsResponse.data.users;
      $scope.inviteCount = statisticsResponse.data.invites;
      $scope.inviteRequestCount = statisticsResponse.data.inviteRequests;
      $scope.itemCount = statisticsResponse.data.items;
    }
  });

  $scope.gotoUsers = function(){
    AdminService.getUsers().then(function(usersResponse){
      if (usersResponse.data){
        $scope.users = usersResponse.data.users;
        $scope.adminMode = 'users';
      }
    });
  };

  $scope.gotoInvites = function(){
    AdminService.getInvites().then(function(invitesResponse){
      if (invitesResponse.data){
        $scope.invites = invitesResponse.data.invites;
        $scope.adminMode = 'invites';
      }
    });
  };

  $scope.resendInvite = function(invite){
    AuthenticationService.resendInvite(invite.uuid, invite.email).then(function(resendResponse){
      if (resendResponse.data){
        invite.resent = true;
      }
    });
  };

  $scope.gotoInviteRequests = function(){
    AdminService.getInviteRequests().then(function(inviteRequestsResponse){
      if (inviteRequestsResponse.data){
        $scope.inviteRequests = inviteRequestsResponse.data.inviteRequests;
        $scope.adminMode = 'inviteRequests';
      }
    });
  };

  $scope.acceptInviteRequest = function(inviteRequest){
    AdminService.acceptInviteRequest(inviteRequest).then(function(){
      if (removeInviteRequest(inviteRequest)){
        $scope.inviteCount += 1;
      }
    });
  };

  $scope.deleteInviteRequest = function(inviteRequest){
    AdminService.deleteInviteRequest(inviteRequest).then(function(){
      removeInviteRequest(inviteRequest);
    });
  };

  function removeInviteRequest(inviteRequest){
    var index = $scope.inviteRequests.indexOf(inviteRequest);
    if (index > -1) {
      $scope.inviteRequests.splice(index, 1);
      // Getting stats is not cheap so do this locally
      $scope.inviteRequestCount -= 1;
      return true;
    }
  }

  $scope.getDateString = function(date){
    return DateService.getYYYYMMDD(new Date(date));
  };

  $scope.gotoStatistics = function(){
    $scope.adminMode = undefined;
  };
}

AdminController['$inject'] = ['$scope', 'DateService', 'AdminService', 'AuthenticationService', 'AnalyticsService'];
angular.module('em.app').controller('AdminController', AdminController);
