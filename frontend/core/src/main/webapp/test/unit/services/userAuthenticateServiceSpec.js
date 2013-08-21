'use strict';

describe('em.service', function() {
  beforeEach(module('em.services'));

  describe('userAuthenticateService', function() {
    beforeEach(module('em.mockHelpers'));

    describe('userAuthenticate', function() {
      var $rootScope, userAuthenticate;

      beforeEach(inject(function(_$rootScope_, _userAuthenticate_) {
        $rootScope = _$rootScope_;
        userAuthenticate = _userAuthenticate_;
      }));

      it('should broadcast \'event:loginRequired\' on invalid user', inject(function() {
        spyOn($rootScope, "$broadcast");

        userAuthenticate.authenticate();
        expect($rootScope.$broadcast).toHaveBeenCalledWith('event:loginRequired');
      }));
    });
  });
});
