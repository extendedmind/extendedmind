(function() {
	"use strict";

	window.MainCtrl = function($scope, page) {
		return $scope.page = page;
	};

	window.HomeCtrl = function($scope, page, $http) {
		$http.get('/api/latest').success(function(data) {
			$scope.latest = data;
		});
		$scope.page = page;
	};

	window.AboutCtrl = function($scope, page) {
		return page.setSubTitle('about');
	};

	window.LoginCtrl = function($scope, page, $http) {
		$http.get('/api/login').success(function(data) {
			$scope.user = data;
		});

//		this.login = function(name) {
//			$scope.status = 'Authenticating';
//			$http.post('/api/authenticate', name).success(function(response) {
//				$scope.status = '';
//			}).error(function() {
//				$scope.status = 'ERROR';
//			});
//		};

		$scope.page = page;
		page.setSubTitle('login');
	};

	window.MyCtrl = function($scope, page) {
		return page.setSubTitle('my');
	};

}).call(this);
