'use strict';

describe('snapDirective', function() {
  var $element, $scope;
  var SnapService;

  beforeEach(function() {
    module('em.appTest');

    inject(function(_SnapService_) {
      SnapService = _SnapService_;
    });
    spyOn(SnapService, 'createSnapper').andReturn();
    spyOn(SnapService, 'disableSliding').andReturn();
    spyOn(SnapService, 'registerOpenCallback').andReturn();
    spyOn(SnapService, 'registerCloseCallback').andReturn();
    spyOn(SnapService, 'registerAnimatedCallback').andReturn();
    
    inject(function(_$compile_, _$rootScope_) {
      $element = angular.element('<div snap-directive></div>');
      $scope = _$rootScope_.$new();
      _$compile_($element)(_$rootScope_);
    });
  });

  it('should create snapper', function() {
    expect(SnapService.createSnapper).toHaveBeenCalledWith($element[0]);
  });

  it('should set snapper visible', function() {
  });

  it('should set snapper hidden', function() {
  });

  it('should toggle snapper', function() {
  });
});
