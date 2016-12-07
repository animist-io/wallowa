/** 
Every Animist endpoint filters via the 'node' topic for events on this contract 
Example use within an Animist contract:
    
    (after importing AnimistEvent.sol)
    
    address contract_address = deployedAnimistEventContract_address;
    AnimistEvent instance = AnimistEvent(contract_address);
    instance.requestPresenceVerification(node_address, mobileClient_address, address(this));
    
*/
pragma solidity ^0.4.3;


contract AnimistEvent {
    /*
     * @event LogProximityDetectionRequest
     * @param {Address} node:  Address of the node that should proximity detect the client
     * @param {Address} account:  Account address of the client to be proximity detected
     * @param {Address} contractAddress: Address of the contract whose verifyPresence method will be executed 
     *                                   to authenticate client's presence at the node.
     *
     */
    event LogPresenceVerificationRequest( 
        address indexed node, 
        address account, 
        address contractAddress
    );
    
   /*
     * @event LogMessagePublicationRequest
     * @param {Address} node:  (indexed) Address of the node that should publish requested message.
     * @param {String}  uuid: v4 UUID string which will be the identity of the characteristic `message` is broadcast from
     * @param {String}  message: a string with max length 66 (hex prefixed address size) to broadcast from `channel`
     * @param {Number}  expires: Expiration date of broadcast (in ms from Epoch) 
     * @param {Address} contractAddress: contract to check client authorization by and write delivery confirmation to. 
     */
    event LogMessagePublicationRequest( 
        address indexed node, 
        string uuid, 
        string message, 
        uint64 expires, 
        address contractAddress 
    );

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
    event LogBeaconBroadcastRequest( 
        address indexed node, 
        string uuid, 
        address contractAddress 
    );

    // ------------------------------------------  Event wrappers ------------------------------------------------------
    // NB: There will eventually need to be logic here for compensating the node for providing these services. 
    function requestPresenceVerification( 
        address node, 
        address account, 
        address 
        contractAddress
    )   
        public 
        payable
    {
        LogPresenceVerificationRequest(node, account, contractAddress);
    }

    // Comment
    function requestMessagePublication(
        address node, 
        string uuid, 
        string message, 
        uint64 expires, 
        address contractAddress 
    ) 
        public 
        payable
    {
        LogMessagePublicationRequest(
            node, 
            uuid, 
            message, 
            expires, 
            contractAddress 
        );
    }

    // Comment
    function requestBeaconBroadcast(
        address node, 
        string uuid, 
        address contractAddress 
    )
        public 
        payable
    {
        LogBeaconBroadcastRequest(node, uuid, contractAddress);
    }
}
