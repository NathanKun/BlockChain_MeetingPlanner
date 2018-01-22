// declare a new Angular module
var myApp = angular.module('app', ["ngRoute"]);

myApp.config(function($routeProvider) {
  $routeProvider
    .when("/", {
      templateUrl: "login.html",
      controller: "LoginIndexController"
    })
    .when("/MeetingIndex", {
      templateUrl: "MeetingIndex.html",
      controller: "meetingIndexController"
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
  meetingIndexService.createMeeting = function(description, required, lieu, date) {
    return deployedContract.CreateMeeting(description, required, lieu, date, true, {
      from: accounts[0]
    });
  }

  //add searchMeeting function to service
  meetingIndexService.searchMeeting = function(id) {
    return deployedContract.SearchMeeting.call(id, {
      from: accounts[0]
    });
  }
  //get the meeting list
    meetingIndexService.getMeetingList = function() {
      return deployedContract.GetMeetingList.call( {
        from: accounts[0]
      });
    }

  //return completed service
  return meetingIndexService;

});

myApp.service('loginIndexService', function($rootScope, $http) {
  var LoginIndexService = {};
	  accounts = window.web3.eth.accounts;
		LoginIndexService.getAccounts = function() {
			return accounts;
		}

		return LoginIndexService;
});

//controller for MeetingIndex page
myApp.controller('meetingIndexController', function(MeetingIndexService, $scope, $rootScope,$location) {

  //create meeting function for button 'Create'
  $scope.createMeeting = function() {
    //call createContract() in MeetingIndexService service and pass 'description' from page to it
    MeetingIndexService.createMeeting($scope.description, $scope.required, $scope.lieu, $scope.date);
    console.log($scope.description);
  }
  // Button search meeting
  $scope.goToSearchMeeting = function(){
    $location.path('/SearchMeeting');
			console.log("Search");
  }
  //get the meeting list
  $scope.getMeetingList = function(){
    MeetingIndexService.getMeetingList().then(function(value) {
      console.log(value);
  });
  }

  // Search meeting
   $scope.searchMeeting = function() {
     MeetingIndexService.searchMeeting($scope.id).then(function(value) {
       $scope.meetingFound == value ;
      console.log(value);

       //console.log($scope.meetingFound);

   });
  }

});


myApp.controller('LoginIndexController', function(loginIndexService, $scope, $location) {
  $scope.title = "Welcome to the meeting planner!";


  $scope.verifiyLogin = function() {
	console.log($scope.address);
		var accountsHere = loginIndexService.getAccounts();
		var isCorrect = 0;
		for(i = 0; i<=accountsHere.length; i++){
			if($scope.address == accountsHere[i]){
				$location.path('/MeetingIndex');
				isCorrect = 1;
			}
			console.log(accountsHere[i]);
		}
		if(isCorrect == 0){
		alert("Login incorrect.");
	}
  }
});
