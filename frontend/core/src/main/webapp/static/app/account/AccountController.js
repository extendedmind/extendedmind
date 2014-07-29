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

 function AccountController($location, $rootScope, $scope, AccountService, AnalyticsService, UISessionService, UserSessionService) {

  $scope.isUserVerified = false;
  AnalyticsService.visit('account');

  AccountService.getAccount().then(function(accountResponse) {
    $scope.isUserVerified = accountResponse.emailVerified ? true : false;
    $scope.email = accountResponse.email;
  });

  $scope.gotoChangePassword = function gotoChangePassword() {
    $location.path('/my/account/password');
  };

  $scope.gotoAdmin = function gotoAdmin() {
    $location.path('/admin');
  };

  $scope.useCollectives = function useCollectives() {
    return $scope.collectives && Object.keys($scope.collectives).length > 1;
  };

  $scope.setMyActive = function setMyActive() {
    if (!$location.path().startsWith('/my')) {
      UISessionService.setMyActive();
      UISessionService.changeFeature('tasks');
      $location.path('/my');
    } else {
      $scope.toggleMenu();
    }
  };

  $scope.setCollectiveActive = function setCollectiveActive(uuid) {
    if (!$location.path().startsWith('/collective/' + uuid)) {
      UISessionService.setCollectiveActive(uuid);
      UISessionService.changeFeature('tasks');
      $location.path('/collective/' + uuid);
    } else {
      $scope.toggleMenu();
    }
  };

  $scope.getMyClass = function getMyClass() {
    if (UISessionService.getOwnerPrefix() === 'my') {
      return 'active';
    } else {
      return 'highlighted-link';
    }
  };

  $scope.getCollectiveClass = function getCollectiveClass(uuid) {
    if (UISessionService.getOwnerPrefix() === 'collective/' + uuid) {
      return 'active';
    } else {
      return 'highlighted-link';
    }
  };

  // LOGOUT
  $scope.logout = function logout() {
    AccountService.logout().then(function() {
      $location.path('/login');
      UserSessionService.clearUser();
      UISessionService.reset();
    });
  };
}

AccountController['$inject'] = ['$location', '$rootScope', '$scope', 'AccountService', 'AnalyticsService', 'UISessionService', 'UserSessionService'];
angular.module('em.app').controller('AccountController', AccountController);
