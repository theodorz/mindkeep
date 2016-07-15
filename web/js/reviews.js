var app = angular.module('mindkeep');

app.factory('reviews', function() { 
	var service = {};
	
	var dayMs = 1000 * 60 * 60 * 24; 
	service.stages = {
		'0': 0 * dayMs,
		'1': 1 * dayMs,
		'2': 5 * dayMs,
		'3': 10 * dayMs,
		'4': 30 * dayMs,
		'5': 365 * dayMs
	};
	
	service.getNext = function(stage, date) { 
		var currentTime = date.getTime();
		var stageDuration = service.stages[stage] ;
		return currentTime + stageDuration;
	};
	return service;
});
