pragma solidity ^0.4.2;

contract MeetingPlanner {

	struct Meeting {
		uint id;
		bool required;
		string manager;
		string description;
		string lieu;
		uint date;
	}

    string name;

	function MeetingPlanner() {

	}

	// Create a meeting with a description argument
    function CreateMeeting(string description) public {
		Meeting memory newMeeting =  Meeting({
			id: 1,
			manager: name,
			description: description,
		    required: false ,
		    lieu: 'rue',
		    date: 8
		});
    }

	//Search a meeting with some id argument
	function SearchMeeting(uint id ) public returns (bool exist){
    uint j;
    for( j=0 ; j < Meeting_List[].length() ; j++){
        if(Meeting[j].id == id ){
            return true;
        }
        else {
            return false;
        }
        }
    }
}
