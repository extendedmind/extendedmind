/*global beforeEach, inject, describe, afterEach, it */
/*jslint white: true */
'use strict';

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
