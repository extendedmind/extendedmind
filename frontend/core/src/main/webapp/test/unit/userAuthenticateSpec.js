describe('UserAuthenticate', function() {
  beforeEach(module('em.userAuthenticate', 'em.mockHelpers'));

  describe('UserAuthenticate', function() {
    var $rootScope, UserAuthenticate;

    beforeEach(inject(function(_$rootScope_, _UserAuthenticate_) {
      
      $rootScope = _$rootScope_;
      spyOn($rootScope, "$broadcast");

      UserAuthenticate = _UserAuthenticate_;
    }));

    it('should broadcast \'event:loginRequired\' on invalid user', function() {
      UserAuthenticate.userAuthenticate();
      expect($rootScope.$broadcast).toHaveBeenCalledWith('event:loginRequired');
    });
  });

  describe('UserLogin', function() {
    var $httpBackend;
    var UserLogin, HttpBasicAuth, mockHttpBackendResponse;

    beforeEach(inject(function(_$httpBackend_, _HttpBasicAuth_, _mockHttpBackendResponse_, _UserLogin_) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectPOST('/api/authenticate');

      HttpBasicAuth = _HttpBasicAuth_;
      mockHttpBackendResponse = _mockHttpBackendResponse_;
      UserLogin = _UserLogin_;
    }));

    it('should return error on invalid email', function() {
      HttpBasicAuth.setCredentials('timo@extended.mind', 'timopwd');
      UserLogin.userLogin(function(authenticateResponse) {
      }, function(authenticateResponse) {
        expect(authenticateResponse).toEqual('Forbidden');
      });
    });

    it('should return error on invalid password', function() {
      HttpBasicAuth.setCredentials('timo@ext.md', 'wrong');
      UserLogin.userLogin(function(authenticateResponse) {
      }, function(authenticateResponse) {
        expect(authenticateResponse).toEqual('Forbidden');
      });
    });

    it('should return authenticate response on successful login', function() {
      HttpBasicAuth.setCredentials('timo@ext.md', 'timopwd');
      UserLogin.userLogin(function(authenticateResponse) {;
        expect(authenticateResponse).toEqual(mockHttpBackendResponse.getAuthenticateResponse());
      }, function(authenticateResponse) {
      });
    });
  });

  describe('HttpBasicAuth', function() {
    var HttpBasicAuth;

    beforeEach(inject(function(_HttpBasicAuth_) {
      HttpBasicAuth = _HttpBasicAuth_;
    }));

    it('should set credentials', function() {
      HttpBasicAuth.setCredentials('timo@ext.md', 'timopwd');
      expect(HttpBasicAuth.getCredentials()).toBeDefined();
    });

    it('should call setter for credentials', function() {
      spyOn(HttpBasicAuth, 'setCredentials');
      HttpBasicAuth.setCredentials('timo@ext.md', 'timopwd');
      expect(HttpBasicAuth.setCredentials).toHaveBeenCalledWith('timo@ext.md', 'timopwd');
    });

    it('should get new credentials', function() {
      HttpBasicAuth.setCredentials(['timo@ext.md', 'timopwd']);
      expect(HttpBasicAuth.getCredentials()).toEqual('dGltb0BleHQubWQsdGltb3B3ZDp1bmRlZmluZWQ=');
    });
  });
});
