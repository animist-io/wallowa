"use strict"

// Note: Modifier correctness is tested in the modifiers section (below). 
//       Modifier interactions at the function level are tested in the methods section. 
//
// (FWIW they're all currently independent and do not alter any state variables they share, so
// tests are a little wtf.)

const chai = require('chai');

//chai.use(require('../resources/bindings.js'))
//chai.use(require('chai-bignumber')(web3.toBigNumber(0).constructor))
chai.use(require('chai-as-promised'));
chai.use(require('chai-spies'));
var should = chai.should();


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
            race.setClientAuthority(racerA, utils.toAddress(0), {from: node})

        ]).then((results) => {
            done();
        })
    });

    // ------------------------------------------------------------------------------------
    // -------------------------------  Public Methods   ----------------------------------
    // ------------------------------------------------------------------------------------

    describe('Methods', ()=>{

        describe('verify(address client, uint64 time)', () => {
            it('should set racers verifier field to the address of authenticating node', (done) =>{
                race.verify(racerA, 12345, {from: node}).then(() => {
                    race.getVerifier(racerA, {from: node}).should.eventually.equal(node).notify(done);
                })
            });

            it('should set racers timeVerified field to passed value', (done) =>{
                let expected = 12345;
                race.verify(racerA, expected, {from: node}).then(() => {
                    race.getTimeVerified(racerA, {from: node}).then( (val) => {
                        parseInt(val).should.equal(expected);
                        done();
                    })
                })
            });

            // -- Should have mods: nodeCanVerify, clientCanStep, clientIsRacer --   

            // where: clientIsRacer passes, nodeCanVerify passes, clientCanStep fails  
            it('should throw if the client cannot step', (done) => {
                race.setClientState(racerA, endState, {from: node}).then(() => {
                    race.verify(racerA, 12345, {from: node}).should.eventually.be.rejected.notify(done);
                })
            });

            // where: nodeCanVerifyPasses, clientCanStep passes, clientIsRacer fails
            it('should throw if the client has not committed to the race', (done) => {
                let bad_racer = accounts[4];
                race.verify(bad_racer, 12345, {from: node}).should.eventually.be.rejected.notify(done);   
            });

            // where: nodeCanVerifyPasses, clientIsRacerPasses, racerCanStep fails
            it('should throw if node is NOT specified to auth for racers current step', (done)=>{
                let bad_node = accounts[4];
                race.verify(racerA, 12345, {from: bad_node}).should.eventually.be.rejected.notify(done);          
            });
        });

        describe('commitSelf()', () => {

            it('should register the racer with the contract correctly', (done) => {
                let racerC = accounts[3];
                race.commitSelf({from: racerC }).then(() => {
                    
                    Promise.all([
                        race.getAccount(racerC, {from: node}),
                        race.getAuthority( racerC, {from: node}),
                        race.getVerifier( racerC, {from: node}),
                        race.getTimeVerified( racerC, {from: node}),
                        race.getState( racerC, {from: node}),
                        race.getMostRecentCommit( {from: node}) // Check if pushed to racerList array
                    
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
            it('should throw if the sender has already committed to race', (done) => {
                // Racer A gets committed by default in the before fn of this test
                race.commitSelf({from: racerA }).should.eventually.be.rejected.notify(done);
            });

            // where: senderUnknown passes, contractIsOpen fails
            it('should throw if the contract is closed to new registrants', (done) => {
                let racerC = accounts[3];

                race.setContractOpen(false, {from: node}).then(() => {
                    race.commitSelf({from: racerC }).should.eventually.be.rejected.notify(done);
                });    
            });
        });

        describe('advanceSelf()', ()=>{

            it('should advance the racer one step and reset their verification status', (done)=>{      
                // Apparently these can't all be called sequentially in a Promise All.
                race.setClientVerifier(racerA, node, {from: node}).then(() => {
                    race.advanceSelf({from: racerA}).then((result) => {
                        Promise.all([ 
                            race.getState(racerA, {from: node}),
                            race.getVerifier(racerA, {from: node})
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
                        race.getEndBlock(racerA, {from: racerA}).then((result) => {
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
                        race.getEndBlock(racerA, {from: racerA}).then((result) => {
                            parseInt(result).should.equal(0);
                            done();
                        });
                    });
                });
            });

            // -- Should have mods: senderCanStep, senderIsRacer, senderIsVerified -- 

            // where: senderIsRacer fails - other mods would fail too, but it's first.
            it('should throw if the client has not committed to the race', (done) => {
                let bad_racer = accounts[4];
                race.advanceSelf({from: racerA}).should.eventually.be.rejected.notify(done);        
            });

            // where: senderIsRacer passes, senderIsVerified passes, senderCanStep fails
            it('should throw if the client cannot step', (done) => {
                Promise.all([
                    race.setClientVerifier(racerA, node, {from: node}),
                    race.setClientState(racerA, endState, {from: node}),
                ]).then(() => {
                    race.advanceSelf({from: racerA}).should.eventually.be.rejected.notify(done);
                })
            });

            // where: senderCanStep passes, senderIsRacer passes, senderIsVerified fails
            it ('should throw if sender has not been verified by the correct node', (done) => {
                race.setClientVerifier(racerA, utils.toAddress(0), {from: node}).then(() => {
                    race.advanceSelf({from: racerA }).should.eventually.be.rejected.notify(done);
                });        
            });
        });

        describe('rewardSelf()', () => {

            // Functionality after the 'first' check has not been written yet
            it('should check to see if the caller came first', (done) => {      
                let now = web3.eth.blockNumber;
                chai.spy.on(race, 'isFirst')
                
                Promise.all([
                    race.setClientEndBlock(racerA, now, {from: node}),
                    race.setClientState(racerA, endState, {from: node}),
                ]).then(() => {
                    race.rewardSelf({from: racerA }).then(() => {
                        race.isFirst.should.have.been.called;
                        done();
                    });
                })
            });

            // -- Should have mods: senderIsRacer, senderIsFinished, senderCanCheckResults -- 

            // Racer DNE - there's nothing to set here . . . 
            it('should throw if the client has not committed to the race', (done) => {
                let bad_racer = accounts[4];
                race.rewardSelf({from: bad_racer}).should.eventually.be.rejected.notify(done);        
            });

            // where: senderIsRacer passes, senderCanCheckResults passes, senderIsFinished fails.
            it ('should throw if sender has not finished', (done) => {
                let now = web3.eth.blockNumber;
                race.setClientEndBlock(racerA, now, {from: node}).then(() => {
                    race.rewardSelf({from: racerA }).should.eventually.be.rejected.notify(done);
                });  
            });

            // where: senderIsRacer passes, senderIsFinished passes, senderCanCheckResults fails
            it ('should throw if the sender finished in the current block', (done) => {
                
                // Test-rpc advances a block for each tx: 'now + 3' reflects the the two
                // blocks churned during the test setup? Frankly confused by this - 
                // the unitary modifier test for this behaves differently (in race_modifiers.js). 
                let now = web3.eth.blockNumber + 3; 
                Promise.all([
                    race.setClientState(racerA, endState, {from: node}),
                    race.setClientEndBlock(racerA, now, {from: node})
                ]).then(() => {
                    race.rewardSelf({from: racerA }).should.eventually.be.rejected.notify(done);
                });
            });
        });

        // ------------------------------------------------------------------------------------
        // -------------------------------  Internal Methods   --------------------------------
        // ------------------------------------------------------------------------------------

        describe('isFirst(racer)', () => {

            it('should return true if the queried racer is the only person who finished', (done)=>{

                let now = Date.now();
                let endBlock = web3.eth.blockNumber;

                // Set up racerA to be only winnner
                Promise.all([
                    race.setClientTimeVerified(racerA, now, {from: node}),
                    race.setClientEndBlock(racerA, endBlock, {from: node})
                ]).then(() => {
                    race.testIsFirst(racerA).should.eventually.be.true.notify(done);
                })
            });

            it('should return true if others finished and queried racer finished earliest', (done)=>{

                let now = Date.now();
                let win = now - 10;
                let endBlock = web3.eth.blockNumber;

                // Set up racerA to finish, racerB to win
                Promise.all([
                    race.setClientTimeVerified(racerA, now, {from: node}),
                    race.setClientEndBlock(racerA, endBlock, {from: node}),
                    race.setClientTimeVerified(racerB, win, {from: node}),
                    race.setClientEndBlock(racerB, endBlock, {from: node}),
                ]).then(() => {
                    race.testIsFirst(racerB).should.eventually.be.true.notify(done);
                })

            });

            it('should return false if others finished earlier than queried racer', (done) =>{

                let now = Date.now();
                let win = now - 10;
                let endBlock = web3.eth.blockNumber;

                // Set up racerA to finish, racerB to win
                Promise.all([
                    race.setClientTimeVerified(racerA, now, {from: node}),
                    race.setClientEndBlock(racerA, endBlock, {from: node}),
                    race.setClientTimeVerified(racerB, win, {from: node}),
                    race.setClientEndBlock(racerB, endBlock, {from: node}),
                ]).then(() => {
                    race.testIsFirst(racerA).should.eventually.be.false.notify(done);
                })
            });
        });

        describe('broadcastCommit()', ()=>{

            it('should fire a registration event about racer for each node listed in the stateMap', (done)=>{
                let now = web3.eth.blockNumber;
            
                // Default stateMap has length 2, 'node' listed twice.               
                eventContract.LogRegistration(null, {fromBlock: now, toBlock: now}, (err, res) => {
                    
                    if (res.logIndex == 0 ) {
                        res.args.account.should.equal(racerA);
                        res.args.node.should.equal(node);
                        res.args.contractAddress.should.equal(race.address);
                        done();
                    }
                });
                // Run
                race.testBroadcastCommit(racerA, {from: racerA});
            });
        });
    });


    // ------------------------------------------------------------------------------------
    // -------------------------------  Modifier Units  -----------------------------------
    // ------------------------------------------------------------------------------------

    describe('Modifiers', ()=>{

        describe('nodeCanVerify', () => {

            it ('should pass if node is specified to auth for racers current step', (done) => {
                race.testNodeCanVerify(racerA, {from: node}).should.eventually.be.true.notify(done);
            });

            it ('should throw if node is NOT specified to auth for racers current step', (done) => {
                let bad_node = accounts[4];
                race.testNodeCanVerify(racerA, {from: bad_node}).should.eventually.be.rejected.notify(done);
            });
        });

        describe('clientCanStep', () => {

            it ('should pass if racers last completed step is before the final step', (done) => {
                race.testClientCanStep(racerA, {from: node}).should.eventually.be.true.notify(done);
            });

            it ('should throw if racers last completed step was the final step', (done) =>{
                race.setClientState(racerA, endState, {from: node}).then(() => {
                    race.testClientCanStep(racerA, {from: node}).should.eventually.be.rejected.notify(done);
                })
            });
        });

        describe('clientIsRacer', () => {

            it ('should pass if client has committed to race', (done) => {
                race.testClientIsRacer(racerA, {from: node}).should.eventually.be.true.notify(done);
            });

            it ('should throw if client has NOT commited to race', (done) => {
                let bad_racer = accounts[4];
                race.testClientIsRacer(bad_racer, {from: node}).should.eventually.be.rejected.notify(done);        
            });
        });

        describe('senderCanStep', () => {

            it ('should pass if racers last completed step is before the final step', (done) => {
                race.testSenderCanStep.call(racerA).should.eventually.be.true.notify(done);
            });

            it ('should throw if racers last completed step was the final step', (done) =>{
                race.setClientState(racerA, endState, {from: node}).then(() => {
                    race.testSenderCanStep({from: racerA}).should.eventually.be.rejected.notify(done);
                });
            });
        });

        describe('senderIsRacer', () => {

            it ('should pass if sender has committed to race', (done) => {
                race.testSenderIsRacer({from: racerA }).should.eventually.be.true.notify(done);
            });

            it ('should throw if sender has NOT commited to race', (done) => {
                let bad_racer = accounts[4];
                race.testSenderIsRacer({from: bad_racer}).should.eventually.be.rejected.notify(done);        
            });
        });

        describe('senderIsVerified', () => {

            // Note: The test contract's stateMap has test node address for both states.
            
            it ('should pass if sender has been verified by the correct node', (done) => {
                race.setClientVerifier(racerA, node, {from: node}).then(() => {
                    race.testSenderIsVerified({from: racerA }).should.eventually.be.true.notify(done);
                })
            });

            it ('should throw if sender has NOT been verified by the correct node', (done) => {
                race.setClientVerifier(racerA, utils.toAddress(0), {from: node}).then(() => {
                    race.testSenderIsVerified({from: racerA }).should.eventually.be.rejected.notify(done);
                });        
            });
        });

        describe('senderIsAuthorized', () => {

            it ('should pass if sender can authorize their own tx', (done) => {
                race.setClientAuthority(racerA, racerA, {from: node}).then(() => {
                    race.testSenderIsAuthorized({from: racerA }).should.eventually.be.true.notify(done);
                })
            });

            it ('should throw if sender cannot authorize their own tx', (done) => {
                race.setClientAuthority(racerA, racerB, {from: node}).then(() => {
                    race.testSenderIsAuthorized({from: racerA }).should.eventually.be.rejected.notify(done);
                });        
            });
        });

        describe('senderUnknown', () => {

            it ('should pass if the sender has NOT registered w/ the contract', (done) => {
                let unknown = accounts[4];
                race.testSenderUnknown({from: unknown}).should.eventually.be.true.notify(done);
            });

            it ('should throw if the sender has registered w/ the contract', (done) => {
                race.testSenderUnknown({from: racerA }).should.eventually.be.rejected.notify(done);
            });
        });

        describe('senderIsFinished', () => {

            it ('should pass if the racer has reached the end state', (done) => {
                race.setClientState(racerA, endState, {from: node}).then(() => {
                   race.testSenderIsFinished({from: racerA}).should.eventually.be.true.notify(done); 
                });    
            });

            // Note: Racer state defaults to 0 before test
            it ('should throw if the sender has NOT reached the end state', (done) => {
                race.testSenderIsFinished({from: racerA }).should.eventually.be.rejected.notify(done);
            });
        });

        describe('senderCanCheckResults', () => {

            it ('should pass if the racer finished before the current block', (done) => {
                let before = web3.eth.blockNumber - 1;
                race.setClientEndBlock(racerA, before, {from: node}).then(() => {
                   race.testSenderCanCheckResults({from: racerA}).should.eventually.be.true.notify(done); 
                });    
            });

            // Note: Because test-rpc automatically increments per transaction
            // 'now' will be blockNumber + 1 after the set tx is run. . . So 
            // this IS actually a test for endBlock/currentBlock equivalence. 
            it ('should throw if racer finished in the current block', (done) => {
                
                let now = web3.eth.blockNumber + 1;
                race.setClientEndBlock(racerA, now, {from: node}).then(() => {
                    race.testSenderCanCheckResults({from: racerA }).should.eventually.be.rejected.notify(done);
                });
            });
        });

        describe('contractIsOpen', () => {

            // Note: Contract defaults to open
            it ('should pass if the contract is still accepting registrants', (done) => {
                race.testContractIsOpen(racerA, {from: node}).should.eventually.be.true.notify(done);     
            });

            it ('should throw if the contract is closed to new registrants', (done) => {
                race.setContractOpen(false, {from: node}).then(() => {
                    race.testContractIsOpen({from: node }).should.eventually.be.rejected.notify(done);
                });
            });
        });
    });
});













