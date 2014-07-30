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

 function AdminController($scope, AdminService, AuthenticationService, AnalyticsService, DateService) {

  AnalyticsService.visit('admin');

  AdminService.getStatistics().then(function(statisticsResponse) {
    if (statisticsResponse.data) {
      $scope.userCount = statisticsResponse.data.users;
      $scope.inviteCount = statisticsResponse.data.invites;
      $scope.inviteRequestCount = statisticsResponse.data.inviteRequests;
      $scope.itemCount = statisticsResponse.data.items;
    }
  });

  $scope.gotoUsers = function gotoUsers() {
    AdminService.getUsers().then(function(usersResponse) {
      if (usersResponse.data) {
        $scope.users = usersResponse.data.users;
        $scope.adminMode = 'users';
      }
    });
  };

  $scope.gotoInvites = function gotoInvites() {
    AdminService.getInvites().then(function(invitesResponse) {
      if (invitesResponse.data) {
        $scope.invites = invitesResponse.data.invites;
        $scope.adminMode = 'invites';
      }
    });
  };

  $scope.resendInvite = function resendInvite(invite) {
    AuthenticationService.resendInvite(invite.uuid, invite.email).then(function(resendResponse) {
      if (resendResponse.data) {
        invite.resent = true;
      }
    });
  };

  $scope.gotoInviteRequests = function gotoInviteRequests() {
    AdminService.getInviteRequests().then(function(inviteRequestsResponse) {
      if (inviteRequestsResponse.data) {
        $scope.inviteRequests = inviteRequestsResponse.data.inviteRequests;
        $scope.adminMode = 'inviteRequests';
      }
    });
  };

  $scope.acceptInviteRequest = function acceptInviteRequest(inviteRequest) {
    AdminService.acceptInviteRequest(inviteRequest).then(function() {
      if (removeInviteRequest(inviteRequest)) {
        $scope.inviteCount += 1;
      }
    });
  };

  $scope.deleteInviteRequest = function deleteInviteRequest(inviteRequest) {
    AdminService.deleteInviteRequest(inviteRequest).then(function() {
      removeInviteRequest(inviteRequest);
    });
  };

  $scope.deleteInvite = function deleteInvite(invite) {
    AdminService.deleteInvite(invite).then(function() {
      removeInvite(invite);
    });
  };

  function removeInvite(invite) {
    var index = $scope.invites.indexOf(invite);
    if (index > -1) {
      $scope.invites.splice(index, 1);
      $scope.inviteCount -= 1;
      return true;
    }
  }

  function removeInviteRequest(inviteRequest) {
    var index = $scope.inviteRequests.indexOf(inviteRequest);
    if (index > -1) {
      $scope.inviteRequests.splice(index, 1);
      // Getting stats is not cheap so do this locally
      $scope.inviteRequestCount -= 1;
      return true;
    }
  }

  $scope.getDateString = function getDateString(date) {
    return DateService.getYYYYMMDD(new Date(date));
  };

  $scope.gotoStatistics = function gotoStatistics() {
    $scope.adminMode = undefined;
  };

  $scope.destroyUser = function destroyUser(user) {
    if (user.destroy === 'destroy ' + user.email){
      AdminService.destroyUser(user).then(function() {
        removeUser(user);
      });
    }
  }

  function removeUser(user) {
    var index = $scope.users.indexOf(user);
    if (index > -1) {
      $scope.users.splice(index, 1);
      $scope.userCount -= 1;
      return true;
    }
  }
}

AdminController['$inject'] = ['$scope', 'AdminService', 'AuthenticationService', 'AnalyticsService', 'DateService'];
angular.module('em.app').controller('AdminController', AdminController);
