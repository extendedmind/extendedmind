/*global module, beforeEach, inject, describe, afterEach, it, expect, spyOn*/
/*jslint nomen: true */

( function() {'use strict';
    describe('em.service', function() {
      beforeEach(module('em.services'));

      describe('http', function() {

        describe('httpBasicAuth', function() {
          var httpBasicAuth;

          beforeEach(inject(function(_httpBasicAuth_) {
            httpBasicAuth = _httpBasicAuth_;
          }));

          it('should set credentials', inject(function() {
            httpBasicAuth.setEncodedCredentials('timo@ext.md', 'timopwd');
            expect(httpBasicAuth.getCredentials()).toBeDefined();
          }));

          it('should call setter for credentials', inject(function() {
            spyOn(httpBasicAuth, 'setEncodedCredentials');
            httpBasicAuth.setEncodedCredentials('timo@ext.md', 'timopwd');
            expect(httpBasicAuth.setEncodedCredentials).toHaveBeenCalledWith('timo@ext.md', 'timopwd');
          }));

          it('should get new credentials', inject(function() {
            httpBasicAuth.setEncodedCredentials('timo@ext.md' + ':' + 'timopwd');
            expect(httpBasicAuth.getCredentials()).toEqual('timo@ext.md:timopwd');
          }));
        });

        describe('httpRequest', function() {
          var $httpBackend, httpRequest;

          beforeEach(inject(function(_httpRequest_) {
            httpRequest = _httpRequest_;
          }));

          it('should call http get', inject(function() {
            httpRequest.get('url');
            expect(httpRequest.get('')).toBeDefined();
          }));

          it('should call http get with url parameter', inject(function() {
            spyOn(httpRequest, 'get');
            httpRequest.get('url');
            expect(httpRequest.get).toHaveBeenCalledWith('url');
          }));

          it('should call http post', inject(function() {
            httpRequest.post('url', undefined);
            expect(httpRequest.post('')).toBeDefined();
          }));

          it('should call http post with url parameter', inject(function() {
            spyOn(httpRequest, 'post');
            httpRequest.post('url', undefined);
            expect(httpRequest.post).toHaveBeenCalledWith('url', undefined);
          }));
        });
      });
    });
  }());
