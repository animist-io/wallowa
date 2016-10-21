/** 
Every Animist endpoint filters via the 'node' topic for events on this contract 
Use within an Animist contract:
    
    (after importing AnimistEvent.sol)
    
    address contract_address = some_nodes_AnimistEvent_address;
    AnimistEvent instance = AnimistEvent(contract_address);
    instance.register(node_address, account_address, address(this));
    instance.broadcast(node_address, uint value, uint expires);

Security issues: spamming a node. */

contract AnimistEvent {

    /*
     * @event LogProximityDetectionRequest
     * @param {Address} node:  (indexed) Address of the node that should proximity detect the client
     * @param {Address} account: (indexed) Account address of the client to be proximity detected
     * @param {Address} contractAddress: Address of the contract whose verifyPresence method will be executed 
     *                                   to authenticate client's presence at the node.
     *
     */
    event LogPresenceVerificationRequest( address indexed node, address indexed account, address indexed contractAddress);
    
   /*
     * @event LogMessagePublicationRequest
     * @param {Address} node:  (indexed) Address of the node that should publish requested message.
     * @param {String}  uuid: v4 UUID string which will be the identity of the characteristic `message` is broadcast from
     * @param {String}  message: a string with max length 66 (hex prefixed address size) to broadcast from `channel`
     * @param {Number}  expires: Expiration date of broadcast (in ms from Epoch) 
     */
    event LogMessagePublicationRequest( address indexed node, string uuid, string message, uint32 expires);

    /*
     * @event LogBeaconBroadcastRequest
     * @param {Address} node:  (indexed) Address of the node that should broadcast requested beacon.
     * @param {String}  uuid: v4 UUID string which will be the identity of the broadcast beacon. Whale-island will
                              then generate random values for the `major` and `minor` beacon components and invoke
                              `contractAddress`'s submitSignedBeacon method, passing it a web3 signed version of the string:
                              '<uuid>:<major:<minor>'.
     * @param {Address} contractAddress: address of the contract requesting this service. It must implement a method 
                       with the function signature `submitSignedBeacon( bytes32 hash )`
     */
    event LogBeaconBroadcastRequest( address indexed node, string uuid, address contractAddress );

    // ------------------------------------------  Event wrappers ------------------------------------------------------
    // NB: There will eventually need to be logic here for compensating the node for providing these services. Some sort
    // of payment will be sent to these methods.

    function requestPresenceVerification(address node, address account, address contractAddress) {

        LogPresenceVerificationRequest(node, account, contractAddress);
    }

    function requestMessagePublication(address node, string uuid, string message, uint32 expires){

        LogMessagePublicationRequest(node, uuid, message, expires);
    }

    function requestBeaconBroadcast(address node, string uuid, address contractAddress ){

        LogBeaconBroadcastRequest( node, uuid, contractAddress );

    }

}
