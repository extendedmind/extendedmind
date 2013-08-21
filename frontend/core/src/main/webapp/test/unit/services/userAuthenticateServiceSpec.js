'use strict';

describe('em.service', function() {
  beforeEach(module('em.services'));

  describe('userAuthenticateService', function() {
    beforeEach(module('em.mockHelpers'));

    describe('userAuthenticate', function() {
      var $rootScope, userAuthenticate;

      beforeEach(inject(function(_$rootScope_, _userAuthenticate_) {

        $rootScope = _$rootScope_;
        spyOn($rootScope, "$broadcast");

        userAuthenticate = _userAuthenticate_;
      }));

      it('should broadcast \'event:loginRequired\' on invalid user', inject(function() {
        userAuthenticate.authenticate();
        expect($rootScope.$broadcast).toHaveBeenCalledWith('event:loginRequired');
      }));
    });

    describe('httpBasicAuth', function() {
      var httpBasicAuth;

      beforeEach(inject(function(_httpBasicAuth_) {
        httpBasicAuth = _httpBasicAuth_;
      }));

      it('should set credentials', inject(function() {
        httpBasicAuth.setCredentials('timo@ext.md', 'timopwd');
        expect(httpBasicAuth.getCredentials()).toBeDefined();
      }));

      it('should call setter for credentials', inject(function() {
        spyOn(httpBasicAuth, 'setCredentials');
        httpBasicAuth.setCredentials('timo@ext.md', 'timopwd');
        expect(httpBasicAuth.setCredentials).toHaveBeenCalledWith('timo@ext.md', 'timopwd');
      }));

      it('should get new credentials', inject(function() {
        httpBasicAuth.setCredentials(['timo@ext.md', 'timopwd']);
        expect(httpBasicAuth.getCredentials()).toEqual('dGltb0BleHQubWQsdGltb3B3ZDp1bmRlZmluZWQ=');
      }));
    });
  });
});
