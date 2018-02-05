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
    .when("/mainpage", {
      templateUrl: "mainPage.html",
      controller: "mainPageController"
    })
    .when("/MeetingIndex", {
      templateUrl: "MeetingIndex.html",
      controller: "createMeetingController"
    })
    .when("/MeetingCreated", {
      templateUrl: "MeetingCreated.html",
      controller: "listMeetingController"
    })
    .when("/addinvitation", {
      templateUrl: "Invitation.html",
      controller: "invitationController"
    })
    .when("/modifyMeeting", {
      templateUrl: "modifyMeeting.html",
      controller: "modifyMeetingController"
    })
    .when("/myinvitations", {
      templateUrl: "myinvitations.html",
      controller: "myInvitationsController"
    });
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
  //$locationProvider.hashPrefix('');

});



/*
 * SERVICES
 */

/* account service */
myApp.service('accountService', function () {
	var accountService = {};

	deployedContract = MeetingPlanner.deployed();

	// all available accounts
	accounts = window.web3.eth.accounts;

	accountService.loggedInUser = undefined;

	accountService.getLoggedInAddress = function() {return this.loggedInUser;};

	accountService.login = function(address) {
		if(accountService.isAddressExists(address)) {
			accountService.loggedInUser = address;
			return true;
		} else {
			accountService.loggedInUser = undefined;
			return false;
		}
	};

	accountService.logout = function() {
		accountService.loggedInUser = undefined;
	}

	accountService.isAddressExists = function(address) {
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

	accountService.findUserByAddress = function(add) {
		return deployedContract.findUserByAddress.call(add).then(function(user) {
			return {"address" : add, "name" : user[0], "email" : user[1]}
		});
	}

	return accountService;
});




/* meeting service */
myApp.service('meetingService', ['accountService', function(accountService) {

	// empty service object
	var meetingService = {};
	var meetingList = [];

	// MeetingPlanner contract
	deployedContract = MeetingPlanner.deployed();

  // add createMeeting function to service
  meetingService.createMeeting = function(description, required, lieu, dates) {
    return deployedContract.CreateMeeting(description, (required == 'true'), lieu, dates, true, {
      from: accountService.getLoggedInAddress()
    });
  }

  //add searchMeeting function to service
  meetingService.searchMeeting = function(id) {
    return deployedContract.SearchMeeting.call(id);
  }
  //get the meeting list
  meetingService.getMeetingById = function(id) {
    return deployedContract.GetMeetingById.call(id);
  }

  //get the meetings created by an address
  meetingService.getMeetingCreated = function(address) {
    return deployedContract.GetAllMeetingCreated(address).then(function(ids){
		var promises = [];
		for( var i = 0; i < ids.length; i++){
			var id = ids[i].toNumber();
			if(id != 0) {
				 promises.push(meetingService.findMeetingById(id));
			}
		}
		return Promise.all(promises).then(function(meetings) {
			//console.log(meetings);
			return meetings;
		});
    });
  }


  meetingService.findMeetingById = function(meetingId) {
		return deployedContract.findMeetingById.call(meetingId).then(function(mt) {
			var dates = mt[5];
			var datesToShow = [];
			for(var i = 0; i < dates.length; i++) {
				datesToShow.push(unixToDate(dates[i].toNumber()));
			}
			//console.log(datesToShow);
			// uint id, bool required, address manager, string description, string lieu, uint date, Status status
			return {"id" : mt[0].toNumber(), "required" : mt[1], "organizer" : mt[2], "description" : mt[3],
				"place" : mt[4], "dates" : datesToShow, "statusNumber" : mt[6].toNumber(),
				"statusString" : mt[6].toNumber() == 0 ? "In progress" : "Closed"};
		});
	}

	meetingService.closeMeeting = function(meetingId) {
		return deployedContract.CloseMeeting(meetingId, {from: accountService.loggedInUser});
	}

	meetingService.setMeetingDescription = function(meetingId, newDesc) {
		return deployedContract.setMeetingDescription(meetingId, newDesc, {from: accountService.loggedInUser});
	}

	meetingService.setMeetingPlace = function(meetingId, newPlace) {
		return deployedContract.setMeetingPlace(meetingId, newPlace, {from: accountService.loggedInUser});
	}

	meetingService.setMeetingDates = function(meetingId, newDates) {
		deployedContract.setMeetingDates(meetingId, newDates, {from: accountService.loggedInUser});
	}

	meetingService.setMeetingRequired = function(meetingId, newReq) {
		return deployedContract.setMeetingRequired(meetingId, (newReq == 'true'), {from: accountService.loggedInUser});
	}

  //return completed service
  return meetingService;

}]);



/* invitation service */
myApp.service('invitationService', ['accountService', 'meetingService', function(accountService, meetingService) {

  var invitationService = {};
  deployedContract = MeetingPlanner.deployed();

  // local function to change invitation status
  function setInvitationStatus(invitationId, invStatus) {
    return deployedContract.setInvitationStatus(invitationId, invStatus, {
      from: accountService.loggedInUser
    }).then(
      function(value) {
        if (value) return "ok";
        else return "invitation id not exists";
      }
    );
  };

  // call add invitation function in contract
  invitationService.addInvitation = function(participantAddr, meetingId) {
    if (!accountService.isAddressExists(accountService.loggedInUser)) return "organizer address not exists";
    if (!accountService.isAddressExists(participantAddr)) return "participant address not exists";
    if (!meetingService.searchMeeting(meetingId)) return "meeting id not exists";

    return deployedContract.addInvitation(participantAddr, meetingId, {
      from: accountService.loggedInUser
    }).then(
      function() {
        return "ok";
      });

  };

  // call find invitation by id function in contract, return json with infos of invitation
  invitationService.findInvitationById = function(invitationId) {
    //console.log(invitationId);
    return deployedContract.findInvitationById.call(invitationId).then(function(inv) {
		var datesToShow = [];
		for(var i = 0; i < 5; i++) {
			datesToShow.push(inv[5][i].toNumber() == 0 ? false : true);
		}
      return {
        "id": inv[0].toNumber(),
        "organizer": inv[1],
        "participant": inv[2],
        "meetingId": inv[3].toNumber(),
        "statusNumber": inv[4].toNumber(),
        "statusString": invitationStatusNumberToString(inv[4].toNumber()),
		"datesChoises": datesToShow
      };
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

  invitationService.setInvitationDatesChoises = function(invitationId, newDatesChoises) {
	  return deployedContract.setInvitationDatesChoises(invitationId, newDatesChoises, {from: accountService.loggedInUser});
  }

  // call find all invitation id created function in contract, return json array
  invitationService.findAllInvitationIdCreated = function() {
    return deployedContract.findAllInvitationIdCreated(accountService.loggedInUser);
  };

  // call find all invitation id received function in contract, return json array
  invitationService.findAllInvitationReceived = function() {
    // find all invitations' id
    return deployedContract.findAllInvitationIdReceived.call(accountService.loggedInUser).then(function(values) {
      var promises = [];
      for (var i = 0; i < values.length; i++) {
        var id = values[i].toNumber();
        if (id != 0) {
          //console.log(id);
          // find all invitations by invitationId in idList
          var prom = invitationService.findInvitationById(id).then(function(invitation) {
            // find meeting by meetingId found in invitation
            return meetingService.findMeetingById(invitation.meetingId).then(function(meeting) {
              // find organizer name by address from invitation.organizer
              return accountService.findUserByAddress(invitation.organizer).then(function(org) {
                //console.log(invitation);
                //console.log(meeting);
                //console.log(org);

                return {
                  "id": invitation.id,
                  "description": meeting.description,
                  "dates": meeting.dates,
                  "datesChoises": invitation.datesChoises,
                  "place": meeting.place,
                  "meetingStatus": meeting.statusString,
                  "invitationStatus": invitation.statusString,
                  "organizer": org.name
                };
              });
            });
          });
          promises.push(prom);
        }

      }

      return Promise.all(promises).then(function(values) {
        //console.log(values);
        return values;
      });
    });
  };

  function invitationStatusNumberToString(number) {
    return ["WAITING", "RESPONSED"][number]
  }

  function invitationStatusStringToNumber(string) {
    switch (string) {
      case "WAITING":
        return 0;
      case "RESPONSED":
        return 1;
      default:
        return "Status not exists";
    }
  }


  //Return a list of all participants possible
  invitationService.findAllParticipantPossible = function(msgSender) {
    var allAccount = accountService.getAccounts();
    var listPromises = [];
    var listUser = [];
    for (i = 0; i < allAccount.length; i++) {
      listPromises.push(
        deployedContract.findUserByAddress.call(allAccount[i]).then(function(value) {
          return value;
        })
      );
    }
    return Promise.all(listPromises).then(function(values) {
      for (var i = 0; i < values.length; i++) {
        values[i].push(allAccount[i]);
        listUser[i] = values[i];
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

myApp.controller('listMeetingController', function(meetingService, accountService, $scope, $location) {
  var meetingList = [];

  meetingService.getMeetingCreated(accountService.getLoggedInAddress()).then(function(mt){
    $scope.meetingList = mt;
    //console.log($scope.meetingList)
    $scope.$apply();
  });


  $scope.returnToIndex = function() {
	  $location.path('/mainpage');
  };

  $scope.goToModifyMeeting = function(meetingId) {
	  $location.path('/modifyMeeting').search({"meetingId" : meetingId});
  }

  $scope.addInvitation = function(meetingId) {
	  $location.path('/addinvitation').search({"meetingId" : meetingId});
  }

  $scope.closeMeeting = function(meetingId) {
	  meetingService.closeMeeting(meetingId).then(function(){
		document.getElementById('status-' + meetingId).innerHTML = 'Closed';
		document.getElementById('btn1-' + meetingId).innerHTML = 'Closed';
		document.getElementById('btn2-' + meetingId).innerHTML = 'Closed';
		document.getElementById('btn3-' + meetingId).innerHTML = 'Closed';
	  });
  }
});

//controller for MeetingIndex page
myApp.controller('createMeetingController', function(meetingService, accountService, $scope, $location) {

	//create meeting function for button 'Create'
	$scope.createMeeting = function() {
		var datesToSave = [];
		datesToSave.push(dateToUnix($scope.date1 + " " + $scope.time1));
		datesToSave.push(dateToUnix($scope.date2 + " " + $scope.time2));
		datesToSave.push(dateToUnix($scope.date3 + " " + $scope.time3));
		datesToSave.push(dateToUnix($scope.date4 + " " + $scope.time4));
		datesToSave.push(dateToUnix($scope.date5 + " " + $scope.time5));

		//call createContract() in MeetingIndexService service and pass 'description' from page to it
		meetingService.createMeeting($scope.description, $scope.selectedRequired, $scope.lieu, datesToSave).then(function(){
			alert("Meeting created");
		});
	}

	$scope.returnToIndex = function() {
		$location.path('/mainpage');
	};

	var showingDiv = 1;
	$scope.addDateDiv = function () {
		if(showingDiv < 5){
			showingDiv++;
			$('#div-date-' + showingDiv).show();
			$('#meetingbox').css('height', parseInt($('#meetingbox').css('height').replace('px', '')) + 88 + "px");
		}
	}
});

myApp.controller('modifyMeetingController', function(meetingService, $scope, $location) {
	var meetingId = $location.search().meetingId;

	$scope.showingDiv = 1;
	$scope.addDateDiv = function () {
		if($scope.showingDiv < 5){
			$scope.showingDiv++;
			$('#meetingbox').css('height', parseInt($('#meetingbox').css('height').replace('px', '')) + 88 + "px");
		}
	};

	meetingService.findMeetingById(meetingId).then(function(mt) {
		var dates = mt.dates;

		// find how many date have been recored, and show them.

		$scope.showingDiv = dates[0] == 0 ? 0 : (dates[1] == 0 ? 1 : (dates[2] == 0 ? 2 : dates[3] == 0 ? 3 : (dates[4] == 0 ? 4 : 5)));
		$('#meetingbox').css('height', 648 + 88 * ($scope.showingDiv - 1) + "px");
		console.log($scope.showingDiv);

		$scope.date1 = dates[0] == 0 ? undefined : (new Date(dates[0].split(" ")[0]));
		$scope.date2 = dates[1] == 0 ? undefined : (new Date(dates[1].split(" ")[0]));
		$scope.date3 = dates[2] == 0 ? undefined : (new Date(dates[2].split(" ")[0]));
		$scope.date4 = dates[3] == 0 ? undefined : (new Date(dates[3].split(" ")[0]));
		$scope.date5 = dates[4] == 0 ? undefined : (new Date(dates[4].split(" ")[0]));
		$scope.time1 = dates[0] == 0 ? undefined : (dates[0].split(" ")[1]);
		$scope.time2 = dates[1] == 0 ? undefined : (dates[1].split(" ")[1]);
		$scope.time3 = dates[2] == 0 ? undefined : (dates[2].split(" ")[1]);
		$scope.time4 = dates[3] == 0 ? undefined : (dates[3].split(" ")[1]);
		$scope.time5 = dates[4] == 0 ? undefined : (dates[4].split(" ")[1]);

		$scope.place = mt.place;
		$scope.required = mt.required;
		$scope.description = mt.description;

		$scope.$apply();
	});

	$scope.modifyMeeting = function() {
		var datesToSave = [];
		datesToSave.push($scope.time1 == undefined ? 0 : (dateToUnix($scope.date1 + " " + $scope.time1)));
		datesToSave.push($scope.time2 == undefined ? 0 : (dateToUnix($scope.date2 + " " + $scope.time2)));
		datesToSave.push($scope.time3 == undefined ? 0 : (dateToUnix($scope.date3 + " " + $scope.time3)));
		datesToSave.push($scope.time4 == undefined ? 0 : (dateToUnix($scope.date4 + " " + $scope.time4)));
		datesToSave.push($scope.time5 == undefined ? 0 : (dateToUnix($scope.date5 + " " + $scope.time5)));

		meetingService.setMeetingDates(meetingId, datesToSave);
		meetingService.setMeetingDescription(meetingId, $scope.description);
		meetingService.setMeetingRequired(meetingId, $scope.selectedRequired);
		meetingService.setMeetingPlace(meetingId, $scope.place);

		alert("Meeting Modified");
	}

	$scope.returnToMeetingList = function() {
		$location.path('/MeetingCreated');
	};
});


myApp.controller('LoginController', function(accountService, $scope, $location) {
  $scope.title = "Welcome to the meeting planner!";
  $scope.verifiyLogin = function() {
    if (accountService.login($scope.address))
      $location.path('/mainpage');
    else
      alert("Address incorrect.");
  }
});

//#############################################################################################################
myApp.controller('invitationController', function(accountService, invitationService, meetingService, $scope, $location) {
  var listAdd = [];
  //Find all possible participants
  invitationService.findAllParticipantPossible().then(function(value) {
    $scope.getAllParticipantPossibles = value;
    $scope.$apply();
  });

  $scope.returnToMeetingList = function() {
	  $location.path('/MeetingCreated');
  };

  //Create invitation into invitation list
  $scope.addInvitation = function() {
    // listAdd.push($scope.participant);

    //console.log($scope.participant);
    invitationService.addInvitation($scope.participant, $location.search().meetingId);
    getAllInvitations();
  }

  //Find all invitations of a meeting
  getAllInvitations();

   function getAllInvitations() {
    var thisMeetingId = $location.search().meetingId;
    var invitationList = [];
    var prom = [];
    //console.log("this meeting id:" + thisMeetingId);

    return invitationService.findAllInvitationIdCreated().then(function(Invitations) {
      for (i = 0; i < Invitations.length; i++) {
        if(Invitations[i].toNumber() != 0){
          prom.push(
            invitationService.findInvitationById(Invitations[i].toNumber()).then(function(InvitationFound) {
              //console.log(InvitationFound);
              return accountService.findUserByAddress(InvitationFound.participant).then(function(UserFound){
                //console.log(UserFound.name + InvitationFound.);
                return {
                  "meetingId" : InvitationFound.meetingId,
                  "UserName": UserFound.name,
                  "Status":InvitationFound.statusString
                };
              });
            })
          );
        }
      };
      return Promise.all(prom).then(function(values) {
        for (j = 0; j < values.length; j++) {
          //console.log(values[j].meetingId + " : " + thisMeetingId);
          if(values[j].meetingId == thisMeetingId) {
            invitationList.push(values[j]);
          }
        }
        //console.log(invitationList);
        $scope.invitations = invitationList;
        $scope.$apply();
      });

    });
  }

});


myApp.controller('myInvitationsController', function(accountService, invitationService, $scope, $location) {
	invitationService.findAllInvitationReceived().then(function(invitations) {
		console.log(invitations);
		$scope.invitations = invitations;
		$scope.$apply();
	});

	$scope.proposeDate = function(invId) {
		var btn = $('#propose-' + invId);
		console.log(btn)
		btn.replaceWith(angular.element('<input type="date" ng-model="invitations[$index].proposal" class="form-input" />'));
		btn.after(angular.element('<button class="btn btn-info" ng-click="proposeDateConfirm(inv.id)">Proproser</button>'));
	};

	$scope.acceptInvitation = function(invId) {
		var datesChoises;
		for(var i = 0; i < $scope.invitations.length; i++) {
			if($scope.invitations[i].id == invId){
				datesChoises = $scope.invitations[i].datesChoises.slice(0); // clone array
				break;
			}
		}

		for(var i = 0; i < 5; i++) {
			switch(datesChoises[i]) {
				case true:
				case 1:
					datesChoises[i] = 1;
					break;

				case false:
				case 0:
					datesChoises[i] = 0;
				break;

				default:
				break;
			}
		}
		invitationService.setInvitationDatesChoises(invId, datesChoises).then(function(isFound) {
			invitationService.setInvitationStatusAccepted(invId).then(function(response) {
				if (response == "ok" && isFound) {
					document.getElementById(invId + '-response').innerHTML = 'RESPONSED';
				} else {
					alert(response);
				}
			});
		});

		console.log($scope.invitations);
	};

  $scope.returnToIndex = function() {
	  $location.path('/mainpage');
  };
});

myApp.controller('mainPageController', function(accountService, $location, $scope) {
	accountService.findUserByAddress(accountService.loggedInUser).then(function(user){
		//console.log(user);
		$scope.name = user.name;
		$scope.$apply();
	});
  $scope.logout = function() {
    $location.path('/');
    accountService.logout();
  }
	$scope.createMeeting = function() { $location.path('/MeetingIndex'); }
	$scope.listMeeting = function() { $location.path('/MeetingCreated'); }
	$scope.myInvitations = function() { $location.path('/myinvitations'); };
});


function unixToDate(unix) {
	if(unix == 0) return 0;

	// Create a new JavaScript Date object based on the timestamp
	// multiplied by 1000 so that the argument is in milliseconds, not seconds.
	var dt = new Date(unix*1000);
	var year = dt.getFullYear();
	var month = dt.getMonth() + 1;
	var day = dt.getDate();
	var time = dt.getHours() == 0 ? "AM" : "PM";

	// Will display time in 10:30:23 format
	return year + "-" + month + "-" + day + " " + time;
}

function dateToUnix(date) {
	if(date == 0) return 0;

	date = formatDate(date);

	// date to second + AM(0)/PM(12 hours)
	var rt = parseInt((new Date(date.split(" ")[0]).getTime() / 1000).toFixed(0)) + parseInt(date.split(" ")[1] == 'AM' ? 0 : 60 * 60 * 12);
	if(rt == NaN)
		return 0;
	return rt;
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}
