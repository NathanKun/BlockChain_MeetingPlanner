// declare a new Angular module
var myApp = angular.module('app', ["ngRoute"]);

/*
 * ROUTE
 */
myApp.config(function($routeProvider, $locationProvider) {
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
    $locationProvider.html5Mode({ enabled: true, requireBase: false });

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

  accountService.getAccounts = function() {
    return accounts;
  };

	return accountService;
});

/* meeting service */
myApp.service('meetingService', function() {

	// empty service object
	var meetingService = {};

	// MeetingPlanner contract
	deployedContract = MeetingPlanner.deployed();

	// add searchMeeting function to service
	meetingService.searchMeeting = function(id) {
	return deployedContract.SearchMeeting.call(id, {from: accounts[0]});
	};

	meetingService.findMeetingById = function(meetingId) {
		return deployedContract.findMeetingById.call(meetingId).then(function(mt) {
			// uint id, bool required, address manager, string description, string lieu, uint date, Status status
			return {"id" : mt[0].toNumber(), "required" : mt[1], "organizer" : mt[2], "description" : mt[3],
				"place" : mt[4], "date" : mt[5].toNumber(), "statusNumber" : mt[6].toNumber(),
				"statusString" : mt[6].toNumber() == 0 ? "In progress" : "Closed"};
		});
	}

	// add createMeeting function to service
	meetingService.createMeeting = function(description, required, lieu, date) {
		return deployedContract.CreateMeeting(description, required, lieu, date, true, {from: accounts[0]});
	};

	//get the meeting list
	meetingService.getMeetingList = function() {
		return deployedContract.GetMeetingList.call( {from: accounts[0]});
	};

	// return completed service
	return meetingService;
});

