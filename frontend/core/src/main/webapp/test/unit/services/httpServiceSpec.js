'use strict';

describe('em.service', function() {
  beforeEach(module('em.services'));

  describe('httpService', function() {

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
        httpBasicAuth.setCredentials('timo@ext.md', 'timopwd');
        expect(httpBasicAuth.getCredentials()).toEqual('dGltb0BleHQubWQ6dGltb3B3ZA==');
      }));
    });

    describe('httpRequestHandler', function() {
      var $httpBackend;
      var httpRequestHandler;

      beforeEach(inject(function(_httpRequestHandler_) {
        httpRequestHandler = _httpRequestHandler_;
      }));

      it('should call http get', inject(function() {
        httpRequestHandler.get('url');
        expect(httpRequestHandler.get()).toBeDefined();
      }));

      it('should call http get with url parameter', inject(function() {
        spyOn(httpRequestHandler, 'get');
        httpRequestHandler.get('url');
        expect(httpRequestHandler.get).toHaveBeenCalledWith('url');
      }));

      it('should call http post', inject(function() {
        httpRequestHandler.post('url', undefined);
        expect(httpRequestHandler.post()).toBeDefined();
      }));

      it('should call http post with url parameter', inject(function() {
        spyOn(httpRequestHandler, 'post');
        httpRequestHandler.post('url', undefined);
        expect(httpRequestHandler.post).toHaveBeenCalledWith('url', undefined);
      }));
    });
  });
});
