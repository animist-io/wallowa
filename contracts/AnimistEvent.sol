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

    /*
     * @event LogProximityDetection
     * @param {Address} node:  (indexed) Address of the node that should proximity detect the client
     * @param {Address} account: (indexed) Account address of the client to be proximity detected
     * @param {Address} contractAddress: Address of the contract whose verifyPresence method will be executed 
     *                                   to authenticate client's presence at the node.
     *
     */
    event LogProximityDetectionRequest( address indexed node, address indexed account, address indexed contractAddress);
    
   /*
     * @event LogBroadcast
     * @param {Address} node:  (indexed) Address of the node that should proximity detect the client
     * @param {String}  channel: v4 UUID string which will be the identity of the characteristic `message` is broadcast from
     * @param {String}  message: a string with max length 66 (hex prefixed address size) to broadcast from `channel`
     * @param {Number}  duration: length of time in ms to broadcast `message.`
     */
    event LogBroadcastRequest( address indexed node, string channel, string message, uint duration);


    // Event wrappers 
    function requestProximityDetection(address node, address account, address contractAddress) {

        // TO DO: payment for services rendered.

        LogProximityDetectionRequest(node, account, contractAddress);
    }

    function requestBroadcast(address node, string channel, string message, uint duration){

        // TO DO: payment for services rendered.

        LogBroadcastRequest(node, channel, message, duration);
    }
}
