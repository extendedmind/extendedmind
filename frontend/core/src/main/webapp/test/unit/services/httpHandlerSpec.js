/*global beforeEach, inject, describe, it, expect, spyOn */
/*jslint white: true */
'use strict';

describe('em.service', function() {
  beforeEach(module('em.services'));

  describe('http', function() {

    describe('HttpBasicAuthenticationService', function() {
      var HttpBasicAuthenticationService;

      beforeEach(inject(function(_HttpBasicAuthenticationService_) {
        HttpBasicAuthenticationService = _HttpBasicAuthenticationService_;
      }));

      it('should set credentials', inject(function() {
        HttpBasicAuthenticationService.setEncodedCredentials('timo@ext.md', 'timopwd');
        expect(HttpBasicAuthenticationService.getCredentials()).toBeDefined();
      }));

      it('should call setter for credentials', inject(function() {
        spyOn(HttpBasicAuthenticationService, 'setEncodedCredentials');
        HttpBasicAuthenticationService.setEncodedCredentials('timo@ext.md', 'timopwd');
        expect(HttpBasicAuthenticationService.setEncodedCredentials).toHaveBeenCalledWith('timo@ext.md', 'timopwd');
      }));

      it('should get new credentials', inject(function() {
        HttpBasicAuthenticationService.setEncodedCredentials('timo@ext.md' + ':' + 'timopwd');
        expect(HttpBasicAuthenticationService.getCredentials()).toEqual('timo@ext.md:timopwd');
      }));
    });

    describe('BackendClientService', function() {
      var $httpBackend, BackendClientService;

      beforeEach(inject(function(_BackendClientService_) {
        BackendClientService = _BackendClientService_;
      }));

      it('should call http get', inject(function() {
        BackendClientService.get('url');
        expect(BackendClientService.get('')).toBeDefined();
      }));

      it('should call http get with url parameter', inject(function() {
        spyOn(BackendClientService, 'get');
        BackendClientService.get('url');
        expect(BackendClientService.get).toHaveBeenCalledWith('url');
      }));

      it('should call http post', inject(function() {
        BackendClientService.post('url', undefined);
        expect(BackendClientService.post('')).toBeDefined();
      }));

      it('should call http post with url parameter', inject(function() {
        spyOn(BackendClientService, 'post');
        BackendClientService.post('url', undefined);
        expect(BackendClientService.post).toHaveBeenCalledWith('url', undefined);
      }));
    });
  });
});
