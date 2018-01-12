// declare a new Angular module
var myApp = angular.module('app', ["ngRoute"]);

myApp.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "login.html",
        controller : "helloworldController"
    })
    .when("/MeetingIndex", {
        templateUrl : "MeetingIndex.html",
        controller : "meetingIndexController"
    });
});

// declare angular service MeetingIndexService
myApp.service('MeetingIndexService', function($rootScope, $http) {

	// empty service object
	var meetingIndexService = {};
	// all available accounts
    accounts = window.web3.eth.accounts;

	// MeetingPlanner contract
	deployedContract = MeetingPlanner.deployed();

	// get all available accounts
    meetingIndexService.getAccounts = function() {
        return accounts;
    }

	// add createMeeting function to service
	meetingIndexService.createMeeting = function(description) {
		return deployedContract.CreateMeeting(description, true, {from: accounts[0]});
	}

	// add searchMeeting function to service
	meetingIndexService.searchMeeting = function(id) {
		return deployedContract.SearchMeeting.call(id, {from: accounts[0]});
	}

	// return completed service
	return meetingIndexService;

});

// controller for MeetingIndex page
myApp.controller('meetingIndexController', function (MeetingIndexService, $scope, $rootScope) {

	// create meeting function for button 'Create'
	$scope.createMeeting = function() {
		// call createContract() in MeetingIndexService service and pass 'description' from page to it
		MeetingIndexService.createMeeting($scope.description);
		//console.log($scope.description);
	}

	$scope.searchMeeting = function() {
		MeetingIndexService.searchMeeting(1).then(function(value) {console.log(value);});
		MeetingIndexService.searchMeeting(2).then(function(value) {console.log(value);});
		MeetingIndexService.searchMeeting(3).then(function(value) {console.log(value);});
		MeetingIndexService.searchMeeting(4).then(function(value) {console.log(value);});
		MeetingIndexService.searchMeeting(5).then(function(value) {console.log(value);});
		MeetingIndexService.searchMeeting(6).then(function(value) {console.log(value);});
		MeetingIndexService.searchMeeting(7).then(function(value) {console.log(value);});
	}

});


myApp.controller('LoinIndexController', function ($scope, $rootScope) {
    $scope.title = "Welcome to the meeting planner!";
		$scope.verifiyLogin = function(){

		}
});
