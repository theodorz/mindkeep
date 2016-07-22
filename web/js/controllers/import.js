
var app = angular.module('mindkeep');

app.controller('ImportController', function($scope, api, reviewService) {

	$scope.providers = {
		'EVN': {
			logoUrl: '/img/providers/evernote.png'
		}
	};
	$scope.refresh = function() {
		api.get('/imports').then(function(items) {
			$scope.imports = items;
		}, $scope.onError.bind($scope));
	};

	$scope.create = function(item) {
		item.type = 'note';
		item.active = true;
		item.createProps = { 
			reviewStage: 0, 
			nextReviewDate: reviewService.getNext(0, new Date()) 
		};
		api.post('/imports', item)
		.then(function(result) {
			if(result.errorMessage)
				throw result.errorMessage;
			$scope.refresh();
		}, $scope.onError.bind($scope));
	};

	$scope.remove = function(item) {
		api.delete('/imports/' + item.id)
		.then(function(result) { 
			if(result.errorMessage)
				throw result.errorMessage;
			$scope.refresh();
		}, $scope.onError.bind($scope));
	};

	$scope.refresh();
});
