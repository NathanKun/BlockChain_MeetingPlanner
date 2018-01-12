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
	
	function User(){

		User memory user1 = User{
			name: 'n1';
			mail: 'm1';
		}
	}

	// Create a meeting with a description argument
    function CreateMeeting(string _description, bool _required) public {

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






}
