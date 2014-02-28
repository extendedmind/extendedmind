'use strict';

describe('WaitingController', function() {
  var $routeParams, $scope, $window;
  var WaitingController;
  var inviteRequestResponse;

  beforeEach(function() {
    module('em.appTest');

    inject(function($controller, $rootScope, _$routeParams_) {
      $scope = $rootScope.$new();
      $routeParams = _$routeParams_;
    });
    inviteRequestResponse = getJSONFixture('inviteRequestResponse.json');
  });

  // https://groups.google.com/forum/#!msg/angular/n-QmeDTrIn4/_sT3KzUwWxEJ
  // http://jsfiddle.net/pkozlowski_opensource/rKS5E/5/
  it('should initialize user with email in query url', inject(function($controller) {
    // SETUP
    $routeParams.email = 'example@example.com';
    WaitingController = $controller('WaitingController', {
      $scope: $scope,
      $routeParams: $routeParams
    });

    // EXECUTE
    expect($scope.user.email).toEqual($routeParams.email);
  }));

  it('should initialize user with uuid and queue number in query url', inject(function($controller) {
    // SETUP
    $routeParams.uuid = inviteRequestResponse.result.uuid;
    $routeParams.inviteQueueNumber = inviteRequestResponse.queueNumber;
    WaitingController = $controller('WaitingController', {
      $scope: $scope,
      $routeParams: $routeParams
    });

    // EXECUTE
    expect($scope.user.uuid).toEqual($routeParams.uuid);
    expect($scope.user.inviteQueueNumber).toEqual($routeParams.queueNumber);
  }));

  it('should open blog in a new browser window', inject(function($controller, _$window_) {
    // SETUP
    $window = _$window_;
    $routeParams.uuid = inviteRequestResponse.result.uuid;
    $routeParams.inviteQueueNumber = inviteRequestResponse.queueNumber;
    WaitingController = $controller('WaitingController', {
      $scope: $scope,
      $routeParams: $routeParams,
      $window: $window
    });
    spyOn($window, 'open');

    // EXECUTE
    $scope.openEMBlogInNewWindow();
    expect($window.open).toHaveBeenCalledWith('http://extendedmind.org/');
  }));
});
