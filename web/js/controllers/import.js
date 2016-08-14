
var app = angular.module('mindkeep');

app.controller('ImportController', function($scope, $window, api, reviewService) {

	$scope.providers = {
		'EVN': {
			logoUrl: '/img/providers/evernote.png'
		}
	};
	$scope.refresh = function() {
		api.get('/imports').then(function(result) {
			$scope.imports = result.items;
		}, $scope.onError.bind($scope));
	};

	$scope.create = function(item) {
		item.type = 'note';
		item.active = true;
		item.createProps = { 
			reviewStage: 0, 
			nextReviewDate: reviewService.getNext(0, new Date()) 
		};
		api.put('/imports', item)
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

	$scope.connectEvernote = function() { 
		var params = {
			callback: api.base + '/integrations/evernote/callback?sessionId=' + $scope.session.id,
			sessionId: $scope.session.id
		};
		console.log(params);
		api.get('/integrations/evernote/login', params)
			.then(function(result) { 
				if(result) 
					$window.location.href = result;
				else
					console.log('Invalid response');
			}, function(error) {
				console.log('Failed to get evernote login URL: ' + JSON.stringify(error));
			});
	};

	$scope.refresh();
});
