pragma solidity ^0.4.2;

contract MeetingPlanner {
	
	/* enums */
	enum InvitationStatus {WAITING, ACCEPTED, REFUSED, CANCELED}

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
		uint date;
	}
	
	struct Invitation {
	    uint id;
		address organizer;
		address participant;
		uint meetingId;
		InvitationStatus invitationStatus;
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
		
		// seed of meeting
		meetingList.push(Meeting({id: 1, manager: 0x4db2da7660a1e2edc15cacd815c39d0574103cb3,
			description: "meeting 1", required: true , lieu: 'rue m1', date: 1}));
		meetingList.push(Meeting({id: 2, manager: 0x4db2da7660a1e2edc15cacd815c39d0574103cb3,
			description: "meeting 1", required: true , lieu: 'rue m1', date: 2}));
		meetingList.push(Meeting({id: 3, manager: 0x4db2da7660a1e2edc15cacd815c39d0574103cb3,
			description: "meeting 1", required: true , lieu: 'rue m1', date: 3}));
		// seed of invitation
        invitations.push(
            Invitation({id: 1, organizer: 0x465caa1267d97ec054635704ed68102970cb6adc, 
			participant: 0x013ba5d38f3a03c63909d48be7a81df2b60a61f4, meetingId: 1, invitationStatus: InvitationStatus.WAITING}));
        invitations.push(
            Invitation({id: 2, organizer: 0x465caa1267d97ec054635704ed68102970cb6adc, 
			participant: 0x013ba5d38f3a03c63909d48be7a81df2b60a61f4, meetingId: 2, invitationStatus: InvitationStatus.WAITING}));
        invitations.push(
            Invitation({id: 3, organizer: 0x465caa1267d97ec054635704ed68102970cb6adc, 
			participant: 0x013ba5d38f3a03c63909d48be7a81df2b60a61f4, meetingId: 3, invitationStatus: InvitationStatus.WAITING}));
	}

    /* Methods for Meeting */
	// Create a meeting with a description argument/*
    function CreateMeeting(string _description, bool _required) public {

		meetingList.push(Meeting({
			id: 1,
			manager: msg.sender,
			description: _description,
		    required: _required ,
		    lieu: 'rue',
		    date: 8
		}));
    }

	//Search a meeting with some id argument
	function SearchMeeting(uint id) public constant returns (bool exist) {

		for( uint j=0 ; j < meetingList.length ; j++){
			if(meetingList[j].id == id ){
				return true;
			}
			else {
				return false;
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


	// set the required attribute of the meeting
    function setMeetingRequired(uint id,bool _required) public returns(bool){
        for( uint j=0 ; j < meetingList.length ; j++){
			if(meetingList[j].id == id ){
				meetingList[j].required = _required;
				return meetingList[j].required;
			}
        }
    }
    // set the manager attribute of the meeting
    function setMeetingManager(uint id,address _manager) public returns(address){
        for( uint j=0 ; j < meetingList.length ; j++){
    		if(meetingList[j].id == id ){
    			meetingList[j].manager = _manager;
    			return meetingList[j].manager;
    		}
        }
    }

    //  set the description attribute of the meeting
    function setMeetingDescription(uint id,string _description) public returns(string){
        for( uint j=0 ; j < meetingList.length ; j++){
    		if(meetingList[j].id == id ){
    			meetingList[j].description = _description;
    			return meetingList[j].description;
    		}
        }
    }
    // set the place attribute of the meeting
    function setMeetingPlace(uint id,string _lieu) public returns(string){
        for( uint j=0 ; j < meetingList.length ; j++){
    		if(meetingList[j].id == id ){
    			meetingList[j].lieu = _lieu;
    			return meetingList[j].lieu;
    		}
        }
    }
    // set the date attribute of the meeting
    function setMeetingDate(uint id,uint _date) public returns(uint){
        for( uint j=0 ; j < meetingList.length ; j++){
    		if(meetingList[j].id == id ){
    			meetingList[j].date = _date;
    			return meetingList[j].date;
    		}
        }
    }
	
	function findMeetingById(uint id) public constant returns() {
		
	}

    /* Methods for Invitation */
    // add an new invitations to storage
    function addInvitation(address participant, uint meetingId) public {
        invitations.push(
            Invitation(invitations.length + 1, msg.sender, participant, meetingId, InvitationStatus.WAITING));
    }
    
    // find an invitation by id
    function findInvitationById(uint invitationId) constant public 
            returns (uint id, address orga, address part, uint meetingId, InvitationStatus invitationStatus) {
        for (uint i = 0; i < invitations.length; i++) {
            if(invitations[i].id == invitationId) {
                return (invitationId, invitations[i].organizer, invitations[i].participant,
                        invitations[i].meetingId, invitations[i].invitationStatus);
            }
        }
        return (0, 0x0,0x0, 0, InvitationStatus.CANCELED);
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
