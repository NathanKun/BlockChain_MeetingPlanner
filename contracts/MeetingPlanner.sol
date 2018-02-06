pragma solidity ^0.4.2;

contract MeetingPlanner {

	/* enums */
	enum InvitationStatus {WAITING, RESPONDED}

    enum Status {InPROGRESS, CLOSE}

    uint IN_PROGRESS = 0;
    uint CLOSE = 1;

    /* structures */
	struct User{
		string name;
		string mail;
	}

	struct  Meeting {
		uint id;
		bool required;
		address manager;
		string description;
		string lieu;
		uint32[5] dates;
        Status status;
	}

	struct Invitation {
	    uint id;
		address organizer;
		address participant;
		uint meetingId;
		InvitationStatus invitationStatus;
		uint32[5] datesChoises;
	}

    /* global storages */
	mapping (address => User) userList;

    Meeting[] meetingList;
    Invitation[] invitations;

    /* constructor of contract */
	function MeetingPlanner() public {
	    // seed of user
        userList[0x4db2da7660a1e2edc15cacd815c39d0574103cb3] =
            User("Junyang", "junyang.he@groupe-esigelec.org");
        userList[0x013ba5d38f3a03c63909d48be7a81df2b60a61f4] =
            User("Yuzhou", "yuzhou.song@groupe-esigelec.org");
        userList[0xfac6be69d005caa557b2e36c6fb41959188c438c] =
            User("Charaf", "c.i@groupe-esigelec.org");
        userList[0x465caa1267d97ec054635704ed68102970cb6adc] =
            User("José", "j.d@groupe-esigelec.org");
        userList[0xea8328fca972e48d9bec1039400be99d4ce760be] =
            User("Gael", "g.o@groupe-esigelec.org");

	}

		/* Methods for invitation */
	//get user from account
		function findUserByAddress(address account) constant public returns (string userName, string userMail){
			return (userList[account].name, userList[account].mail);
		}




    /* Methods for Meeting */
	// find meeting by id
	function findMeetingById(uint meetingId) public constant returns(uint id, bool required, address manager,
		string description, string lieu, uint32[5] dates, Status status, uint32[5] finaldateChoise) {
		for(uint i = 0; i < meetingList.length; i++) {
			if(meetingList[i].id == meetingId) {
				uint32[5] memory dateChoisesOfInvitation = [uint32(0), 0, 0, 0, 0];
				for(uint j = 0; j < invitations.length; j++){
					if(invitations[j].meetingId == meetingList[i].id){
						for(uint k=0; k<5; k++){
							dateChoisesOfInvitation[k] = dateChoisesOfInvitation[k] + invitations[j].datesChoises[k];
						}
					}
				}
				return (meetingList[i].id, meetingList[i].required, meetingList[i].manager,
					meetingList[i].description, meetingList[i].lieu, meetingList[i].dates, meetingList[i].status, dateChoisesOfInvitation);
			}
		}
	}
	//Create a meeting with a description argument
    function CreateMeeting(string _description,  bool _required, string _lieu,uint32[5] _dates) public {
    	meetingList.push(
		    Meeting(meetingList.length + 1, _required, msg.sender, _description, _lieu, _dates, Status.InPROGRESS));
    }

    //close a meeting
    function CloseMeeting(uint id) {
		for( uint j=0 ; j < meetingList.length ; j++)  {
			if(meetingList[j].id == id ){
				meetingList[j].status = Status.CLOSE;
			}
        }
    }

	//Search a meeting with some id argument
	function SearchMeeting(uint id) public constant returns
	    (bool exist, uint meeting_id, address manager,string description,
	    bool required, string lieu , uint32[5] dates, Status status) {

		for( uint j=0 ; j < meetingList.length ; j++){
			if(meetingList[j].id == id ){
				return (true, meetingList[j].id, meetingList[j].manager,
    				meetingList[j].description, meetingList[j].required,
    				meetingList[j].lieu, meetingList[j].dates, meetingList[j].status);
			}
        }
    }

	//Delete a meeting with some id argument
	function DeleteMeeting(uint id) public {
		for( uint j=0 ; j < meetingList.length ; j++){
			if(meetingList[j].id == id ){
				delete meetingList[j];
			}
        }
    }

    //get meeting created by an address
	function GetAllMeetingCreated(address adr) public constant returns (uint[20] ids) {
		uint[20] memory meetingIdsOfAddress;
        uint j = 0;
        for (uint i = 0; i < meetingList.length; i++) {
            if(meetingList[i].manager == adr) {
                meetingIdsOfAddress[j] = meetingList[i].id;
                j++;
            }
        }
        return (meetingIdsOfAddress);
    }


    //Get meeting status
    function GetMeetingStatus(uint id) public returns (Status) {
        	for( uint j=0 ; j < meetingList.length ; j++){
			if(meetingList[j].id == id ){
				return meetingList[j].status;
			}
        }
    }


	//set the required attribute of the meeting
    function setMeetingRequired(uint id, bool _required) public returns(bool){
        for( uint j=0 ; j < meetingList.length ; j++){
			if(meetingList[j].id == id ){
				meetingList[j].required = _required;
				return meetingList[j].required;
			}
        }
    }

    //set the manager attribute of the meeting
    function setMeetingManager(uint id,address _manager) public returns(address){
        for( uint j=0 ; j < meetingList.length ; j++){
    		if(meetingList[j].id == id ){
    			meetingList[j].manager = _manager;
    			return meetingList[j].manager;
    		}
        }
    }

    //set the description attribute of the meeting
    function setMeetingDescription(uint id,string _description) public returns(string){
        for( uint j=0 ; j < meetingList.length ; j++){
    		if(meetingList[j].id == id ){
    			meetingList[j].description = _description;
    			return meetingList[j].description;
    		}
        }
    }
    //set the place attribute of the meeting
    function setMeetingPlace(uint id,string _lieu) public returns(string){
        for( uint j=0 ; j < meetingList.length ; j++){
    		if(meetingList[j].id == id ){
    			meetingList[j].lieu = _lieu;
    			return meetingList[j].lieu;
    		}
        }
    }
    // set the date attribute of the meeting
    function setMeetingDates(uint id, uint32[5] _dates) public{
        for( uint j=0 ; j < meetingList.length ; j++){
    		if(meetingList[j].id == id ){
    			meetingList[j].dates = _dates;
    		}
        }
    }


    /* Methods for Invitation */
    // add an new invitations to storage
    function addInvitation(address participant, uint meetingId) public{
        invitations.push(
            Invitation(invitations.length + 1, msg.sender, participant, meetingId,
            InvitationStatus.WAITING, [uint32(0), 0, 0, 0, 0]));
	  }

    // find an invitation by id
    function findInvitationById(uint invitationId) constant public
            returns (uint id, address orga, address part, uint meetingId, InvitationStatus invitationStatus, uint32[5] datesChoises) {
        for (uint i = 0; i < invitations.length; i++) {
            if(invitations[i].id == invitationId) {
                return (invitationId, invitations[i].organizer, invitations[i].participant,
                        invitations[i].meetingId, invitations[i].invitationStatus, invitations[i].datesChoises);
            }
        }
        return (0, 0x0,0x0, 0, InvitationStatus.WAITING, [uint32(0), 0, 0, 0, 0]);
    }

    // change invitationsStatus
    function setInvitationStatus(uint invitationId, InvitationStatus invitationStatus) public returns (bool isFound){
        for (uint i = 0; i < invitations.length; i++) {
            if(invitations[i].id == invitationId) {
                invitations[i].invitationStatus = InvitationStatus(invitationStatus);
                return true;
            }
        }
        return false;
    }

    // change dates choises
    function setInvitationDatesChoises(uint invitationId, uint32[5] _datesChoises) public returns (bool isFound){
        for (uint i = 0; i < invitations.length; i++) {
            if(invitations[i].id == invitationId) {
                invitations[i].datesChoises = _datesChoises;
                return true;
            }
        }
    }



    // find all invitations created by an address
    function findAllInvitationIdCreated(address orga) constant public returns (uint[20] ids){
        uint[20] memory invitationIdsOfAddress;
        uint j = 0;
        for (uint i = 0; i < invitations.length; i++) {
            if(invitations[i].organizer == orga) {
                invitationIdsOfAddress[j] = invitations[i].id;
                j++;
            }
        }
        return (invitationIdsOfAddress);
    }

    // find all invitations received by an address
    function findAllInvitationIdReceived(address part) constant public returns (uint[20] ids){
        uint[20] memory invitationIdsOfAddress;
        uint j = 0;
        for (uint i = 0; i < invitations.length; i++) {
            if(invitations[i].participant == part) {
                invitationIdsOfAddress[j] = invitations[i].id;
                j++;
            }
        }
        return invitationIdsOfAddress;
    }
}
