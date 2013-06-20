"use strict";

describe("controllers", function() {

    describe("LoginCtrl", function() {
        var scope, ctrl, $httpBackend;

        beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
            $httpBackend = _$httpBackend_;

            $httpBackend.expextGET('/api/authenticate').respond();

            scope = $rootScope.$new();
            ctrl = $controller(LoginCtrl, {
                $scope : scope
            });
        }));

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });
});
