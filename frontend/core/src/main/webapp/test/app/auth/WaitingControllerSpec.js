'use strict';

describe('WaitingController', function() {
  var $httpBackend, $routeParams, $scope;
  var WaitingController;
  var testOwnerUUID = '6be16f46-7b35-4b2d-b875-e13d19681e77';

  beforeEach(function() {
    module('em.appTest');

    inject(function($controller, _$httpBackend_, $rootScope, _$routeParams_) {
      $scope = $rootScope.$new();
      $routeParams = _$routeParams_;
      $httpBackend = _$httpBackend_;
    });
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  // https://groups.google.com/forum/#!msg/angular/n-QmeDTrIn4/_sT3KzUwWxEJ
  // http://jsfiddle.net/pkozlowski_opensource/rKS5E/5/
  it('should initialize user with email query url', inject(function($controller) {
    expect($scope.user).toBeUndefined();
    $routeParams.email = 'example@example.com';
    WaitingController = $controller('WaitingController', {
      $scope: $scope,
      $routeParams: $routeParams
    });
    // expect($scope.user.email).toEqual('example@example.com');
  }));

  it('should initialize user with uuid query url', inject(function($controller) {
    expect($scope.user).toBeUndefined();
    $routeParams.uuid = testOwnerUUID;
    WaitingController = $controller('WaitingController', {
      $scope: $scope,
      $routeParams: $routeParams
    });
    expect($scope.user.uuid).toEqual(testOwnerUUID);
    // var inviteRequestQueueNumberResponse = 155500;

    // $httpBackend.expectGET('/api/invite/request/' + testOwnerUUID)
    // .respond(200, inviteRequestQueueNumberResponse);
    // $httpBackend.flush();
    
    // expect($scope.user.inviteQueueNumber).toEqual(inviteRequestQueueNumberResponse);
  }));
});
