// account[0] = node
// account[1] = deployed AnimistEvent contract

import 'AnimistEvent.sol';

contract ExampleMessage {

    string public uuid;             // Arbitrary v4 characteristic uuid. 
    string public message;          // Message to broadcast at `uuid`
    uint32 public duration;         // Duration (ms) of broadcast
    address public node;            // Address of the broadcasting node (from IPFS)
    address public animistAddress;  // Address of deployed Animist contract for events.
    AnimistEvent public api;        // AnimistEvent contract instance

    function Message(){
        uuid = "A01D64E6-B...7-8338527B4E10";   
        message = "You are beautiful";             
        duration = 3000;                          
        node = address(0x579fadbb36a7b7284ef4e50bbc83f3f294e9a8ec);               
        animistAddress = address(0x2d0b9afbec0c9924a370a3b9035f2d63c36ba025); 

        // Instantiate AnimistEvent contract request broadcast  
        api = AnimistEvent(animistAddress);        
        api.requestMessagePublication(node, uuid, message, duration);    
    }
}