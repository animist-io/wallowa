// accounts[0] = client
// accounts[1] = node
// accounts[2] = deployed AnimistEvents contract

import 'AnimistEvent.sol';

contract ExampleVisit {

    address public client;          // Client to proximity detect     
    address public node;            // Node client should visit (from IPFS)
    address public animistAddress;  // Deployed Animist contract for events.          
    bool public visited;            // Client state prior to proximity detection        
    uint64 public expires;          // Date (since Epoch) client must visit by  
    AnimistEvent public api;        // AnimistEvent contract instance.

    function Visit(){
        client = address(0x579fadbb36a7b7284ef4e50bbc83f3f294e9a8ec);         
        node = address(0x2d0b9afbec0c9924a370a3b9035f2d63c36ba025);            
        animistAddress = address(0x4831cd954dd087f17dced24c6bda76a598ec242a); 
        visited = false;                        
        expires = 175232548098;                  

        // Instantiate AnimistEvent contract and request proximity detection
        api = AnimistEvent(animistAddress);    
        api.requestPresenceVerification(node, client, address(this));
    }

    // Implement method the node will execute on proximity detection
    function verifyPresence(address visitor, uint64 time) {
        if (msg.sender == node && visitor == client && time <= expires){
            visited = true;
        }
    }

    // Client could execute this method on whale-island over Bluetooth using the sendTx endpoint.
    function rewardVisit() {
        if( msg.sender == client && visited == true){
            
        }
    }
}