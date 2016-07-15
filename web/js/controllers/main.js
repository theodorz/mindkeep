
app.controller('MainController', function($scope, $state, $location, $stateParams, auth) { 
	$scope.$state = $state;
    $scope.$location = $location;
    $scope.$stateParams = $stateParams;
	$scope.errors = [];

	auth.getSession().then(function(session) {
		$scope.session = session;
	});

	$scope.onError = function(error) { 
		console.log(error);	
		$scope.errors.push(error);
	};

	$scope.logout = function() {
		auth.logout().then(function(session) {
			$scope.session = session;
		});
	};

	$scope.$watch(function() { return auth.session; }, function(newVal, oldVal) { 
		if(!newVal) return;
		$scope.session = newVal;
		if(newVal.user) {
			console.log('user logged in');
			$state.go('app.start');
		} else if(!newVal.user) {
			console.log('user logged out');
			$state.go('front');
		}
	});
});
