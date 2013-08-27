/*global module, beforeEach, inject, describe, afterEach, it, expect, spyOn*/
/*jslint nomen: true */

( function() {'use strict';
    describe('em.service', function() {
      beforeEach(module('em.services'));

      describe('userAuthenticateService', function() {
        beforeEach(module('em.mockHelpers'));

        describe('userAuthenticate', function() {
          var $rootScope, httpBasicAuth, mockHttpBackendResponse, userAuthenticate;

          beforeEach(inject(function(_$rootScope_, _httpBasicAuth_, _mockHttpBackendResponse_, _userAuthenticate_) {
            $rootScope = _$rootScope_;
            spyOn($rootScope, "$broadcast");

            httpBasicAuth = _httpBasicAuth_;
            mockHttpBackendResponse = _mockHttpBackendResponse_;
            userAuthenticate = _userAuthenticate_;
          }));

          afterEach(function() {
            mockHttpBackendResponse.clearCookies();
          });

          it('should broadcast \'event:loginRequired\' on invalid user', inject(function() {
            userAuthenticate.authenticate();
            expect($rootScope.$broadcast).toHaveBeenCalledWith('event:loginRequired');
          }));
        });
      });
    });
  }());
