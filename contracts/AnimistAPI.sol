// This is a shell to generate an ABI. These are method names and
// params that constitute the contract API for whale-island nodes.
pragma solidity ^0.4.3;


contract AnimistAPI {
    function verifyPresence(address visitor, uint64 time) {}
    function submitSignedBeaconId(uint8 v, bytes32 r, bytes32 s) {}
    function isAuthorizedToReadMessage(address visitor, string uuid) constant returns (bool result) {}
    function confirmMessageDelivery(address visitor, string uuid, uint64 time) {}
}
