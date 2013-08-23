/*global module, beforeEach, inject, describe, afterEach, it, expect, spyOn*/
/*jslint nomen: true */

( function() {'use strict';
    describe('em.service', function() {
      beforeEach(module('em.services'));

      describe('userAuthenticateService', function() {
        beforeEach(module('em.mockHelpers'));

        describe('userAuthenticate', function() {
          var $rootScope, httpBasicAuth, userAuthenticate;

          beforeEach(inject(function(_$rootScope_, _httpBasicAuth_, _userAuthenticate_) {
            $rootScope = _$rootScope_;
            spyOn($rootScope, "$broadcast");

            httpBasicAuth = _httpBasicAuth_;
            userAuthenticate = _userAuthenticate_;
          }));

          it('should broadcast \'event:loginRequired\' on invalid user', inject(function() {
            userAuthenticate.authenticate();
            expect($rootScope.$broadcast).toHaveBeenCalledWith('event:loginRequired');
          }));

          it('should broadcast \'event:loginSuccess\' on successful authentication', inject(function() {
            // httpBasicAuth.setCredentials('timo@ext.md', 'timopwd');
            //
            // userAuthenticate.authenticate();
            //
            // expect($rootScope.$broadcast).toHaveBeenCalledWith('event:loginRequired');
          }));
        });
      });
    });
  }());
