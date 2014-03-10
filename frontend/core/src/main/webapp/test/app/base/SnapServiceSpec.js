'use strict';

describe('SnapService', function() {
  var SnapService;

  beforeEach(function() {
    module('em.appTest');

    inject(function(_SnapService_) {
      SnapService = _SnapService_;
    });
  });

  it('should create snapper', function() {
    var element = '<div></div>';
    spyOn(SnapService, 'createSnapper');
    SnapService.createSnapper(element);
    expect(SnapService.createSnapper).toHaveBeenCalledWith(element);
  });

  it('should toggle snapper', function() {
  });

  it('should disable sliding', function() {
  });

  it('should enable sliding', function() {
  });
});
