var myApp = angular.module('app', []);

myApp.service('MeetingIndexService', function($rootScope, $http) {
	
	var meetingIndexService = {};
    deployedContract = MetaCoin.deployed();
	
	meetingIndexService.createContract = function(description) {
		return deployedContract.CreateMeeting(description);
	}
	
	return meetingIndexService;
	
}
	
myApp.controller('meetingIndexController', function (MeetingIndexService, $scope, $rootScope) {

	$scope.createMeeting = function() {
		MeetingIndexService.createContract($scope.description);
	}
	
});


myApp.controller('helloworldController', function ($scope, $rootScope) {
    $scope.title = "Welcome to meeting planner!";
});
