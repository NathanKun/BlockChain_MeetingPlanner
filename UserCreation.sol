pragma solidity ^0.4.0;

contract UserCreation{

struct User{
    string name;
	string mail;
	string password;
}

User user0 = new User("nom","jose.dossou@groupe-esigelec.org", "mp");
User user1 = new User("nom","jose.dossou@groupe-esigelec.org", "mp");
User user2 = new User("nom","jose.dossou@groupe-esigelec.org", "mp");
User user3 = new User("nom","jose.dossou@groupe-esigelec.org", "mp");
User user4 = new User("nom","jose.dossou@groupe-esigelec.org", "mp");


    function getSHA3Hash(bytes input) returns (bytes32 hashedOutput)
{
    hashedOutput = sha3(input);
}
    getSHA3Hash("mp")
    


function forLoopScoping() public {
for (uint i = 0; i < listofuser.length; i++) {
	listofuser[i]= new List(i);
	
	user(i).name=='listofuser[i]';
		if (listofuser[i] == "user(i).name") {
			return true;
		} 
		else {
			return false;
			}
}
}
}