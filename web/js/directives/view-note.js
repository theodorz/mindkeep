var app = angular.module('mindkeep');

app.directive('viewNote', function() {
	return {
		scope: {
			item: '=viewNote'
		},
		templateUrl: 'templates/view-note.html',
		controller: 'ViewNoteController'
	};
});

app.controller('ViewNoteController', function($scope, $sce) {
	if($scope.item)
		$scope.content = $sce.trustAsHtml($scope.item.content);

});
