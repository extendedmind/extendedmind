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

describe('AccountController', function() {
  var $location, $scope, AccountController;

  var MockUserSessionService = {
    getEmail: function() {
      return 'timo@ext.md';
    },
    setEmail: function(/*email*/) {
      return;
    },
    getCredentials: function() {
      return '';
    }
  };

  beforeEach(function() {
    module('em.appTest');

    module('em.base', function ($provide){
      $provide.value('UserSessionService', MockUserSessionService);
    });

    inject(function($controller, _$location_, $rootScope) {
      $scope = $rootScope.$new();
      AccountController = $controller('AccountController', {
        $scope: $scope
      });
      $location = _$location_;
    });

    spyOn($location, 'path');
  });

  it('should redirect to \'/my/account/password\'', function() {
    $scope.gotoChangePassword();
    expect($location.path).toHaveBeenCalledWith('/my/account/password');
  });
});
