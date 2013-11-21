/*global beforeEach, inject, describe, it, expect*/
/*jslint white: true */
'use strict';

describe('em.services', function() {
  beforeEach(module('em.services'));

  describe('version', function() {
    it('should return current version', inject(function(version) {
      expect(version).toEqual(0.1);
    }));
  });
});
