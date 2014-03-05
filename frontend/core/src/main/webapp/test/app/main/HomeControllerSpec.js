'use strict';

describe('HomeController', function() {
  var $compile, $element, $location, $scope;
  var HomeController;
  var UserSessionService;
  var testCollectiveUUID = '5d2f8997-8bdf-4922-b891-6a6127682049';

  beforeEach(function() {
    module('em.appTest');

    inject(function(_$compile_, $controller, _$location_, $rootScope, _UserSessionService_) {
      $scope = $rootScope.$new();
      // http://docs.angularjs.org/guide/dev_guide.unit-testing
      $compile = _$compile_;
      $element = $compile('<div></div>')($scope);
      HomeController = $controller('HomeController', {
        $element: $element,
        $scope: $scope
      });
      $location = _$location_;
      UserSessionService = _UserSessionService_;
    });

    spyOn($location, 'path');
  });

  afterEach(function() {
  });

  it('should set \'collective\' active', function() {
    spyOn(UserSessionService, 'setCollectiveActive');

    $scope.setCollectiveActive(testCollectiveUUID);

    expect($scope.menuActive).toBe(false);
    expect(UserSessionService.setCollectiveActive).toHaveBeenCalledWith(testCollectiveUUID);
    expect($location.path).toHaveBeenCalledWith('/collective/' + testCollectiveUUID + '/tasks');
  });

  it('should set \'my\' active', function() {
    spyOn(UserSessionService, 'setMyActive');

    $scope.setMyActive();

    expect($scope.menuActive).toBe(false);
    expect(UserSessionService.setMyActive).toHaveBeenCalled();
    expect($location.path).toHaveBeenCalledWith('/my/tasks');
  });
});
