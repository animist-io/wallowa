// account[0] = node
// account[1] = deployed AnimistEvent contract
pragma solidity 0.4.3;

import 'AnimistEvent.sol';

contract ExampleMessage {

    string public uuid;              // Arbitrary v4 characteristic uuid. 
    string public message;           // Message to broadcast at `uuid`
    bool public messageDelivered;    // Flag set when client reads message from node.
    uint32 public expires;           // Expiration date (ms since Epoch) of broadcast
    address public node;             // Address of the broadcasting node (from IPFS)
    address public authorizedClient; // Address of client who may read the message
    address public animistAddress;   // Address of deployed Animist contract for events.
    AnimistEvent public api;         // AnimistEvent contract instance

    function Message(){
        uuid = "A01D64E6-B...7-8338527B4E10";   
        message = "You are beautiful";             
        expires = 1758497251;                          
        node = address(0x579fadbb36a7b7284ef4e50bbc83f3f294e9a8ec);               
        animistAddress = address(0x2d0b9afbec0c9924a370a3b9035f2d63c36ba025); 

        // Instantiate AnimistEvent contract request broadcast  
        api = AnimistEvent(animistAddress);        
        api.requestMessagePublication(node, uuid, message, expires, address(this));    
    }

    /// Constant method node will invoke to verify that client who connected to it is permitted to 
    // read published message. (This is necessary to protect against spamming the contract ).
    function isAuthorizedToReadMessage( address visitor, string uuid ) constant returns (bool result){

        if (msg.sender == node && visitor == authorizedClient )
            return true;
        else
            return false;
    }

    // Method node will invoke when it allows client to read message from characteristic.
    function confirmMessageDelivery( address visitor, string uuid, uint64 time){
        if (msg.sender == node && visitor == authorizedClient )
            messageDelivered = true;
    } 
}