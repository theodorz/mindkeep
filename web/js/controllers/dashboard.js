var app = angular.module('mindkeep');


app.controller('AllController', function($scope, api) {
	
	$scope.refresh = function() {
		api.get('/posts', { 
			//active: true,
			type: 'note'
		}).then(function(items) {
			$scope.items = items;
		}, $scope.onError.bind($scope));
	};

	$scope.create = function(item) {
		api.post('/posts', item)
		.then(function(result) {
			if(result.errorMessage)
				throw result.errorMessage;
			$scope.refresh();
		}, $scope.onError.bind($scope));
	};

	$scope.remove = function(item) {
		api.delete('/posts/' + item.id)
		.then(function(result) { 
			if(result.errorMessage)
				throw result.errorMessage;
			$scope.refresh();
		}, $scope.onError.bind($scope));
	};

	$scope.refresh();
});
