// This file constructs solidity wrapper tests for the modifier fn's in Race.sol
// & implements some useful setters for unit tests. Extends race.
import 'Race.sol';

contract Race_test is Race {

    // UNIT TESTS ASSUME THESE VALUES. CHANGE AT YOUR PERIL. 
    function Race_test(){
        var _nodeAddr = address(0x579fadbb36a7b7284ef4e50bbc83f3f294e9a8ec);

        endState = 1;
        openContract = true;

        stateMap[0] = _nodeAddr;
        stateMap[1] = _nodeAddr;
    }

    // -------------------  SETTERS ----------------------
    function setContractOpen(bool val){
        openContract = val;
    }

    function setContractEndState(uint8 state){
        endState = state;
    }

    function setClientState(address client, uint8 state){
        racers[client].state = state;
    }

    function setClientVerifier(address client, address verifier){
        racers[client].verifier = verifier;
    }

    function setClientTimeVerified(address client, uint64 time){
        racers[client].timeVerified = time;
    }

    function setClientAuthority(address client, address authority){
        racers[client].authority = authority;
    }

    function setClientEndBlock(address client, uint endBlock){
        racers[client].endBlock = endBlock;
    }

    function getClientAccount(address client) constant returns (address a){
        return racers[client].account;
    }

    function deleteLastRacer(address racer){
        delete racers[racer];
        delete racerList[racerList.length - 1]; 
    }

    // --------- INTERNAL FUNCTION WRAPPERS ----------------
    
    function testIsFirst(address racer)
        constant returns (bool result) {
            return isFirst(racer);
        }

    function testBroadcastCommit(){
        broadcastCommit();
    }
    
    // ------------  MODIFIER TEST WRAPPERS -----------------
    // All tests return true if fn makes it through the gate.
    // and throw otherwise.
    
    function testNodeCanVerify(address client)
        nodeCanVerify(client) 
        constant returns (bool result) {
            return true;
        }


    function testClientCanStep(address client)
        clientCanStep(client)
        constant returns (bool result){
            return true;
        }

    function testClientIsRacer(address client)
        clientIsRacer(client)
        constant returns (bool result){
            return true;
        }
    

    function testSenderCanStep()
        senderCanStep
        constant returns (bool result){
            return true;
        }
    

    function testSenderIsRacer()
        senderIsRacer
        constant returns (bool result){
            return true;
        }
    

    function testSenderIsVerified()
        senderIsVerified
        constant returns (bool result){
            return true;
        }
    

    function testSenderIsAuthorized()
        senderIsAuthorized
        constant returns (bool result){
            return true;
        }
    

    function testSenderUnknown()
        senderUnknown
        constant returns (bool result){
            return true;
        }
    

    function testSenderIsFinished()
        senderIsFinished
        constant returns (bool result){
            return true;
        }
    

    function testSenderCanCheckResults()
        senderCanCheckResults
        constant returns (bool result){
            return true;
        }
    

    function testContractIsOpen()
        contractIsOpen
        constant returns (bool result){
            return true;
        }
    

}
// In lieu of solidity syntax highlighting on GitHub, this 
// JS modeline makes the contract a little more readable there. 
// vim: syntax=javascript
