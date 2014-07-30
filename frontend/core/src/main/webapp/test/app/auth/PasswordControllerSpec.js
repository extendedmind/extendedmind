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

describe('PasswordController', function() {
  var $controller, $httpBackend, $location, $routeParams, $scope;
  var PasswordController;
  var AuthenticationService, UserSessionService;
  var authenticateResponse = getJSONFixture('authenticateResponse.json');

  beforeEach(function() {
    module('em.appTest');

    inject(function(_$controller_, _$httpBackend_, _$location_, $rootScope, _$routeParams_, _AuthenticationService_, _UserSessionService_) {
      $controller = _$controller_;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      $routeParams = _$routeParams_;
      $scope = $rootScope.$new();
      AuthenticationService = _AuthenticationService_;
      UserSessionService = _UserSessionService_;
    });

    spyOn($location, 'path');
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should go back to \'/my\' account page', function() {
    PasswordController = $controller('PasswordController', {
      $scope: $scope
    });

    $scope.gotoPreviousPage = function gotoPreviousPage() {
      $location.path('/my');
    };

    $scope.gotoAccountPage();

    expect($location.path).toHaveBeenCalledWith('/my');
  });

  it('should change password', function() {
    var email = 'example@example.com';
    spyOn(UserSessionService, 'getEmail').andReturn(email);
    spyOn(UserSessionService, 'setAuthenticateInformation').andReturn();
    PasswordController = $controller('PasswordController', {
      $scope: $scope
    });

    $scope.gotoPreviousPage = function gotoPreviousPage() {
      $location.path('/my');
    };

    $scope.user = {
      currentPassword: 'currentPassword',
      newPassword: 'newPassword'
    };
    spyOn(AuthenticationService, 'putChangePassword').andCallThrough();
    $httpBackend.expectPUT('/api/password').respond(200);
    spyOn(AuthenticationService, 'login').andCallThrough();
    $httpBackend.expectPOST('/api/authenticate').respond(200, authenticateResponse);

    $scope.changePassword();
    $httpBackend.flush();

    expect(AuthenticationService.putChangePassword).toHaveBeenCalledWith(
      email,
      $scope.user.currentPassword,
      $scope.user.newPassword
      );

    expect(AuthenticationService.login).toHaveBeenCalledWith({
      username: email,
      password: $scope.user.newPassword
    });

    expect(UserSessionService.setAuthenticateInformation).toHaveBeenCalledWith(authenticateResponse, email);

    expect($location.path).toHaveBeenCalledWith('/my');
  });
});
