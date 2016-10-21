"use strict"

// Note: Modifier correctness is tested in the modifiers section (below). 
//       Modifier interactions at the function level are tested in the methods section. 
//
// (FWIW they're all currently independent and do not alter any state variables they share, so
// tests are a little wtf.)

// To validate solidity "throws" the following pattern is used:
//
//   fnThatThrows()
//      .then( val => false.should.be.true )
//      .catch( err => err.should.be.empty )
//
//   A non-throw (i.e. failing test) will trigger a bad assertion in the 'then' block.
//   This will cause the catch block to fail because 'err' will be a mocha error object, 
//   rather than the throw's empty object.

const Web3 = require('web3');
let testRpc = new Web3.providers.HttpProvider("http://localhost:8545");
const web3 = new Web3(testRpc);

const util = require('ethereumjs-util');
const chai = require('chai');
chai.use(require('chai-spies'));
chai.should();

contract('Race', function(accounts) {
  
    let race, endState, eventContract, node, racerA, racerB, utils;

    node = accounts[0];
    racerA = accounts[1];
    racerB = accounts[2];
    utils = web3._extend.utils;

    // Commit racerA & racerB to race. Get endState.
    before((done)=>{
        race = Race_test.deployed();
        eventContract = AnimistEvent.deployed();

        Promise.all([
            race.commitSelf({from: racerA}),
            race.commitSelf({from: racerB}),
            race.endState.call(node),

        ]).then((results) => {
            endState = parseInt(results[2]);
            done();
        })
    });

    beforeEach((done)=>{
        
        // Wipe everything used
        Promise.all([
            race.setContractOpen(true, {from: node}),
            race.setStateMap(node, 0, {from: node}),
            race.setStateMap(node, 1, {from: node}),
            race.setEventContract( eventContract.address, 0, {from: node}),
            race.setEventContract( eventContract.address, 1, {from: node}),
            race.setContractEndState(endState, {from: node}), 
            race.setClientState(racerA, 0, {from: node}),
            race.setClientState(racerB, 0, {from: node}),
            race.setClientTimeVerified(racerA, 0, {from: node}),
            race.setClientTimeVerified(racerB, 0, {from: node}),
            race.setClientVerifier(racerA, utils.toAddress(0), {from: node}),
            race.setClientVerifier(racerB, utils.toAddress(0), {from: node}),
            race.setClientEndBlock(racerA, utils.toAddress(0), {from: node}),
            race.setClientEndBlock(racerB, utils.toAddress(0), {from: node}),
            race.setClientAuthority(racerA, utils.toAddress(0), {from: node}),
            race.setClientAuthority(racerA, utils.toAddress(0), {from: node}),
            race.setSignedStartSignal({from: node})

        ]).then((results) => {
            done();
        })
    });

    // ------------------------------------------------------------------------------------
    // -------------------------------  Public Methods   ----------------------------------
    // ------------------------------------------------------------------------------------

    describe('Methods', ()=>{

        describe('verifyPresence(address client, uint64 time)', () => {
            it('should set racers verifier field to the address of authenticating node', () =>{
                return race.verifyPresence(racerA, 12345, {from: node}).then(() => {
                    return race.getVerifier.call(racerA).then( val => val.should.equal(node) );
                })
            });

            it('should set racers timeVerified field to passed value', () =>{
                let expected = 12345;
                return race.verifyPresence(racerA, expected, {from: node}).then(() => {
                    return race.getTimeVerified.call(racerA)
                        .then(result => parseInt(result).should.equal(expected))
                })
            });

            // -- Should have mods: nodeCanVerify, clientCanStep, clientIsRacer --   

            // where: clientIsRacer passes, nodeCanVerify passes, clientCanStep fails  
            it('should throw if the client cannot step', () => {
                return race.setClientState(racerA, endState, {from: node}).then(() => {
                    return race.verifyPresence(racerA, 12345, {from: node})
                        .then( val => false.should.be.true )
                        .catch( err => err.should.be.empty )  
                })
            });

            // where: nodeCanVerifyPasses, clientCanStep passes, clientIsRacer fails
            it('should throw if the client has not committed to the race', () => {
                let bad_racer = accounts[4];
                return race.verifyPresence(bad_racer, 12345, {from: node})
                    .then( val => false.should.be.true )
                    .catch( err => err.should.be.empty )  
            });

            // where: nodeCanVerifyPasses, clientIsRacerPasses, racerCanStep fails
            it('should throw if node is NOT specified to auth for racers current step', ()=>{
                let bad_node = accounts[4];
                return race.verifyPresence(racerA, 12345, {from: bad_node})
                    .then( val => false.should.be.true )
                    .catch( err => err.should.be.empty )           
            });
        });

        describe('submitSignedBeaconId(uint8 v, bytes32 r, bytes32 s)', () => {

            // There's weird stuff here about the way web3 translates the signature
            // from string into bytes32. . . isValidStartingSignal unit tests
            // show that formatting v,r,s as below results in successful address
            // recovery within a Solidity function. 
            
            let msg = 'B4D5272F-D4AD-4903-A6F5-37032700EB7D:64444:63333';
            let msgHash = util.addHexPrefix(util.sha3(msg).toString('hex'));
            let signed = web3.eth.sign(node, msgHash);
            let sig = util.fromRpcSig(signed);

            sig.r = util.addHexPrefix(sig.r.toString('hex'));
            sig.s = util.addHexPrefix(sig.s.toString('hex'));
            
            it('should assign v, r, s to the "signedStartSignal" obj', (done)=> {

                race.submitSignedBeaconId( sig.v, sig.r, sig.s, {from: node } ).then(()=>{

                    Promise.all([
                        race.getSignedStartSignal_v(),
                        race.getSignedStartSignal_r(),
                        race.getSignedStartSignal_s()
                    
                    ]).then( components => {
                        components[0].toNumber().should.equal(28);
                        util.isHexPrefixed(components[1]).should.be.true;
                        util.isHexPrefixed(components[2]).should.be.true;
                        done();
                    
                    }).catch( err =>  {
                        err.should.equal(0);
                        done();
                    })
                });
            });

            it('should fail if caller is not the starting node in the race', ()=>{

                return race.submitSignedBeaconId( sig.v, sig.r, sig.s, {from: racerA } )
                    .then( () => false.should.be.true )
                    .catch( err =>  err.should.be.empty );
                
            });

            it('should fail if signedStartSignal is already set', ()=>{


                return race.submitSignedBeaconId( sig.v, sig.r, sig.s, {from: node } )
                    .then( () => race.submitSignedBeaconId( sig.v, sig.r, sig.s, {from: node } )
                    .then( () => false.should.be.true )
                    .catch( err =>  err.should.be.empty ))
            });
        });

        describe('commitSelf()', () => {

            it('should register the racer with the contract correctly', (done) => {
                let racerC = accounts[3];
                race.commitSelf({from: racerC }).then(() => {
                    
                    Promise.all([
                        race.getAccount.call(racerC ),
                        race.getAuthority.call( racerC ),
                        race.getVerifier.call( racerC ),
                        race.getTimeVerified.call( racerC ),
                        race.getState.call( racerC ),
                        race.getMostRecentCommit.call() // Check if pushed to racerList array
                    
                    ]).then((results) => {
                        results[0].should.equal(racerC);
                        results[1].should.equal(racerC);
                        results[2].should.equal(utils.toAddress(0));
                        parseInt(results[3]).should.equal(0);
                        parseInt(results[4]).should.equal(0);
                        results[5].should.equal(racerC);

                        race.deleteLastRacer(racerC).then(() => { done() }); // Clean up
                    });   
                });
            });

            it('should broadcast the racers registration', (done) => {
                let racerC = accounts[3];
                chai.spy.on(race, 'broadcastCommit');
                
                race.commitSelf({from: racerC}).then(()=>{
                    race.broadcastCommit.should.have.been.called;
                    race.deleteLastRacer(racerC).then(() => { done() }); // Clean up
                });
            })

            // -- Should have mods: senderUnknown, contractIsOpen --  

            // where: contractIsOpen passes, senderUnknown fails   
            it('should throw if the sender has already committed to race', () => {
                // Racer A gets committed by default in the before fn of this test
                return race.commitSelf({from: racerA })
                    .then( val => false.should.be.true )
                    .catch( err => err.should.be.empty )  
            });

            // where: senderUnknown passes, contractIsOpen fails
            it('should throw if the contract is closed to new registrants', () => {
                let racerC = accounts[3];

                return race.setContractOpen(false, {from: node}).then(() => {
                    return race.commitSelf({from: racerC }) 
                        .then( val => false.should.be.true )
                        .catch( err => err.should.be.empty )  
                })
            });
        });

        describe('advanceSelf()', ()=>{

            it('should advance the racer one step and reset their verification status', (done)=>{      
                // Apparently these can't all be called sequentially in a Promise All ?
                race.setClientVerifier(racerA, node, {from: node}).then(() => {
                    race.advanceSelf({from: racerA}).then((result) => {
                        Promise.all([ 
                            race.getState.call(racerA),
                            race.getVerifier.call(racerA)
                        ]).then((results) => {
                            parseInt(results[0]).should.equal(1);
                            results[1].should.equal(utils.toAddress(0));
                            done();
                        });
                    })
                })
            });

            // Racer advances from 0 (default) to 1, endState is 1
            it('should set racers endBlock field to current block if they finished', (done)=>{      
        
                race.setClientVerifier(racerA, node, {from: node}).then(() => {
                    race.advanceSelf({from: racerA}).then(() => {
                        race.getEndBlock.call(racerA).then((result) => {
                            parseInt(result).should.equal(web3.eth.blockNumber);
                            done();
                        });
                    });
                });
            });

            // Racer advances from 0 to 1, endState is 2
            it('should not alter racers endBlock field if they havent finished', (done)=>{      
       
                Promise.all([
                    race.setClientVerifier(racerA, node, {from: node}),
                    race.setContractEndState(2, {from: node}) 
                ]).then(() => {
                    race.advanceSelf({from: racerA}).then(() => {
                        race.getEndBlock.call(racerA).then((result) => {
                            parseInt(result).should.equal(0);
                            done();
                        });
                    });
                });
            });

            // -- Should have mods: senderCanStep, senderIsRacer, senderIsVerified -- 

            // where: senderIsRacer fails - other mods would fail too, but it's first.
            it('should throw if the client has not committed to the race', () => {
                let bad_racer = accounts[4];
                return race.advanceSelf({from: racerA})
                    .then( val => false.should.be.true )
                    .catch( err => err.should.be.empty )       
            });

            // where: senderIsRacer passes, senderIsVerified passes, senderCanStep fails
            it('should throw if the client cannot step', () => {
                return Promise.all([
                    race.setClientVerifier(racerA, node, {from: node}),
                    race.setClientState(racerA, endState, {from: node})      
                ]).then(() => {
                    return race.advanceSelf({from: racerA})
                        .then( val => false.should.be.true )
                        .catch( err => err.should.be.empty ) 
                });
                 
            });

            // where: senderCanStep passes, senderIsRacer passes, senderIsVerified fails
            it ('should throw if sender has not been verified by the correct node', () => {
                return race.setClientVerifier(racerA, utils.toAddress(0), {from: node}).then(() => {
                    return race.advanceSelf({from: racerA })
                        .then( val => false.should.be.true )
                        .catch( err => err.should.be.empty )  
                })
                
                        
            });
        });

        describe('rewardSelf()', () => {

            // Functionality after the 'first' check has not been written yet
            it('should check to see if the caller came first', () => {      
                let now = web3.eth.blockNumber;
                chai.spy.on(race, 'isFirst')
                
                return Promise.all([
                    race.setClientEndBlock(racerA, now, {from: node}),
                    race.setClientState(racerA, endState, {from: node}),
                ]).then(() => {
                    return race.rewardSelf({from: racerA }).then( results => race.isFirst.should.have.been.called )
                })
            });

            // -- Should have mods: senderIsRacer, senderIsFinished, senderCanCheckResults -- 

            // Racer DNE - there's nothing to set here . . . 
            it('should throw if the client has not committed to the race', () => {
                let bad_racer = accounts[4];
                return race.rewardSelf({from: bad_racer})
                    .then( val => false.should.be.true )
                    .catch( err => err.should.be.empty )        
            });

            // where: senderIsRacer passes, senderCanCheckResults passes, senderIsFinished fails.
            it ('should throw if sender has not finished', () => {
                let now = web3.eth.blockNumber;
                
                return race.setClientEndBlock(racerA, now, {from: node}).then( () => {
                    return race.rewardSelf({from: racerA })
                        .then( val => false.should.be.true )
                        .catch( err => err.should.be.empty ) 
                });    
            });

            // where: senderIsRacer passes, senderIsFinished passes, senderCanCheckResults fails
            it ('should throw if the sender finished in the current block', () => {
                
                // Test-rpc advances a block for each tx: 'now + 3' reflects the the two
                // blocks churned during the test setup? Frankly confused by this - 
                // the unitary modifier test for this behaves differently (in race_modifiers.js). 
                let now = web3.eth.blockNumber + 3; 
        
                return Promise.all([
                    race.setClientState(racerA, endState, {from: node}),
                    race.setClientEndBlock(racerA, now, {from: node}),
                    
                ]).then( () => {
                    return race.rewardSelf({from: racerA })
                        .then( val => false.should.be.true )
                        .catch( err => err.should.be.empty ) 
                })
            });
        });

        // ------------------------------------------------------------------------------------
        // -------------------------------  Internal Methods   --------------------------------
        // ------------------------------------------------------------------------------------

        describe('isFirst(racer)', () => {

            it('should return true if the queried racer is the only person who finished', ()=>{

                let now = Date.now();
                let endBlock = web3.eth.blockNumber;

                // Set up racerA to be only winnner
                return Promise.all([
                    race.setClientTimeVerified(racerA, now, {from: node}),
                    race.setClientEndBlock(racerA, endBlock, {from: node}),    
                ]).then(() => { 
                    return race.testIsFirst(racerA).then( result => result.should.be.true )
                })
            });

            it('should return true if others finished and queried racer finished earliest', ()=>{

                let now = Date.now();
                let win = now - 10;
                let endBlock = web3.eth.blockNumber;

                // Set up racerA to finish, racerB to win
                return Promise.all([
                    race.setClientTimeVerified(racerA, now, {from: node}),
                    race.setClientEndBlock(racerA, endBlock, {from: node}),
                    race.setClientTimeVerified(racerB, win, {from: node}),
                    race.setClientEndBlock(racerB, endBlock, {from: node}),
                    
                ]).then(() => {
                    return race.testIsFirst(racerB).then( result => result.should.be.true )
                })
                
            });

            it('should return false if others finished earlier than queried racer', () =>{

                let now = Date.now();
                let win = now - 10;
                let endBlock = web3.eth.blockNumber;

                // Set up racerA to finish, racerB to win
                return Promise.all([
                    race.setClientTimeVerified(racerA, now, {from: node}),
                    race.setClientEndBlock(racerA, endBlock, {from: node}),
                    race.setClientTimeVerified(racerB, win, {from: node}),
                    race.setClientEndBlock(racerB, endBlock, {from: node}),       
                ]).then(() => {
                    return race.testIsFirst(racerA).then( result => result.should.be.false )
                });
            });
        });

        describe('isValidStartSignal( string signal )', () => {
            
            let msg = 'B4D5272F-D4AD-4903-A6F5-37032700EB7D:64444:63333';
            let badMsg = "bad";

            let msgHash = util.addHexPrefix(util.sha3(msg).toString('hex'));

            let signed = web3.eth.sign(node, msgHash);
            let sig = util.fromRpcSig(signed);
            
            it('should return true if input is the same string as the one the node signed', ()=>{

                // Covert to hex string for correct bytes32 translation
                sig.r = util.addHexPrefix(sig.r.toString('hex'));
                sig.s = util.addHexPrefix(sig.s.toString('hex'));
                
                return race.submitSignedBeaconId( sig.v, sig.r, sig.s, {from: node } ).then(()=>{
                    return race.testIsValidStartSignal(msg).then( val => val.should.be.true )
                });
            });

            it('should return false if input is different than the one the node signed', ()=>{
                
                // Covert to hex string for correct bytes32 translation
                sig.r = util.addHexPrefix(sig.r.toString('hex'));
                sig.s = util.addHexPrefix(sig.s.toString('hex'));
                
                return race.submitSignedBeaconId( sig.v, sig.r, sig.s, {from: node } ).then(()=>{
                    return race.testIsValidStartSignal(badMsg).then( val => val.should.be.false )
                });
            });
        })

        describe('broadcastCommit()', ()=>{

            it('should fire a registration event about racer for each node listed in the stateMap', (done)=>{
                let now = web3.eth.blockNumber;
            
                // Default stateMap has length 2, 'node' listed twice.               
                eventContract.LogPresenceVerificationRequest(null, {fromBlock: now, toBlock: now + 1}, (err, res) => {
                    
                    if (res.logIndex == 0 ) {
                        res.args.account.should.equal(racerA);
                        res.args.node.should.equal(node);
                        res.args.contractAddress.should.equal(race.address);
                        done();
                    }
                });
                // Run
                race.testBroadcastCommit({from: racerA});
            });
        });

        describe('broadcastBeacon', () => {

            it('should request a beacon broadcast from the starting node, using the "startSignal" var', (done)=>{

                let now = web3.eth.blockNumber;
                race.getStartSignal().then( uuid => {

                    eventContract.LogBeaconBroadcastRequest({node: node}, {fromBlock: now, toBlock: now + 1}, (err, res) => {

                        res.args.uuid.should.equal(uuid);
                        res.args.contractAddress.should.equal(race.address);
                        done();
                       
                    });
                    race.testBroadcastBeacon({from: racerA});
                })
            });

        });

        describe('publishMessage()', ()=>{

            it('should publish a message', (done)=>{
                let now = web3.eth.blockNumber;
                let uuid = "B4D5272F-D4AD-4903-A6F5-37032700EB7D";
                let message = "Hello";
                let expires = 30000;

                eventContract.LogMessagePublicationRequest(null, {fromBlock: now, toBlock: now + 1}, (err, res) => {

                    res.args.node.should.equal(node);
                    res.args.uuid.should.equal(uuid);
                    res.args.message.should.equal(message);
                    res.args.expires.toNumber().should.equal(expires);
                    done();
                   
                });
                // Run
                race.testPublishMessage(uuid, message, expires, {from: racerA});
            });
        });

    });


    // ------------------------------------------------------------------------------------
    // -------------------------------  Modifier Units  -----------------------------------
    // ------------------------------------------------------------------------------------

    describe('Modifiers', ()=>{

        describe('nodeCanVerify', () => {

            it ('should pass if node is specified to auth for racers current step', () => {
                return race.testNodeCanVerify(racerA, {from: node}).then( result => result.should.be.true )   
            });

            it ('should throw if node is NOT specified to auth for racers current step', () => {
                let bad_node = accounts[4];
                return race.testNodeCanVerify(racerA, {from: bad_node})
                    .then( val => false.should.be.true )
                    .catch( err => err.should.be.empty ) 
            });
        });

        describe('clientCanStep', () => {

            it ('should pass if racers last completed step is before the final step', () => {
                return race.testClientCanStep(racerA, {from: node}).then( result => result.should.be.true )
            });

            it ('should throw if racers last completed step was the final step', () =>{
                return race.setClientState(racerA, endState, {from: node}).then( () => {
                    return race.testClientCanStep(racerA, {from: node})
                        .then( val => false.should.be.true )
                        .catch( err => err.should.be.empty ) 
                });   
            });
        });

        describe('clientIsRacer', () => {

            it ('should pass if client has committed to race', () => {
                return race.testClientIsRacer(racerA, {from: node}).then( result => result.should.be.true )
            });

            it ('should throw if client has NOT commited to race', () => {
                let bad_racer = accounts[4];
                return race.testClientIsRacer(bad_racer, {from: node})
                    .then( val => false.should.be.true )
                    .catch( err => err.should.be.empty )        
            });
        });

        describe('senderCanStep', () => {

            it ('should pass if racers last completed step is before the final step', () => {
                return race.testSenderCanStep({from: racerA}).then( result => result.should.be.true )
            });

            it ('should throw if racers last completed step was the final step', () =>{
                return race.setClientState(racerA, endState, {from: node}).then( () => {
                    return race.testSenderCanStep({from: racerA})
                        .then( val => false.should.be.true )
                        .catch( err => err.should.be.empty ) 
                });
            });
        });

        describe('senderIsRacer', () => {

            it ('should pass if sender has committed to race', () => {
                return race.testSenderIsRacer({from: racerA }).then( result => result.should.be.true )
            });

            it ('should throw if sender has NOT commited to race', () => {
                let bad_racer = accounts[4];
                return race.testSenderIsRacer({from: bad_racer})
                    .then( val => false.should.be.true )
                    .catch( err => err.should.be.empty )     
            });
        });

        describe('senderIsVerified', () => {

            // Note: The test contract's stateMap has test node address for both states.
            
            it ('should pass if sender has been verified by the correct node', () => {
                return race.setClientVerifier(racerA, node, {from: node}).then( () => { 
                    return race.testSenderIsVerified({from: racerA })
                        .then( result => result.should.be.true )
                });
            });

            it ('should throw if sender has NOT been verified by the correct node', () => {
                return race.setClientVerifier(racerA, utils.toAddress(0), {from: node}).then(() => {
                    return race.testSenderIsVerified({from: racerA })
                        .then( val => false.should.be.true )
                        .catch( err => err.should.be.empty ) 
                });                 
            });
        });

        describe('senderIsAuthorized', () => {

            it ('should pass if sender can authorize their own tx', () => {
                return race.setClientAuthority(racerA, racerA, {from: node}).then(() => {
                    return race.testSenderIsAuthorized({from: racerA })
                        .then( result => result.should.be.true )
                });
            });

            it ('should throw if sender cannot authorize their own tx', () => {
                return race.setClientAuthority(racerA, racerB, {from: node}).then(() => {
                    return race.testSenderIsAuthorized({from: racerA })
                        .then( val => false.should.be.true )
                        .catch( err => err.should.be.empty )
                });   
            });
        });

        describe('senderUnknown', () => {

            it ('should pass if the sender has NOT registered w/ the contract', () => {
                let unknown = accounts[4];
                return race.testSenderUnknown({from: unknown}).then( result => result.should.be.true )
            });

            it ('should throw if the sender has registered w/ the contract', () => {
                return race.testSenderUnknown({from: racerA })
                    .then( val => false.should.be.true )
                    .catch( err => err.should.be.empty )    
            });
        });

        describe('senderIsFinished', () => {

            it ('should pass if the racer has reached the end state', () => {
                return race.setClientState(racerA, endState, {from: node}).then(() => {
                    return race.testSenderIsFinished({from: racerA})
                        .then( result => result.should.be.true )
                }); 
            });

            // Note: Racer state defaults to 0 before test
            it ('should throw if the sender has NOT reached the end state', () => {
                return race.testSenderIsFinished({from: racerA })
                    .then( val => false.should.be.true )
                    .catch( err => err.should.be.empty )    
            });
        });

        describe('senderCanCheckResults', () => {

            it ('should pass if the racer finished before the current block', () => {
                let before = web3.eth.blockNumber - 1;
                return race.setClientEndBlock(racerA, before, {from: node}).then(() => {
                    return race.testSenderCanCheckResults({from: racerA})
                        .then( result => result.should.be.true )  
                });
            });

            // Note: Because test-rpc automatically increments per transaction
            // 'now' will be blockNumber + 1 after the set tx is run. . . So 
            // this IS actually a test for endBlock/currentBlock equivalence. 
            it ('should throw if racer finished in the current block', () => {
                
                let present = web3.eth.blockNumber + 1;
                return race.setClientEndBlock(racerA, present, {from: node}).then(() => {
                    return race.testSenderCanCheckResults({from: racerA })
                        .then( val => false.should.be.true )
                        .catch( err => err.should.be.empty )   
                });       
            });
        });

        describe('contractIsOpen', () => {

            // Note: Contract defaults to open
            it ('should pass if the contract is still accepting registrants', () => {
                return race.testContractIsOpen(racerA, {from: node}).then( result => result.should.be.true )     
            });

            it ('should throw if the contract is closed to new registrants', () => {
                return race.setContractOpen(false, {from: node}).then(() => {
                    return race.testContractIsOpen({from: node })
                        .then( val => false.should.be.true )
                        .catch( err => err.should.be.empty ) 
                });  
            });

            // Mocha tests are hanging for some weird reason.
            it ('should finish testing now', () => {
                process.exit(0);
            });
        });
    });
});













