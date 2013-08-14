describe('UserAuthenticate', function() {
  beforeEach(module('em.userAuthenticate'));

  describe('UserLogin', function() {
    var $httpBackend;
    var UserLogin;

    beforeEach(inject(function(_$httpBackend_, _UserLogin_) {
      $httpBackend = _$httpBackend_;
      UserLogin = _UserLogin_;
    }));

    it('should log in', function() {
      $httpBackend.expectPOST('/api/authenticate');
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
