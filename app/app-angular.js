// declare a new Angular module
var myApp = angular.module('app', ["ngRoute"]);

/*
 * ROUTE
 */
myApp.config(function($routeProvider) {
  $routeProvider
    .when("/", {
      templateUrl: "login.html",
      controller: "LoginController"
    })
    .when("/MeetingIndex", {
      templateUrl: "MeetingIndex.html",
      controller: "meetingIndexController"
    });
});



/* 
 * SERVICES
 */
 
/* account service */
myApp.service('accountService', function () {
	var accountService = {};
	// all available accounts
	accounts = window.web3.eth.accounts;
	
	loggedInUser = undefined;
	
	accountService.login = function(address) {
		if(accountService.isAddressExists(address)) {
			loggedInUser = address;
		} else {
			loggedInUser = undefined;
			return false;
		}
	};
	
	accountService.getLoggedInAddress = function() {
		return loggedInUser;
	}
	
	accountService.logout = function() {
		loggedInUser = undefined;
	}
	
	accountService.isAddressExists = function isAccountExists(address) {
		for(i = 0; i < accounts.length; i++) {
			if(address == accounts[i]) {
				return true;
			}
		}
		return false;
	};

	return accountService;
});

/* meeting service */
myApp.service('meetingService', function() {

  // empty service object
  var meetingService = {};

  // MeetingPlanner contract
  deployedContract = MeetingPlanner.deployed();

  // get all available accounts
  meetingService.getAccounts = function() {
    return accounts;
  };

  // add createMeeting function to service
  meetingService.createMeeting = function(description) {
    return deployedContract.CreateMeeting(description, true, {from: accounts[0]});
  };

  // add searchMeeting function to service
  meetingService.searchMeeting = function(id) {
    return deployedContract.SearchMeeting.call(id, {from: accounts[0]});
  };

  // return completed service
  return meetingService;

});

/* invitation service */
myApp.service('invitationService', ['accountService', 'meetingService', function(accountService, meetingService) {
	
	var invitationService = {};
	deployedContract = MeetingPlanner.deployed();
	
	// local function to change invitation status
	function setInvitationStatus(msgSender, invitationId, invStatus) {
		if(deployedContract.setInvitationStatus.call(invitationId, invStatus, {from: msgSender})) return "ok";
		else return "invitation id not exists";
	};
	
	// call add invitation function in contract
	invitationService.addInvitation = function(msgSender, participantAddr, meetingId) {
		if(!accountService.isAccountExists(msgSender)) return "organizer address not exists";
		if(!accountService.isAccountExists(participantAddr)) return "participant address not exists";
		if(!meetingService.searchMeeting(meetingId)) return "meeting id not exists";
		
		deployedContract.addInvitation(participantAddr, meetingId, {from: msgSender});
		return "ok";
	};
	
	// call find invitation by id function in contract, return json with infos of invitation
	invitationService.findInvitationById = function(msgSender, invitationId) {
		return deployedContract.findInvitationById.call(invitationId, {from: msgSender});
	};
	
	// call set invitation status function in contract
	// enum MeetingStatus {WAITING, ACCEPTED, REFUSED, CANCELED}
	invitationService.setInvitationStatusAccepted = function(msgSender, invitationId, invStatus) {
		return setInvitationStatus(msgSender, invitationId, 1);
	};
	
	invitationService.setInvitationStatusRefused = function(msgSender, invitationId, invStatus) {
		return setInvitationStatus(msgSender, invitationId, 2);
	};
	
	invitationService.setInvitationStatusCanceled = function(msgSender, invitationId, invStatus) {
		return setInvitationStatus(msgSender, invitationId, 3);
	};
	
	// call find all invitation id created function in contract, return json array
	invitationService.findAllInvitationIdCreated = function(msgSender) {
		return deployedContract.findAllInvitationIdCreated({from: msgSender});
	};
	
	// call find all invitation id received function in contract, return json array
	invitationService.findAllInvitationReceived = function(msgSender) {
		return deployedContract.findAllInvitationReceived({from: msgSender});
	};
	
	return invitationService;
}]);



/*
 * CONTROLLERS
 */

// controller for MeetingIndex page
myApp.controller('meetingIndexController', function(meetingService, $scope) {

  // create meeting function for button 'Create'
  $scope.createMeeting = function() {
    // call createContract() in MeetingService service and pass 'description' from page to it
    meetingService.createMeeting($scope.description);
    console.log($scope.description);
  }

  $scope.searchMeeting = function() {
    meetingService.searchMeeting(1).then(function(value) {
      console.log(value);
    });
    meetingService.searchMeeting(2).then(function(value) {
      console.log(value);
    });
  }

});


myApp.controller('LoginController', function(accountService, $scope, $location) {
	$scope.title = "Welcome to the meeting planner!";
	$scope.verifiyLogin = function() {
		if(accountService.login($scope.address))
			$location.path('/MeetingIndex');
		else
			alert("Address incorrect.");
	}
});


