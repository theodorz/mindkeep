var app = angular.module('mindkeep');

app.controller('ReviewController', function($scope, api, reviewService) {
	$scope.currentIndex = 0;
	$scope.items = null;

	$scope.refresh = function() {
		var time = new Date().getTime();
		api.get('/posts', {
			type: 'note',
			nextReviewDate: '<' + time 
		}).then(function(items) {
			$scope.items = items;
		});
	};

	$scope.getReviewDate = function(delta) {
		var date = new Date();
		var note = $scope.items[$scope.currentIndex];
		var stage = note.reviewStage + delta;
		return reviewService.getNext(stage, date);
	};


	$scope.refresh();

	$scope.eval = function(val) {
		var date = new Date();
		var note = $scope.items[$scope.currentIndex];
		var nextStage = note.reviewStage + val;
		nextStage = nextStage < 0 ? 0 :
		api.post('/posts/' + note.id, {
			reviewStage: nextStage,
			reviewDate: date.getTime(),
			nextReviewDate: reviewService.getNext(nextStage, date)
		}).then(function(result) {
		
			if(result)
				$scope.currentIndex++;
		});
	};
});
