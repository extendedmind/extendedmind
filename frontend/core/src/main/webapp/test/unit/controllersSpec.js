"use strict";

describe("controllers", function() {

    describe("LoginCtrl", function() {

        beforeEach(module('mockedLogin'));

        var scope, ctrl, $httpBackend;

        beforeEach(inject(function(_$httpBackend_, $rootScope, $controller, authenticateJSON) {
            $httpBackend = _$httpBackend_;

            var authenticate = getJSONFixture('getAuthenticateResponse.json');

            $httpBackend.expectPOST('/api/authenticate').respond(authenticate);

            scope = $rootScope.$new();
            ctrl = $controller(LoginCtrl, {
                $scope : scope
            });
        }));

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should return login response', function() {
            scope.userAuthenticate();
            $httpBackend.flush();
            expect(scope.authenticate[0].token).toBe('timo-tiuraniemi');
        });
    });
});
