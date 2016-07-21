/** 
Every Animist endpoint has an events contract deployed to the 
the chain that can be called by other contracts
to notify the endpoint that the calling contract will request services from it.

These addresses can be found on IPFS at . . . . someday.

Use within an Animist contract:
    
    (after importing AnimistEvent.sol)
    
    address contract_address = some_nodes_AnimistEvent_address;
    AnimistEvent instance = AnimistEvent(contract_address);
    instance.register(node_address, account_address, address(this));
    instance.broadcast(node_address, uint value, uint duration);

Security issues: spamming a node. */

contract AnimistEvent {

    // LogRegistration(node, account, contract)
    // node: the account address of the node targeted by this event
    // account: the user account the node will expect to interact with.
    // contract: the address of the contract node will invoke Animist API functions on.*/
    event LogRegistration( address indexed node, address indexed account, address indexed contractAddress);
    
    // LogBroadcast(node, channel, duration)
    // node: the account address of the node targeted by this event
    // channel: not sure. (a characteristic string though, right?)
    // duration: don't know. Default? 
    event LogBroadcast( address indexed node, uint indexed channel, uint indexed value);


    // Event wrappers 
    function register(address node, address account, address contractAddress) {
        LogRegistration(node, account, contractAddress);
    }

    function broadcast(address node, uint channel, uint val){
        LogBroadcast(node, channel, val);
    }
}