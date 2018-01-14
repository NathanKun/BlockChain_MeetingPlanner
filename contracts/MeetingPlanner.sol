pragma solidity ^0.4.2;

contract MeetingPlanner {

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

	mapping (address => User) UserList;
    Meeting[] Meeting_List;

	function MeetingPlanner() {

	}


	/*function User(){
		User memory user1 = User{
			name: 'n1';
			mail: 'm1';
			}
	}*/

	// Create a meeting with a description argument
    function CreateMeeting(string _description, bool _required){

		Meeting_List.push(Meeting({
			id: 1,
			manager: msg.sender,
			description: _description,
		    required: _required ,
		    lieu: 'rue',
		    date: 8
		}));
    }

	//Search a meeting with some id argument
	function SearchMeeting(uint id) public returns (bool exist){

		for( uint j=0 ; j < Meeting_List.length ; j++){
			if(Meeting_List[j].id == id ){
				return true;
			}
			else {
				return false;
			}
        }
    }

	//Delete a meeting with some id argument
	function DeleteMeeting(uint id) {
		for( uint j=0 ; j < Meeting_List.length ; j++){
			if(Meeting_List[j].id == id ){
				delete Meeting_List[j];
			}
        }
    }


	// set the required attribute of the meeting
    function setMeetingRequired(uint id,bool _required) public returns(bool){
        for( uint j=0 ; j < Meeting_List.length ; j++){
			if(Meeting_List[j].id == id ){
				Meeting_List[j].required = _required;
				return Meeting_List[j].required;
			}
        }
    }
    // set the manager attribute of the meeting
    function setMeetingManager(uint id,address _manager) public returns(address){
        for( uint j=0 ; j < Meeting_List.length ; j++){
    		if(Meeting_List[j].id == id ){
    			Meeting_List[j].manager = _manager;
    			return Meeting_List[j].manager;
    		}
        }
    }

    //  set the description attribute of the meeting
    function setMeetingDescription(uint id,string _description) public returns(string){
        for( uint j=0 ; j < Meeting_List.length ; j++){
    		if(Meeting_List[j].id == id ){
    			Meeting_List[j].description = _description;
    			return Meeting_List[j].description;
    		}
        }
    }
    // set the place attribute of the meeting
    function setMeetingPlace(uint id,string _lieu) public returns(string){
        for( uint j=0 ; j < Meeting_List.length ; j++){
    		if(Meeting_List[j].id == id ){
    			Meeting_List[j].lieu = _lieu;
    			return Meeting_List[j].lieu;
    		}
        }
    }
    // set the date attribute of the meeting
    function setMeetingDate(uint id,uint _date) public returns(uint){
        for( uint j=0 ; j < Meeting_List.length ; j++){
    		if(Meeting_List[j].id == id ){
    			Meeting_List[j].date = _date;
    			return Meeting_List[j].date;
    		}
        }
    }





}
