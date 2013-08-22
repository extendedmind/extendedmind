/*global module, beforeEach, inject, describe, afterEach, it, expect*/
/*jslint nomen: true */

( function() {'use strict';
    describe('em.services', function() {
      beforeEach(module('em.services'));

      describe('version', function() {
        it('should return current version', inject(function(version) {
          expect(version).toEqual(0.1);
        }));
      });
    });
  }());
