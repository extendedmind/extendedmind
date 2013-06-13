(function() {
	"use strict";

	angular.module('emDev', [ 'em', 'ngMockE2E' ])

	.run(function($httpBackend) {

		$httpBackend.whenGET('/api/latest').respond(latest);
		$httpBackend.whenGET('/api/login').respond(user);
		
		$httpBackend.whenGET(/^\/static\//).passThrough();
	});

	var latest = $.getJSON('static/test/json/latest.json', function(data) {
	});	
	var user = {name: 'guest', password: 'visitor'};

}).call(this);
