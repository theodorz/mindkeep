var app = angular.module('mindkeep');

app.directive('viewNote', {
	params: {
		item: '=viewNote'
	},
	templateUrl: 'view-note.html',
	controller: 'ViewNoteController'
});

app.controller('ViewNoteController', function($scope, item) {
	$scope.item = item;

});
