'use strict';

describe('DatesController', function() {

  var $scope, DatesController, DateService;

  beforeEach(function() {
    module('em.appTest');
    module('common');

    inject(function($controller, $rootScope, _DateService_) {
      $scope = $rootScope.$new();
      DatesController = $controller('DatesController', {
        $scope: $scope
      });
      DateService = _DateService_;
    });
  });

  it('should set active day to clicked day', function() {
    var today = {
      yyyymmdd: DateService.getTodayYYYYMMDD()
    };
    $scope.getDateClass(today);
    expect($scope.getDateClass(today)).toEqual('date-active-today');
  });

});
