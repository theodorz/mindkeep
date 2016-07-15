
angular.module('mindkeep').controller('FrontController', function($scope, $http, api, $window, $location) { 
	$scope.init = true;

	$scope.connectEvernote = function() { 
		var params = {
			callback: api.base + '/integrations/evernote/callback?sessionId=' + $scope.session.id,
			sessionId: $scope.session.id
		};
		console.log(params);
		api.get('/integrations/evernote/login', params)
			.then(function(result) { 
				if(result.data && result.data.length)
					$window.location.href = result.data;
				else
					console.log('Invalid response');
			}, function(error) {
				console.log('Failed to get evernote login URL: ' + JSON.stringify(error));
			});
	};
});
