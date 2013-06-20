"use strict";

describe("controllers", function() {

    describe("LoginCtrl", function() {

        beforeEach(module('mockedLogin'));

        var scope, ctrl, $httpBackend;

        beforeEach(inject(function(_$httpBackend_, $rootScope, $controller, usersJSON, authenticateJSON) {
            $httpBackend = _$httpBackend_;

            $httpBackend.whenGET('/api/users').respond(usersJSON);

            scope = $rootScope.$new();
            ctrl = $controller(LoginCtrl, {
                $scope : scope
            });
        }));

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should fetch user list', function() {
            $httpBackend.expectGET('/api/users');
            $httpBackend.flush();
            expect(scope.users.entry[0].email).toBe('timo@ext.md');
        });
    });
});
