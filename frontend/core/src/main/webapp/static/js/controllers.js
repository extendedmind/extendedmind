"use strict";

function MainCtrl($scope) {
};

function HomeCtrl($scope) {
};

function LoginCtrl($scope, $http) {
    $http.get('/api/user').success(function(user) {
        $scope.user = user;
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
