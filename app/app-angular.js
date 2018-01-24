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
    })
    .when("/Invitation", {
      templateUrl: "Invitation.html",
      controller: "invitationController"
    })
    .when("/myinvitations", {
      templateUrl: "myinvitations.html",
      controller: "myInvitationsController"
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
	
	accountService.loggedInUser = undefined;
	
	accountService.getLoggedInAddress = function() {return this.loggedInUser;};
	
	accountService.login = function(address) {
		if(accountService.isAddressExists(address)) {
			accountService.loggedInUser = address;
			return true;
		} else {
			loggedInUser = undefined;
			return false;
		}
	};
	
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

	// add createMeeting function to service
	meetingService.createMeeting = function(description) {
	return deployedContract.CreateMeeting(description, true, {from: accounts[0]});
	};

	// add searchMeeting function to service
	meetingService.searchMeeting = function(id) {
	return deployedContract.SearchMeeting.call(id, {from: accounts[0]});
	};

	meetingService.findMeetingById = function(meetingId) {
		return deployedContract.findMeetingById.call(meetingId).then(function(mt) {
			return {};
		});
	}

	// return completed service
	return meetingService;

});

/* invitation service */
myApp.service('invitationService', ['accountService', 'meetingService', function(accountService, meetingService) {
	
	var invitationService = {};
	deployedContract = MeetingPlanner.deployed();
	
	// local function to change invitation status
	function setInvitationStatus(msgSender, invitationId, invStatus) {
		return deployedContract.setInvitationStatus.call(invitationId, invStatus, {from: msgSender}).then(
			function(value) 
				if(value) return "ok";
				else return "invitation id not exists";
		));
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
	invitationService.findInvitationById = function(invitationId) {
		return deployedContract.findInvitationById.call(invitationId).then(function(inv) {
			return {"id": inv[0].toNumber(), "organizer": inv[1], "participant": inv[2], "meetingId": inv[3].toNumber(),
					"statusNumber": inv[4].toNumber(), "statusString": invitationStatusNumberToString(inv[5].toNumber())};
		});
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
	invitationService.findAllInvitationIdCreated = function() {
		return deployedContract.findAllInvitationIdCreated(accountService.loggedInUser);
	};
	
	// call find all invitation id received function in contract, return json array
	invitationService.findAllInvitationReceived = function() {
		// find all invitations' id
		deployedContract.findAllInvitationIdReceived.call(accountService.loggedInUser).then(function(values) {
			var promises = [];
			for(var i = 0; i < values.length; i++) {
				var id = values[i].toNumber();
				if(id != 0)
					// find all invitations by invitationId in idList
					var invitation = deployedContract.findInvitationById(id);
					// find meeting by meetingId found in invitation
					var meeting =  meetingService.findMeetingById(invitation.meetingId);
					
					invStatus = invitation.statusNumber;
					isAccepted = 0;
					isRefused = 0;
					
					switch(invStatus) {
						case 0:
							break;
						case 1:
							isAccepted = 1;
							break;
						case 2:
							isAccepted = 0;
							break;
						default:
						break;
					}
					
					return [
							"id": invitation.id,
							"description": meeting.description, 
							"date": meeting.date,
							"place": meeting.place,
							"status": meeting.meetingStatus,
							"organizer": invitation[1],
							"isAccepted": isAccepted,
							"isRefused", isRefused
						];
			}
			
			return Promise.all(promises).then(function(values) {
				//console.log(values);
				return values;
			});
		});
	};
	
	function invitationStatusNumberToString(number) {
		return ["WAITING", "ACCEPTED", "REFUSED", "CANCELED"][number]
	}
	function invitationStatusStringToNumber(string) {
		switch(string) {
			case "WAITING": return 0; 
			case "ACCEPTED": return 1; 
			case "REFUSED": return 2; 
			case "CANCELED": return 3;
			default: return "Status not exists";
		}
	}
	
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


myApp.controller('invitationController', function(accountService, $scope, $location) {
	$scope.title = "Welcome to the meeting planner!";
	$scope.verifiyLogin = function() {
		if(accountService.login($scope.address))
			$location.path('/MeetingIndex');
		else
			alert("Address incorrect.");
	}
});


myApp.controller('myInvitationsController', function(accountService, invitationService, $scope, $location) {
	$scope.invitations = invitationService.findAllInvitationReceived();
	
	$scope.acceptInvitation = function(invId) {
		console.log("accept " + invId);
	};
	
	$scope.refuseInvitation = function(invId) {
		console.log("refuse " + invId);
	};
});


