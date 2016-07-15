// -------------------------------- INTRODUCTION ----------------------------------------
//
// This is a sample contract for a race in which contestants can authorize
// their own transactions. (See ProvidedRace.sol for an example of a race where a third
// party - an app producer/provider - manages transactions on behalf of racers)

// ------------------------------ DESCRIPTION OF RACE ------------------------------------
//
// + A 'race' is modelled as a finite sequence of steps, where each step is 
//   is a visit to an Animist node specified by the contract for that step. 

// + A step entails automatic detection of / enagement with the racer's mobile device 
//   by the Animist node when the racer becomes proximate to it. 

// + A contestant finishes the race by completing the last step. The time a step 
//   is completed is printed to the contract by the Animist endpoint. 

// + Winning entails having the earliest finishing time among the contestants who finish. 
//   Contract can pay out as soon as the fastest racer's finishing step has been mined. 

// ***** TO DO ***** 
// Multiple racers . . . prizes by place.

// ----------------------------- CONTRACT MECHANICS -------------------------------------
// *****  TO DO ***** 
// How is a race initiated? How is the contract funded? How is the endpoint funded?
//
// Each step consists of: 
// a) Endpoint verification of racer presence (accomplished w/ the endpoints account)  
// b) Racer's request to the contract advance them a step. (Predicated by endpoint ver.)
//
// After each step the contract checks to see if the racer has finished. If a racer has
// finished and the block they ended on has been mined, they may query the contract to 
// see if they won and receive a reward.
//
// --------------------------- CONTRACT DESIGN ISSUES ---------------------------------
// ****** TO DO ******
// Discuss contract oriented programming:
// https://medium.com/@gavofyork/condition-orientated-programming-969f6ba0161a#.vh880g6mw
// Iterate through the security issues in the eth git security and talk
// about how contract addresses them.


