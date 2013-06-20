"use strict";

function MainCtrl($scope) {
};

function HomeCtrl($scope) {
};

function LoginCtrl($scope, $http) {
    $http.get('/api/users').success(function(users) {
        $scope.users = users;
    });

    $scope.userAuthenticate = function(user) {
        $http.post('/api/authenticate', user).success(function(authenticate) {
        }).error(function() {
        });
    };
};

function NotesCtrl($scope) {
};

function TasksCtrl($scope) {
};
