/*global beforeEach, module, inject, describe, afterEach, it */
'use strict';

describe('em.service', function() {
  beforeEach(module('em.services'));

  describe('authentication', function() {
    beforeEach(module('em.mockHelpers'));

    describe('authentication', function() {
      var HttpBasicAuthenticationService, mockHttpBackendResponse, AuthenticationService, SessionStorageService;

      beforeEach(inject(function(_HttpBasicAuthenticationService_, _mockHttpBackendResponse_, _AuthenticationService_, _SessionStorageService_) {
        HttpBasicAuthenticationService = _HttpBasicAuthenticationService_;
        mockHttpBackendResponse = _mockHttpBackendResponse_;
        AuthenticationService = _AuthenticationService_;
        SessionStorageService = _SessionStorageService_;

      }));

      afterEach(function() {
      });

      it('should not authenticate invalid user', inject(function() {
      }));
    });
  });
});
