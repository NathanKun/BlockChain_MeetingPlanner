pragma solidity ^0.4.8;

contract MeetingPlanner {

	/* enums */
	enum MeetingStatus {WAITING, ACCEPTED, REFUSED, CANCELED}

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
		uint date;
        Status status;
	}

	struct Invitation {
	    uint id;
		address organizer;
		address participant;
		uint meetingId;
		MeetingStatus meetingStatus;
	}

    /* global storages */
	mapping (address => User) userList;
    Meeting[] meetingList;
    Invitation[] invitations;

    /* constructor of contract */
	function MeetingPlanner() public {
	    // seed of user
        userList[0x4dB2Da7660a1E2eDc15CAcD815c39D0574103Cb3] =
            User("Junyang", "junyang.he@groupe-esigelec.org");
        userList[0x013BA5D38F3A03C63909d48be7A81Df2B60A61F4] =
            User("Yuzhou", "yuzhou.song@groupe-esigelec.org");
        userList[0xfAc6Be69d005cAA557B2e36c6FB41959188C438c] =
            User("Charaf", "c.i@groupe-esigelec.org");
        userList[0x465CaA1267d97eC054635704Ed68102970CB6Adc] =
            User("José", "j.d@groupe-esigelec.org");
        userList[0xeA8328FcA972E48D9beC1039400be99D4cE760BE] =
            User("Gael", "g.o@groupe-esigelec.org");
	}

    // Research user name
    //function getName(address adr) public returns(string name){
      //      if(userList[address] == adr ){
        //        return userList[address].name;
          //  }
            //else {
              //  return "null";
            //}
    //}

    /* Methods for Meeting */
	//Create a meeting with a description argument
    function CreateMeeting(string _description,  bool _required, string _lieu,uint _date) public {
    	meetingList.push(
		    Meeting(meetingList.length + 1  , _required, msg.sender  , _description ,_lieu, _date,Status.InPROGRESS));
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
	function SearchMeeting(uint id) public constant returns (bool exist,uint meeting_id, address manager,string description, bool required, string lieu , uint date, Status status) {

		for( uint j=0 ; j < meetingList.length ; j++){
			if(meetingList[j].id == id ){
				return (true, meetingList[j].id ,meetingList[j].manager ,meetingList[j].description, meetingList[j].required, meetingList[j].lieu, meetingList[j].date, meetingList[j].status);
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

    //get meeting list
	function GetMeetingById(uint input) public constant returns (bool exist,uint id, address manager,string description, bool required, string lieu , uint date) {
		for( uint j=0 ; j < meetingList.length ; j++){
			if(meetingList[j].id == input){
                return  (true, meetingList[j].id,meetingList[j].manager ,meetingList[j].description, meetingList[j].required, meetingList[j].lieu, meetingList[j].date);
			}

        }
    }

    //get meeting created by an address
	function GetAllMeetingCreated(address adr) public constant returns (uint[] ids) {
		uint[] memory meetingIdsOfAddress = new uint[](meetingList.length);
        uint j = 0;
        for (uint i = 0; i <= meetingList.length; i++) {
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
    function setMeetingRequired(uint id,bool _required) public returns(bool){
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
    function setMeetingDate(uint id,uint _date) public returns(uint){
        for( uint j=0 ; j < meetingList.length ; j++){
    		if(meetingList[j].id == id ){
    			meetingList[j].date = _date;
    			return meetingList[j].date;
    		}
        }
    }


    /* Methods for Invitation */
    // add an new invitations to storage
    function addInvitation(address participant, uint meetingId) public {
        invitations.push(
            Invitation(invitations.length + 1, msg.sender, participant, meetingId, MeetingStatus.WAITING));
    }

    //find an invitation by id
    function findInvitationById(uint invitationId) constant public
            returns (uint id, address orga, address part, uint meetingId, MeetingStatus meetingStatus) {
        for (uint i = 0; i <= invitations.length; i++) {
            if(invitations[i].id == invitationId) {
                return (invitationId, invitations[i].organizer, invitations[i].participant,
                        invitations[i].meetingId, invitations[i].meetingStatus);
            }
        }
        return (0, 0x0,0x0, 0, MeetingStatus.CANCELED);
    }

    //change invitationsStatus
    function setInvitationStatus(uint invitationId, MeetingStatus meetingStatus) public returns (bool isFound){
        for (uint i = 0; i < invitations.length; i++) {
            if(invitations[i].id == invitationId) {
                invitations[i].meetingStatus = MeetingStatus(meetingStatus);
                return true;
            }
        }
        return false;
    }

    // find all invitations created by an address
    function findAllInvitationIdCreated() constant public returns (uint[] ids){
        uint[] memory invitationIdsOfAddress = new uint[](invitations.length);
        uint j = 0;
        for (uint i = 0; i <= invitations.length; i++) {
            if(invitations[i].organizer == msg.sender) {
                invitationIdsOfAddress[j] = invitations[i].id;
                j++;
            }
        }
        return (invitationIdsOfAddress);
    }

    // find all invitations received by an address
    function findAllInvitationReceived() constant public returns (uint[] ids){
        uint[] memory invitationIdsOfAddress = new uint[](invitations.length);
        uint j = 0;
        for (uint i = 0; i <= invitations.length; i++) {
            if(invitations[i].participant == msg.sender) {
                invitationIdsOfAddress[j] = invitations[i].id;
                j++;
            }
        }
        return (invitationIdsOfAddress);
    }

}