/* invitation service */
myApp.service('invitationService', ['accountService', 'meetingService', function(accountService, meetingService) {

	var invitationService = {};
	deployedContract = MeetingPlanner.deployed();

	// local function to change invitation status
	function setInvitationStatus(invitationId, invStatus) {
		return deployedContract.setInvitationStatus(invitationId, invStatus, {from: accountService.loggedInUser}).then(
			function(value) {
				if(value) return "ok";
				else return "invitation id not exists";
			}
		);
	};

	// call add invitation function in contract
	invitationService.addInvitation = function(participantAddr, meetingId) {
		if(!accountService.isAccountExists(accountService.loggedInUser)) return "organizer address not exists";
		if(!accountService.isAccountExists(participantAddr)) return "participant address not exists";
		if(!meetingService.searchMeeting(meetingId)) return "meeting id not exists";

		return deployedContract.addInvitation(participantAddr, meetingId, {from: accountService.loggedInUser}).then(
			function(){return "ok";});

	};

	// call find invitation by id function in contract, return json with infos of invitation
	invitationService.findInvitationById = function(invitationId) {
		return deployedContract.findInvitationById.call(invitationId).then(function(inv) {
			return {"id" : inv[0].toNumber(), "organizer" : inv[1], "participant" : inv[2], "meetingId" : inv[3].toNumber(),
					"statusNumber" : inv[4].toNumber(), "statusString" : invitationStatusNumberToString(inv[4].toNumber())};
		});
	};

	// call set invitation status function in contract
	// enum InvitationStatus {WAITING, ACCEPTED, REFUSED, CANCELED}
	invitationService.setInvitationStatusAccepted = function(invitationId) {
		return setInvitationStatus(invitationId, 1);
	};

	invitationService.setInvitationStatusRefused = function(invitationId) {
		return setInvitationStatus(invitationId, 2);
	};

	invitationService.setInvitationStatusCanceled = function(invitationId) {
		return setInvitationStatus(invitationId, 3);
	};

	// call find all invitation id created function in contract, return json array
	invitationService.findAllInvitationIdCreated = function() {
		return deployedContract.findAllInvitationIdCreated(accountService.loggedInUser);
	};

	// call find all invitation id received function in contract, return json array
	invitationService.findAllInvitationReceived = function() {
		// find all invitations' id
		return deployedContract.findAllInvitationIdReceived.call(accountService.loggedInUser).then(function(values) {
			var promises = [];
			for(var i = 0; i < values.length; i++) {
				var id = values[i].toNumber();
				if(id != 0) {
					//console.log(id);
					// find all invitations by invitationId in idList
					var prom = invitationService.findInvitationById(id).then(function(invitation){
						// find meeting by meetingId found in invitation
						return meetingService.findMeetingById(invitation.meetingId).then(function(meeting) {
							//console.log(invitation);
							//console.log(meeting);
							invStatus = invitation.statusNumber;
							isAccepted = 0;
							isRefused = 0;

							switch(invStatus) {
								case 0:
									break;
								case 1:
									isAccepted = 1;
									isRefused = 2;
									break;
								case 2:
									isAccepted = 2;
									isRefused = 1;
									break;
								default:
								break;
							}

							return {
									"id" : invitation.id,
									"description" : meeting.description,
									"date" : meeting.date,
									"place" : meeting.place,
									"status" : meeting.statusString,
									"organizer" : invitation.organizer,
									"isAccepted" : isAccepted,
									"isRefused" : isRefused
								};
						});
					});
					promises.push(prom);
				}

			}

			return Promise.all(promises).then(function(values) {
				console.log(values);
				return values;
			});
		});
	};

	function invitationStatusNumberToString(number) {
		return ["WAITING" , "ACCEPTED", "REFUSED", "CANCELED"][number]
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


  //Return a list of all participants possible
  invitationService.findAllParticipantPossible = function(msgSender) {
    var allAccount = accountService.getAccounts();
    var listPromises = [];
    var listUser = [];
    for(i = 0; i < allAccount.length; i++) {
      listPromises.push(
      deployedContract.findUserByAddress.call(allAccount[i], {from: msgSender}).then(function(value) {
        return value;
          })
      );
    }
    return Promise.all(listPromises).then(function(values){
            for (var i = 0; i < values.length; i++) {
                values[i].push(allAccount[i]);
                listUser[i] = values[i];
                console.log(values[i]);
            }
            //console.log(listUser);
            return listUser;
        });

  };

	return invitationService;
}]);




/*
 * CONTROLLERS
 */

//controller for MeetingIndex page
myApp.controller('meetingIndexController', function(meetingService, $scope, $rootScope,$location) {

  //create meeting function for button 'Create'
  $scope.createMeeting = function() {
    //call createContract() in meetingService service and pass 'description' from page to it
    meetingService.createMeeting($scope.description, $scope.required, $scope.lieu, $scope.date);
    console.log($scope.description);
  }
  // Button search meeting
  $scope.goToSearchMeeting = function(){
    $location.path('/SearchMeeting');
			console.log("Search");
  }
  //get the meeting list
  $scope.getMeetingList = function(){
    meetingService.getMeetingList().then(function(value) {
      console.log(value);
  });
  }

  // Search meeting
   $scope.searchMeeting = function() {
     meetingService.searchMeeting($scope.id).then(function(value) {
       $scope.meetingFound == value ;
      console.log(value);

       //console.log($scope.meetingFound);

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


myApp.controller('invitationController', function(accountService, invitationService, $scope, $location) {
	var listAdd = [];

	invitationService.findAllParticipantPossible(accountService.getLoggedInAddress()).then(function(value) {
	  $scope.getAllParticipantPossibles = value;
	  $scope.$apply();

	  });

	$scope.getSubmit = function(){
	  listAdd.push($scope.participant);
	  console.log(listAdd);
	  return listAdd;
	}
});


myApp.controller('myInvitationsController', function(accountService, invitationService, $scope, $location) {
	invitationService.findAllInvitationReceived().then(function(invitations) {
		$scope.invitations = invitations;
		$scope.$apply();
	});

	$scope.acceptInvitation = function(invId) {
		invitationService.setInvitationStatusAccepted(invId).then(function(response) {
			if(response == "ok") {
				document.getElementById(invId + '-accept').innerHTML = 'Accepted';
				document.getElementById(invId + '-refuse').innerHTML = '';
			} else {
				alert(response);
			}
		});
	};

	$scope.refuseInvitation = function(invId) {
		invitationService.setInvitationStatusRefused(invId).then(function(response) {
			if(response == "ok") {
				document.getElementById(invId + '-accept').innerHTML = '';
				document.getElementById(invId + '-refuse').innerHTML = 'Refused';
			} else {
				alert(response);
			}
		});
	};
});
