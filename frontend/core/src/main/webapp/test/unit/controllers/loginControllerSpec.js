/*global module, beforeEach, inject, describe, afterEach, it, expect, spyOn*/
/*jslint nomen: true */

( function() {'use strict';
    beforeEach(module('em.app'));

    describe('LoginController', function() {
      beforeEach(module('em.services', 'em.mockHelpers'));

      var $controller, $httpBackend, $rootScope, $scope, mockHttpBackendResponse;

      beforeEach(inject(function(_$controller_, _$httpBackend_, _$rootScope_, _mockHttpBackendResponse_) {
        $httpBackend = _$httpBackend_;
        $httpBackend.expectPOST('/api/authenticate');

        mockHttpBackendResponse = _mockHttpBackendResponse_;

        $rootScope = _$rootScope_;
        spyOn($rootScope, "$broadcast");

        $scope = _$rootScope_.$new();
        $controller = _$controller_('LoginController', {
          $scope : $scope
        });
      }));

      afterEach(function() {
        // $httpBackend.verifyNoOutstandingExpectation();
        // $httpBackend.verifyNoOutstandingRequest();
        // mockHttpBackendResponse.clearSessionStorage();
      });

      it('should broadcast \'event:loginRequired\' on invalid email', inject(function() {
        // $scope.user = {
        // username : 'timo@extendedmind.org',
        // password : 'timopwd'
        // };
        // $scope.userLogin();
        // $httpBackend.flush();
        // expect($rootScope.$broadcast).toHaveBeenCalledWith('event:loginRequired');
      }));

      it('should broadcast \'event:loginRequired\' on invalid password', inject(function() {
        // $scope.user = {
        // username : 'timo@ext.md',
        // password : 'wrong'
        // };
        // $scope.userLogin();
        // $httpBackend.flush();
        // expect($rootScope.$broadcast).toHaveBeenCalledWith('event:loginRequired');
      }));

      it('should broadcast \'event:loginSuccess\' on successful login', inject(function() {
        // $scope.user = {
        // username : 'timo@ext.md',
        // password : 'timopwd'
        // };
        // $scope.userLogin();
        // expect($rootScope.$broadcast).toHaveBeenCalledWith('event:loginSuccess');
      }));
    });
  }());
