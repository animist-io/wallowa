// In lieu of solidity syntax highlighting on GitHub:
// vim: syntax=javascript

// This file constructs solidity wrappers for the internal & modifier fn's in Race.sol
// Also implements some useful setters for unit tests. Extends race.
pragma solidity ^0.4.3;

import 'AnimistEvent.sol';
import 'Race.sol';


contract Race_test is Race {
    // Variables for Events tests
    address authorizedClient;
    address nodeAddr;
    bool messageDelivered;

    // Unit tests currently over write all the values.  
    function Race_test() {
        nodeAddr = address(0x579fadbb36a7b7284ef4e50bbc83f3f294e9a8ec);
        endState = uint8(1);
        raceOpen = true;
        stateMap[0].node = nodeAddr;
        stateMap[1].node = nodeAddr;
    }

    // ------------------- TEST SETTERS ----------------------
    function reset( address a, address b, address _eventContract_) {
        endState = uint8(1);
        raceOpen = true;
        stateMap[0].node = nodeAddr;
        stateMap[1].node = nodeAddr;
        stateMap[0].eventContract = _eventContract_;
        stateMap[1].eventContract = _eventContract_;
        racers[a].state = uint8(0);
        racers[b].state = uint8(0);
        racers[a].timeVerified = uint64(0);
        racers[b].timeVerified = uint64(0);
        racers[a].verifier = address(0);
        racers[b].verifier = address(0);
        racers[a].endBlock = uint(0);
        racers[b].endBlock = uint(0);
        racers[a].authority = address(0);
        racers[b].authority = address(0);
        signedStartSignal.v = uint8(0);
        signedStartSignal.r = bytes32(0);
        signedStartSignal.s = bytes32(0);
        messageDelivered = false;
    }

    function addRacer() {
        racers[msg.sender] = Racer( 
            msg.sender, 
            msg.sender, 
            0, 
            address(0), 
            uint64(0), 
            uint(0)
        );

        racerList.push(msg.sender);
    }

    function setRaceOpen(bool val) {
        raceOpen = val;
    }

    function setStateMap(address node, uint i) {
        stateMap[i].node = node;
    }

    function setContractEndState(uint8 state) {
        endState = state;
    }

    function setEventContract(address contractAddress, uint i) {
        stateMap[i].eventContract = contractAddress;
    }

    function setClientState(address client, uint8 state) {
        racers[client].state = state;
    }

    function setClientVerifier(address client, address verifier) {
        racers[client].verifier = verifier;
    }

    function setClientTimeVerified(address client, uint64 time) {
        racers[client].timeVerified = time;
    }

    function setClientAuthority(address client, address authority) {
        racers[client].authority = authority;
    }

    function setClientEndBlock(address client, uint endBlock) {
        racers[client].endBlock = endBlock;
    }

    function setSignedStartSignal() {
        signedStartSignal.v = 0;
        signedStartSignal.r = bytes32(0);
        signedStartSignal.s = bytes32(0);
    }

    function getClientAccount(address client) constant returns (address a) {
        return racers[client].account;
    }

    function deleteLastRacer(address racer) {
        delete racers[racer];
        delete racerList[racerList.length - 1]; 
    }

    function setAuthorizedClient(address racer) {
        authorizedClient = racer;
    }

    function setMessageDelivered(bool val) {
        messageDelivered = val;
    }
    
    function getMessageDelivered() constant returns (bool result) {
        return messageDelivered;
    }

    // --------- INTERNAL FUNCTION WRAPPERS ----------------
    
    function testIsFirst(address racer) constant returns (bool result) {
        return isFirst(racer);
    }

    function testIsValidStartSignal(string signal) constant returns (bool result) {
        return isValidStartSignal(signal);
    }

    function testBroadcastCommit() {
        broadcastCommit();
    }

    // -------------------- MESSAGE PUBLICATION  --------------------------
    function testPublishMessage( 
        string uuid, 
        string message, 
        uint32 duration, 
        address contractAddress)
    {
        publishMessage(
            uuid, 
            message, 
            duration, 
            contractAddress
        );
    }

    function isAuthorizedToReadMessage(address visitor, string uuid) 
        constant 
        returns (bool result) 
    {
        if (msg.sender == stateMap[0].node && visitor == authorizedClient)
            return true;
        else
            return false;
    }

    function confirmMessageDelivery(address visitor, string uuid, uint64 time) {
        if (msg.sender == stateMap[0].node && visitor == authorizedClient )
            messageDelivered = true;
    } 

    // -------------------- START SIGNAL BROADCAST --------------------------
    function testBroadcastBeacon() {
        broadcastBeacon();
    }
    
    // ------------  MODIFIER TEST WRAPPERS -----------------
    // All tests return true if fn makes it through the gate.
    // and throw otherwise.
    
    function testNodeCanVerify(address client)
        nodeCanVerify(client) 
        constant 
        returns (bool result) 
    {
        return true;
    }


    function testClientCanStep(address client)
        clientCanStep(client)
        constant 
        returns (bool result)
    {
        return true;
    }

    function testClientIsRacer(address client)
        clientIsRacer(client)
        constant 
        returns (bool result)
    {
        return true;
    }
    

    function testSenderCanStep()
        senderCanStep
        constant 
        returns (bool result)
    {
        return true;
    }
    

    function testSenderIsRacer()
        senderIsRacer
        constant 
        returns (bool result)
    {
        return true;
    }
    

    function testSenderIsVerified()
        senderIsVerified
        constant 
        returns (bool result)
    {
        return true;
    }
    

    function testSenderIsAuthorized()
        senderIsAuthorized
        constant 
        returns (bool result)
    {
        return true;
    }
    

    function testSenderUnknown()
        senderUnknown
        constant 
        returns (bool result)
    {
        return true;
    }
    

    function testSenderIsFinished()
        senderIsFinished
        constant 
        returns (bool result)
    {
        return true;
    }
    

    function testSenderCanCheckResults()
        senderCanCheckResults
        constant 
        returns (bool result)
    {
        return true;
    }
    

    function testContractIsOpen()
        contractIsOpen
        constant 
        returns (bool result)
    {
        return true;
    }
}

