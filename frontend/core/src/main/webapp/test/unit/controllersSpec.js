"use strict";

describe("controllers", function() {

    describe("LoginCtrl", function() {

        var scope, ctrl, $httpBackend;

        beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
            $httpBackend = _$httpBackend_;

            var authenticate = getJSONFixture('getAuthenticateResponse.json');

            $httpBackend.expectPOST('/api/authenticate').respond(function(method, url, data) {
                if (data == 'timo@ext.md') {
                    return [200, authenticate];
                } else {
                    return [503, 'Invalid username/password'];
                }
            });

            scope = $rootScope.$new();
            ctrl = $controller(LoginCtrl, {
                $scope : scope
            });
        }));

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should return login response for user "timo@ext.md"', function() {
            scope.userAuthenticate('timo@ext.md');
            $httpBackend.flush();

            expect(scope.authenticate[0].token).toBe('timo-tiuraniemi');
        });

        it('should not return login response for user "jp@ext.md"', function() {
            scope.userAuthenticate('jp');
            $httpBackend.flush();

            expect(scope.authenticate).toBe('ERROR');
        });

    });
});
