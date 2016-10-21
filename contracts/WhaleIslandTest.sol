// Test contract deployed by unit tests to validate mgmt of contract API endpoints.
    contract WhaleIslandTest{

        struct SignedBeacon {           // EC signature of beacon-signal emitted by first node as a start signal. 
            uint8 v;                    // (See submitSignedBeaconId and validateReceivedBeacon methods below)
            bytes32 r;
            bytes32 s;
        }

        address public client;
        uint public state;
        bool public verified = true;
        uint64 public timeVerified;
        SignedBeacon signedBeacon;


        function getState() constant returns (uint val){
            return state;
        }
        function getVerified() constant returns (bool status){
            return verified;
        }
        function getTimeVerified() constant returns (uint time){
            return timeVerified;
        }

        function getClient() constant returns (address client){
            return client;
        }
        
        function setVerified(bool val) public {
            verified = val;
        }
        
        function setState(uint val) public{
            state = val;
        }
        
        function setTimeVerified(uint64 time) public {
            timeVerified = time;
        }

        function setClient(address newClient) public {
            client = newClient;
        }
        
        function resetAll() public{
            verified = false;
            timeVerified = 0;
            client = address(0);
            state = 0;
        }
        
        function verifyPresence(address newClient, uint64 time){
            client = newClient;
            timeVerified = time;
            state++;
        }

        function submitSignedBeaconId( uint8 v, bytes32 r, bytes32 s) 
        {
            signedBeacon.v = v;
            signedBeacon.r = r;
            signedBeacon.s = s;
        }

        function receivedBeaconMatchesSignedBeacon( string receivedStartSignal, address signingNode ) constant returns (bool result){
            
            var signal = sha3(receivedStartSignal);
            var signer = ecrecover(signal, signedBeacon.v, signedBeacon.r, signedBeacon.s);

            if (signingNode == signer)
                return true;
            else
                return false;
        }
    }