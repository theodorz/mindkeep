var app = angular.module('mindkeep');

app.controller('ReviewController', function($scope, api, reviewService) {
	$scope.currentIndex = 0;
	$scope.items = null;

	$scope.refresh = function() {
		var time = new Date().getTime();
		api.get('/posts', {
			type: 'note',
			nextReviewDate: '<' + time 
		}).then(function(result) {
			$scope.total = result.total;
			$scope.items = result.items;
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
		nextStage = nextStage < 1 ? 1 : nextStage;
		var nextReviewDate = reviewService.getNext(nextStage, date);
		console.log(nextReviewDate);
		api.post('/posts/' + note.id, {
			reviewStage: nextStage,
			reviewDate: date.getTime(),
			nextReviewDate: nextReviewDate
		}).then(function(result) {
			console.log(result);
			if(result)
				$scope.currentIndex++;
		});
	};

	$scope.$on('keypress', function(event, keyCode) {
		if(keyCode == 32) {
			$scope.items[$scope.currentIndex].show = !$scope.items[$scope.currentIndex].show;
			console.log($scope.items[$scope.currentIndex].show);
		}
	});
});
