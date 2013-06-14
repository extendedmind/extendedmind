"use strict";

function MainCtrl($scope, page) {
	return $scope.page = page;
};

function HomeCtrl($scope, page, Latest) {
	// $http.get('/api/latest').success(function(data) {
	// $scope.latest = data;
	// });
	$scope.latest = Latest.query();
	$scope.page = page;
};

function AboutCtrl($scope, page) {
	return page.setSubTitle('about');
};

function LoginCtrl($scope, page, $http) {
	$http.get('/api/login').success(function(data) {
		$scope.user = data;
	});

	$scope.page = page;
	page.setSubTitle('login');
};
