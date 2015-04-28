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

  AdminService.getStatistics().then(function(response) {
    $scope.userCount = response.users;
    $scope.itemCount = response.items;
  });

  $scope.gotoUsers = function gotoUsers() {
    AdminService.getUsers().then(function(response) {
      $scope.users = response.users;
      $scope.adminMode = 'users';
    });
  };

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
  };

  function removeUser(user) {
    var index = $scope.users.indexOf(user);
    if (index > -1) {
      $scope.users.splice(index, 1);
      $scope.userCount -= 1;
      return true;
    }
  }
}

AdminController['$inject'] = [
'$scope', 'AdminService', 'AuthenticationService', 'AnalyticsService', 'DateService'
];
angular.module('em.admin').controller('AdminController', AdminController);
