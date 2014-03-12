'use strict';

describe('snapDirective', function() {
  var $element, $rootScope, $scope;
  var SnapService;

  beforeEach(function() {
    module('em.appTest');

    inject(function(_SnapService_) {
      SnapService = _SnapService_;
    });

    spyOn(SnapService, 'createSnapper').andCallThrough();
    spyOn(SnapService, 'enableSliding').andCallThrough();
    spyOn(SnapService, 'disableSliding').andCallThrough();
    spyOn(SnapService, 'registerOpenCallback').andCallThrough();
    spyOn(SnapService, 'registerCloseCallback').andCallThrough();
    spyOn(SnapService, 'registerAnimatedCallback').andCallThrough();
    spyOn(SnapService, 'toggle').andCallThrough();
    
    inject(function(_$compile_, _$rootScope_) {
      $element = angular.element('<div snap-directive></div>');
      $scope = _$rootScope_.$new();
      _$compile_($element)(_$rootScope_);
      $rootScope = _$rootScope_;
    });
  });

  it('should create snapper', function() {
    expect(SnapService.createSnapper).toHaveBeenCalledWith($element[0]);
    expect(SnapService.disableSliding).toHaveBeenCalled();
    expect(SnapService.registerOpenCallback).toHaveBeenCalledWith(jasmine.any(Function));
    expect(SnapService.registerCloseCallback).toHaveBeenCalledWith(jasmine.any(Function));
    expect(SnapService.registerAnimatedCallback).toHaveBeenCalledWith(jasmine.any(Function));
  });
});
