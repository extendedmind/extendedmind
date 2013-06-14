"use strict";

angular.module('em.services', [ 'ngResource' ])

.factory('Latest', function($resource) {
	return $resource('static/test/json/latest.json', {
		query : {
			method : 'GET',
			isArray : true
		}
	});
}).

value('version', '0.1').

value('title', '0.1').

factory('page', function() {
	var PAGE_TITLE, subTitle;
	PAGE_TITLE = 'extended mind';
	subTitle = null;
	return {
		getSubTitle : function() {
			return subTitle;
		},
		getTitle : function() {
			if (subTitle != null) {
				return PAGE_TITLE + ' | ' + subTitle;
			} else {
				return PAGE_TITLE;
			}
		},
		setSubTitle : function(newsubTitle) {
			return subTitle = newsubTitle;
		}
	};
});
