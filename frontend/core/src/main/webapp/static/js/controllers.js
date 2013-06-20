"use strict";

function MainCtrl($scope) {
};

function HomeCtrl($scope) {
};

function LoginCtrl($scope, $http) {
    $http.get('/api/users').success(function(users) {
        $scope.users = users;
    });

    this.login = function(user) {
        $http.post('/api/login', user).success(function(user) {

        }).error(function() {
        });
    };
};

function NotesCtrl($scope) {
};

function TasksCtrl($scope) {
};