contract ProvidedRace {

    // Player Definition
    struct Player {

        address account;     // The player
        address authority;   // Acct. w/ permission to advance contract (may/ may not be player)
        
        uint8 state;         // Last completed step 

        address verifier;    // Last node that authenticated presence.
        uint64 timeVerified; // Timestamp of the last verification 
        uint endBlock;       // Block number the player finished on.

    }

    // State
    bool openContract;       // Set to true while racers may join contract. 
    uint8 endState;          // Which step to end contract on.
    address[3] stateMap;     // Nodes expected at steps. e.g stateMap[2] = node_at_my_house
    
    // Players
    mapping (address => Player) players;    // Player data
    address[] playerList;                   // Addr list for iterative access to the players mapping
    

    // Says this contract is about 'player' and 'node'. Broadcast for each node-player pair.
    // Nodes filter for any events that reference them and store them locally.
    event LogRegistration( address indexed player, address indexed node, address indexed thisContract);
    
    // ------------------------------------------------------------------------------------
    // -------------------------------  Modifiers -----------------------------------------
    // ------------------------------------------------------------------------------------
    

    // --------------- (Public: Nodes) ----------------------
    
    // Does the stateMap allow the node to verify presence?
    //(Safe use requires this be preceeded by clientCanStep check)
    modifier nodeCanVerify(address client) {
    
        var next = players[client].state + 1;
        if (msg.sender != stateMap[next]) throw;
        _
    }

    // ---------- (Public: Remote Authority) ------------------

    // Is caller not yet registered with this contract? 
    modifier clientIsUnknown(address client) {
        if (players[client].account != address(0) ) throw;
        _
    }

    // Can the client advance a step, according to the stateMap?
    modifier clientCanStep(address client){
        if ( players[client].state >= endState ) throw;
        _
    }

    // Is client a player in this contract?
    modifier clientIsPlayer(address client) {
        if (players[client].account == address(0)) throw;
        _
    }

    // Has required node verfied client presence? 
    // (Safe use requires this be preceeded by clientCanStep check)
    modifier clientIsVerified(address client){
        var next = players[client].state + 1; 
        if (players[client].verifier != stateMap[next]) throw;
        _
    }

    // Is caller permitted to sign tx about client?
    modifier isAuthorityFor(address client){
        if (msg.sender != players[client].authority) throw;
        _
    }

    // --------------- ( Misc ) --------------------------

    // Is player at the end state?
    modifier isFinished(address player){
        if( players[player].state != endState) throw;
        _
    }

    // Is current block later than the block player finished on?
    // (This is a precondition to being rewarded because there are no
    //  guarantees about what order tx's will be processed in the same block )
    modifier isLaterThanEndBlock(address player){
        if( players[player].endBlock <= block.number) throw;
        _
    }

    // Is contract able to accept new participants ?
    modifier contractIsOpen {
        if( !openContract ) throw;
        _
    }


    // ----------------------------- Test Constructor   --------------------------------
    function AnimistTest(){


        // var _playerAddr1 = address(0x2d0b9afbec0c9924a370a3b9035f2d63c36ba025);
        // var _playerAddr2 = address(0x4831cd954dd087f17dced24c6bda76a598ec242a);

        var _nodeAddr = address(0x579fadbb36a7b7284ef4e50bbc83f3f294e9a8ec);

        endState = 2;

        stateMap[0] = _nodeAddr;
        stateMap[1] = _nodeAddr;
    }

    // ------------------------------------------------------------------------------------
    // -------------------------------  Getters   -----------------------------------------
    // ------------------------------------------------------------------------------------
    
    // Returns the account address authorized to advance 'player'. May be player.
    function getAuthority(address player) constant returns (address authority){
        return players[player].authority;
    }

    // Returns integer value of player's last completed step   
    function getState(address player) constant returns (uint8 state){
        return players[player].state;
    }

    // Returns time when node verified player's last completed step.
    function getTimeVerified(address player) constant returns (uint64 time){
        return players[player].timeVerified;
    }

    // Returns the stateMap (see storage declarations above)
    function getStateMap() constant returns (address[3] map){
       return stateMap;
    }

    // ------------------------------------------------------------------------------------
    // -------------------------------  Public Methods   ----------------------------------
    // ------------------------------------------------------------------------------------

    // Called by authority to commit user to race
    function commit(address client) public
        clientIsUnknown(client)
        contractIsOpen 

        {
            var _nodeAddr = address(0x579fadbb36a7b7284ef4e50bbc83f3f294e9a8ec);

            players[client] = Player( client, msg.sender, 0, address(0), uint64(0), uint(0));
            playerList.push(client);

            // Code here should iterate through the stateMap broadcasting an event once for
            // each distinct node
            LogRegistration(_nodeAddr, client, address(this));

        }

    // Called by node to authorize step
    function verify(address client, uint64 time) public
        clientCanStep(client)
        clientIsPlayer(client)
        nodeCanVerify(client)

        {
            players[client].verifier = msg.sender;
            players[client].timeVerified = time;
        }

    // Called by remote authority to advance state. 
    // Resets status to unverified, for next step. 
    // Checks to see if client should be marked as 'finished'
    function advanceClient(address client) public
        clientCanStep(client)         
        clientIsPlayer(client)
        clientIsVerified(client)
        isAuthorityFor(client) 
        returns (uint endBlock)
        
        {
            players[client].state++;
            players[client].verifier = address(0);
            finish(client);

            return players[client].endBlock;
        }

    // Called by remote authority to collect reward. Tests whether client
    // was first and pays if true. (Must run in a block subsequent to clients 
    // finish b/c there there are no guarantees about what order tx's 
    // will be processed in within a block.)
    function rewardClient(address client) public
        clientIsPlayer(client)
        isAuthorityFor(client) 
        isLaterThanEndBlock(client)

        {
            if ( isFirst(client) ){
                // pay client
            }
        }

    // ------------------------------------------------------------------------------------
    // -------------------------------  Internal Methods   --------------------------------
    // ------------------------------------------------------------------------------------

    // Marks player as 'finished' by assigning them the block the player finished in. 
    // Rewards cannot be distributed until this block has been mined and all finishers' 
    // times are available to be compared.
    function finish(address player) internal
        isFinished(player) 
        {
            players[player].endBlock = block.number;
        }

    // Returns false if 'player' has finished later than anyone else,
    // Returns true otherwise
    function isFirst(address player) internal returns (bool result) {

        // Compare player with all other players (including themselves)
        for (var i = 0; i < playerList.length; i++ ){

            var self_time = players[player].timeVerified;
            var other_time = players[playerList[i]].timeVerified;
            var other_endBlock = players[playerList[i]].endBlock;
            
            // Case: Other finished and player's verified time is later than other's
            if ( (other_endBlock != uint(0)) && (self_time > other_time) ){
                return false;
            }

        }
        // Case: Iterated through the list without finding earlier finish.
        // Player is first, QED
        return true;
    }

}