// declare a new Angular module
var myApp = angular.module('app', []);

// declare angular service MeetingIndexService
myApp.service('MeetingIndexService', function($rootScope, $http) {

	// empty service object
	var meetingIndexService = {};
	// MeetingPlanner contract
	deployedContract = MeetingPlanner.deployed();

	// add createContract function to service
	meetingIndexService.createContract = function(description) {
		return deployedContract.CreateMeeting(description);
	}

	// return completed service
	return meetingIndexService;

});

// controller for MeetingIndex page
myApp.controller('meetingIndexController', function (MeetingIndexService, $scope, $rootScope) {

	// create meeting function for button 'Create'
	$scope.createMeeting = function() {
		// call createContract() in MeetingIndexService service and pass 'description' from page to it
		MeetingIndexService.createContract($scope.description);
	}

});


myApp.controller('helloworldController', function ($scope, $rootScope) {
    $scope.title = "Welcome to meeting planner!";
});
