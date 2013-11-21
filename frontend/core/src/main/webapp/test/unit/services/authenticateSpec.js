/*global beforeEach, inject, describe, afterEach, it, expect */
/*jslint white: true */
'use strict';

describe('em.service', function() {
  beforeEach(module('em.services'));

  describe('userAuthenticate', function() {
    beforeEach(module('em.mockHelpers'));

    describe('userAuthenticate', function() {
      var $q, httpBasicAuth, mockHttpBackendResponse, userAuthenticate, userSessionStorage;

      beforeEach(inject(function(_$q_, _httpBasicAuth_, _mockHttpBackendResponse_, _userAuthenticate_, _userSessionStorage_) {
        $q = _$q_;
        httpBasicAuth = _httpBasicAuth_;
        mockHttpBackendResponse = _mockHttpBackendResponse_;
        userAuthenticate = _userAuthenticate_;
        userSessionStorage = _userSessionStorage_;

      }));

      afterEach(function() {
        mockHttpBackendResponse.clearCookies();
      });

      it('should not authenticate invalid user', inject(function() {
        var deferred = $q.defer();
        userAuthenticate.authenticate(deferred);
        expect(userSessionStorage.isUserAuthenticated()).toEqual(false);
      }));
    });
  });
});
