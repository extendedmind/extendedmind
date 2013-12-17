/*global beforeEach, module, inject, describe, afterEach, it */
'use strict';

describe('em.service', function() {
  beforeEach(module('em.services'));

  describe('auth', function() {
    beforeEach(module('em.mockHelpers'));

    describe('auth', function() {
      var httpBasicAuth, mockHttpBackendResponse, auth, userSessionStorage;

      beforeEach(inject(function(_httpBasicAuth_, _mockHttpBackendResponse_, _auth_, _userSessionStorage_) {
        httpBasicAuth = _httpBasicAuth_;
        mockHttpBackendResponse = _mockHttpBackendResponse_;
        auth = _auth_;
        userSessionStorage = _userSessionStorage_;

      }));

      afterEach(function() {
      });

      it('should not authenticate invalid user', inject(function() {
      }));
    });
  });
});
