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
    .when("/MeetingCreated", {
      templateUrl: "MeetingCreated.html",
      controller: "meetingIndexController"
    })
    .when("/Invitation", {
      templateUrl: "Invitation.html",
      controller: "invitationController"
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
			return true;
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
				console.log("found");
				return true;
			}
		}
		return false;
	};

	return accountService;
});




/* meeting service */
myApp.service('meetingService', ['accountService', function(accountService) {

  // empty service object
  var meetingService = {};

  // MeetingPlanner contract
  deployedContract = MeetingPlanner.deployed();

  // add createMeeting function to service
  meetingService.createMeeting = function(description, required, lieu, date) {
    return deployedContract.CreateMeeting(description, required, lieu, date, true, {
      from: accountService.getLoggedInAddress()
    });
  }

  //add searchMeeting function to service
  meetingService.searchMeeting = function(id) {
    return deployedContract.SearchMeeting.call(id, {
      from: accountService.getLoggedInAddress()
    });
  }
  //get the meeting list
  meetingService.getMeetingById = function(id) {
      return deployedContract.GetMeetingById(id, {
        from: accountService.getLoggedInAddress()
      });
    }

  //get the meetings created by an address
  meetingService.getMeetingCreated = function(address) {
    return deployedContract.GetAllMeetingCreated(address, {
      from: accountService.getLoggedInAddress()
    });
  }

  //return completed service
  return meetingService;

}]);

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

//controller for MeetingIndex page
myApp.controller('meetingIndexController', function(meetingService,accountService, $scope, $rootScope,$location) {
  $scope.success = null;

  //create meeting function for button 'Create'
  $scope.createMeeting = function() {
    //call createContract() in MeetingIndexService service and pass 'description' from page to it
    meetingService.createMeeting($scope.description, $scope.selectedRequired, $scope.lieu, $scope.date);
    $scope.success = true;
    document.getElementById("result").focus();
  }
  // go to meeting created page
  $scope.goToMeetingCreated = function(){
    $location.path('/MeetingCreated');
  }

  // Go to meeting created
  $scope.getMeetingCreated = function(){
    $scope.address = accountService.getLoggedInAddress();
      meetingService.getMeetingCreated($scope.address).then(function(value) {
        console.log(searchMeeting(value));
        console.log("1" + value);
    });
  }

  // Search meeting
   $scope.searchMeeting = function() {
    meetingService.searchMeeting($scope.id).then(function(value) {
       $scope.meetingFound == value ;
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


