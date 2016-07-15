// (In lieu of solidity syntax highlighting on GitHub)
// vim: syntax=javascript

// ---------------------------------- OVERVIEW -------------------------------------------
//
// This is a sample contract for a race in which contestants commit stakes and execute 
// transactions on their own account, paying an Animist node to authenticate their presence
// at pre-defined locations in a pre-defined sequence. If implemented in a mobile app it would
// serve as a template that is filled out, compiled and deployed on a race by race basis. 

// (See the README at: animist-io/wallowa for a more detailed description) 

// ********************************** TO DO *********************************************** 
//
// + Multiple racers . . . prizes by place.
// + Handle edge case where there are no finishers. Allow refunds.
// + Address mechanics of starting - checking that everyone is ready & there. Signalling this.
// + Write: broadcasting the registration event to the endpoints. This contract needs to be able
//   to fire an event from pre-deployed 'notification' contracts for each endpoint it hopes to
//   interact with. 
// + Write: contract instantiation logic. How is wager funded? How is the endpoint funded?
// + Write: payout logic . . . .

contract Race {

    // Racer Definition
    struct Racer {

        address account;     // The racer
        address authority;   // Acct. w/ permission to advance contract (may/ may not be racer)
        
        uint8 state;         // Last completed step 

        address verifier;    // Last node that authenticated presence.
        uint64 timeVerified; // Timestamp of the last verification 
        uint endBlock;       // Block number the racer finished on.

    }

    // State
    bool public openContract;    // Set to true while racers may join contract. 
    uint64 public startTime;     // Time when race began. 
    uint8 public endState;       // Which step to end contract on.
    address[2] public stateMap;  // Which nodes expected at which steps. e.g stateMap[2] = node_at_my_house
    
    // Racers in this race
    mapping (address => Racer) public racers; // Racer data
    address[] public racerList;               // Addr list for iterative access to the racers mapping
    

    // Says this contract is about 'racer' and 'node'. Broadcast for each unique node-racer pair during
    // commit. ( Nodes listen for any events that reference them and store them locally. )
    event LogRegistration( address indexed node, address indexed racer, address indexed contractAddress);
    
    // ------------------------------------------------------------------------------------
    // -------------------------------  Modifiers -----------------------------------------
    // ------------------------------------------------------------------------------------
    
    // *** Question ***: Should these just return instead of throwing? Most are errors 
    // and it would be good if they printed red. But . . . some might not be. nodeCanVerify for
    // example. Gas destruction vs. basic reporting is the issue here. 

    // --------------- (Public: Nodes) ----------------------
    
    // Is this node allowed to verify presence at this step?
    modifier nodeCanVerify(address client) {
    
        var next = racers[client].state + 1;
        if (msg.sender != stateMap[next]) throw;
        _
    }

    // Is client registered as a racer?
    modifier clientIsRacer(address client) {
        if (racers[client].account == address(0)) throw;
        _
    }

    // Can the client step forward (or are they finished)?
    modifier clientCanStep(address client){
        if ( racers[client].state >= endState ) throw;
        _
    }

    // --------- (Public: Authority is Self ) ------------------

    // Is the caller registered as a racer ?
    modifier senderIsRacer() {
        if (racers[msg.sender].account == address(0) ) throw;
        _ 
    }

    // Is caller unregistered for this race? 
    modifier senderUnknown {
        if (racers[msg.sender].account != address(0) ) throw;
        _
    }

    // Does the caller have more steps to take?
    modifier senderCanStep {
        if ( racers[msg.sender].state >= endState ) throw;
        _
    }

    // Has caller's presence been verified by the required node?
    modifier senderIsVerified {
        var next = racers[msg.sender].state + 1; 
        if ( racers[msg.sender].verifier != stateMap[next]) throw;
        _
    }

    // Is caller permitted to sign their own tx ?
    modifier senderIsAuthorized {
        if (racers[msg.sender].authority != msg.sender ) throw;
        _
    }

    // Is caller at the end state?
    modifier senderIsFinished{
        if( racers[msg.sender].state != endState) throw;
        _
    }

    // Is current block later than the block racer finished on?
    // (This is a precondition to reward because there are no
    //  guarantees about what order tx's will be processed in the same block )
    modifier senderCanCheckResults(){
        if( racers[msg.sender].endBlock >= block.number) throw;
        _
    }

    // --------------- ( Misc ) --------------------------
    // Is contract open for new contestants to register ?
    modifier contractIsOpen {
        if( openContract != true ) throw;
        _
    }

    // ----------------------------- Test Constructor   --------------------------------
    // This is the main part that needs to be handled with templating in the app. 
    function Race(){

        var _nodeAddr = address(0x579fadbb36a7b7284ef4e50bbc83f3f294e9a8ec);

        endState = 1;
        openContract = true;

        stateMap[0] = _nodeAddr;
        stateMap[1] = _nodeAddr;
    }

    // ------------------------------------------------------------------------------------
    // -------------------------------  Public Getters   ----------------------------------
    // ------------------------------------------------------------------------------------
    
    // Returns the account address of the 'racer'. (A way to verify they are in the mapping)
    function getAccount(address racer) constant public returns (address account){
        return racers[racer].account;
    }

    // Returns the account address authorized to advance 'racer'. May be racer.
    function getAuthority(address racer) constant public returns (address authority){
        return racers[racer].authority;
    }

    // Returns the address of the last node to verify racers presence.
    function getVerifier(address racer) constant public returns (address verifier){
        return racers[racer].verifier;
    }

    // Returns integer value of racer's last completed step   
    function getState(address racer) constant public returns (uint8 state){
        return racers[racer].state;
    }

    // Returns time when node verified racer's last step.
    function getTimeVerified(address racer) constant public returns (uint64 time){
        return racers[racer].timeVerified;
    }

    // Returns block number contestant finished on
    function getEndBlock(address racer) constant public returns (uint endBlock){
        return racers[racer].endBlock;
    }

    // Returns the stateMap (see storage declarations above)
    // (Size of state map should be hardcoded - needs to be set in template)
    function getStateMap() constant public returns (address[2] map){
       return stateMap;
    }

    // Returns the account address of the most recent racer to commit to the race
    function getMostRecentCommit() constant public returns (address racer){
        return racerList[racerList.length - 1];
    }

    // ------------------------------------------------------------------------------------
    // -------------------------------  Public Methods   ----------------------------------
    // ------------------------------------------------------------------------------------

    // Called by node to authorize step
    function verify(address client, uint64 time) public
        clientIsRacer(client)
        clientCanStep(client)
        nodeCanVerify(client)
        {
            racers[client].verifier = msg.sender;
            racers[client].timeVerified = time;
        }

    // Called by user to commit to race
    function commitSelf() public
        senderUnknown
        contractIsOpen 
        {
            racers[msg.sender] = Racer( msg.sender, msg.sender, 0, address(0), uint64(0), uint(0));
            racerList.push(msg.sender);
            broadcastCommit();
        }

    // Called by user to advance their state 
    // Resets status to unverified, for next step. 
    // If racer has finish sets their endBlock field to
    // the current block number.
    function advanceSelf() public
        senderIsRacer
        senderCanStep 
        senderIsVerified
        {
            racers[msg.sender].state++;
            racers[msg.sender].verifier = address(0);
            
            if(racers[msg.sender].state == endState){
                racers[msg.sender].endBlock = block.number;
            }
        }


    // Called by racers to collect reward. Tests whether racer
    // was first and pays if true. (Must run in a block subsequent to their 
    // finish b/c there there are no guarantees about what order tx's 
    // will be processed in within a block.)
    function rewardSelf() public
        senderIsRacer
        senderIsFinished
        senderCanCheckResults
        {
            if ( isFirst(msg.sender) ){
                // pay self
            }
        }

    // ------------------------------------------------------------------------------------
    // -------------------------------  Internal Methods   --------------------------------
    // ------------------------------------------------------------------------------------

    // Returns false if 'racer' has finished later than anyone else, true otherwise
    function isFirst(address racer) internal returns (bool result) {

        // Compare racer with all other racers (including themselves)
        for (var i = 0; i < racerList.length; i++ ){

            var self_time = racers[racer].timeVerified;
            var other_time = racers[racerList[i]].timeVerified;
            var other_endBlock = racers[racerList[i]].endBlock;
            
            // Case: Other finished and racer's verified time is later than other's
            if ( (other_endBlock != uint(0)) && (self_time > other_time) ){
                return false;
            }
        }
        // Case: Iterated through the list without finding earlier finish.
        // racer is first, QED
        return true;
    }

    // Iterates through the statemap broadcasting a registration event 
    //  the caller's commitment to this race contract. 
    // ** THIS IS A STUB: SEE TODO above - broadcast registration  **
    function broadcastCommit() internal {

        for (var i = 0; i < stateMap.length; i++){
            LogRegistration(stateMap[i], msg.sender, address(this));
        }
    }
}
















