/*global module, beforeEach, inject, describe, afterEach, it, expect, spyOn*/
/*jslint nomen: true */

( function() {'use strict';
    describe('em.service', function() {
      beforeEach(module('em.services'));

      describe('items', function() {
        beforeEach(module('em.mockHelpers'));

        describe('userItemsFactory', function() {

          beforeEach(inject(function() {
          }));

          afterEach(function() {
          });

          it('should get user\'s items', inject(function() {
          }));
        });
      });
    });
  }());
