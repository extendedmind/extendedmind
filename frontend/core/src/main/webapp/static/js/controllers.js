"use strict";

function MainCtrl($scope) {
};

function HomeCtrl($scope) {
};

function LoginCtrl($scope, $http) {
    $scope.userAuthenticate = function(userName) {
        $http.post('/api/authenticate', userName).success(function(authenticate) {
            $scope.authenticate = authenticate;
        }).error(function() {
            $scope.authenticate = 'ERROR';
        });
    };
};

function NotesCtrl($scope) {
};

function TasksCtrl($scope) {
};
