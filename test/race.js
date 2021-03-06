'use strict'

// Note: Modifier correctness is tested in the modifiers section (below).
//       Modifier interactions at the function level are tested in the methods section.
//
// (FWIW they're all currently independent and do not alter any state variables they share, so
// tests are a little wtf.)

// To validate solidity "throws" the following pattern is used:
//
//   fnThatThrows()
//      .then( val => val.should.not.exist )
//      .catch( err => err.should.be.thrown )
//
//   A non-throw triggers a bad assertion in the 'then' block. Chai-solidity's 'thrown'
//   property parses the difference between VM exceptions and Mocha errors and causes
//   the test to fail if it detects the latter.
const Web3 = require('web3')
let testRpc = new Web3.providers.HttpProvider('http://localhost:8545')
const web3 = new Web3(testRpc)
const util = require('ethereumjs-util')
const chai = require('chai')

chai.use(require('chai-spies'))
chai.use(require('./helpers/chai-solidity'))
chai.should()

contract('Race', function (accounts) {
  let race
  let endState
  let eventContract
  let node = accounts[0]
  let racerA = accounts[1]
  let racerB = accounts[2]
  let utils = web3._extend.utils
  let MAX_GAS = 3141592

  // Commit racerA & racerB to race. Get endState.
  before(() => {
    race = TestRace.deployed()
    eventContract = AnimistEvent.deployed()

    return Promise.all([
      race.addRacer({from: racerA, gas: MAX_GAS}),
      race.addRacer({from: racerB, gas: MAX_GAS}),
      race.endState.call(node)
    ]).then(([ , ,state]) => { 
      endState = parseInt(state)
    })
  })

  // Reset all contract variables for each test
  beforeEach(() => 
    race.reset(
      racerA, 
      racerB, 
      node, 
      eventContract.address, 
      {from: node, gas: MAX_GAS}
    )
  )

  // ------------------------------------------------------------------------------------
  // -------------------------------  Public Methods   ----------------------------------
  // ------------------------------------------------------------------------------------

  describe('Methods', () => {
    describe('verifyPresence(address client, uint64 time)', () => {
      it('should set racers verifier field to the address of authenticating node', () => {
        return race.verifyPresence(racerA, 12345, {from: node, gas: MAX_GAS})
            .then(val => race.getVerifier.call(racerA)
            .then(val => val.should.equal(node)
          ))
      })

      it('should set racers timeVerified field to passed value', () => {
        let expected = 12345
        return race.verifyPresence(racerA, expected, {from: node, gas: MAX_GAS})
          .then(val => race.getTimeVerified.call(racerA)
          .then(time => parseInt(time).should.equal(expected)
        ))
      })

      // -- Should have mods: nodeCanVerify, clientCanStep, clientIsRacer --

      // where: clientIsRacer passes, nodeCanVerify passes, clientCanStep fails
      it('should throw if the client cannot step', () => {
        return race.setClientState(racerA, endState, {from: node, gas: MAX_GAS})
          .then(setup => race.verifyPresence(racerA, 12345, {from: node, gas: MAX_GAS})
          .then(val => val.should.not.exist)
          .catch(err => err.should.be.thrown)
        )
      })

      // where: nodeCanVerifyPasses, clientCanStep passes, clientIsRacer fails
      it('should throw if the client has not committed to the race', () => {
        let badRacer = accounts[4]
        return race.verifyPresence(badRacer, 12345, {from: node, gas: MAX_GAS})
          .then(val => val.should.not.exist)
          .catch(err => err.should.be.thrown)
      })

      // where: nodeCanVerifyPasses, clientIsRacerPasses, racerCanStep fails
      it('should throw if node is NOT specified to auth for racers current step', () => {
        let badNode = accounts[4]
        return race.verifyPresence(racerA, 12345, {from: badNode, gas: MAX_GAS})
          .then(val => val.should.not.exist)
          .catch(err => err.should.be.thrown)
      })
    })

    describe('submitSignedBeaconId(uint8 v, bytes32 r, bytes32 s)', () => {
      // There's weird stuff here about the way web3 translates the signature
      // from string into bytes32. . . isValidStartingSignal unit tests
      // show that formatting v,r,s as below results in successful address
      // recovery within a Solidity function.

      let msg = 'B4D5272F-D4AD-4903-A6F5-37032700EB7D:64444:63333'
      let msgHash = web3.sha3(msg)
      let signed = web3.eth.sign(node, msgHash)
      let sig = util.fromRpcSig(signed)

      sig.r = util.addHexPrefix(sig.r.toString('hex'))
      sig.s = util.addHexPrefix(sig.s.toString('hex'))

      it('should assign v, r, s to the "signedStartSignal" obj', () => {
        return race.submitSignedBeaconId(sig.v, sig.r, sig.s, {from: node, gas: MAX_GAS})
          .then(val => Promise.all([
              race.getV(),
              race.getR(),
              race.getS() 
          ])
          .then(([v, r, s]) => {
              v.toNumber().should.be.gt(26) // 27 or 28
              v.toNumber().should.be.lt(29)
              util.isHexPrefixed(r).should.be.true
              util.isHexPrefixed(s).should.be.true
          }))
      })

      it('should fail if caller is not the starting node in the race', () => {
        return race.submitSignedBeaconId(sig.v, sig.r, sig.s, {from: racerA, gas: MAX_GAS})
          .then(val => val.should.not.exist)
          .catch(err => err.should.be.thrown)
      })

      it('should fail if signedStartSignal is already set', () => {
        return race.submitSignedBeaconId(sig.v, sig.r, sig.s, {from: node, gas: MAX_GAS})
          .then(setup => race.submitSignedBeaconId(sig.v, sig.r, sig.s, {from: node, gas: MAX_GAS})
          .then(val => val.should.not.exist)
          .catch(err => err.should.be.thrown))
      })
    })

    describe('commitSelf()', () => {
      it('should register the racer with the contract correctly', (done) => {
        let racerC = accounts[3]
        race.commitSelf({from: racerC, gas: MAX_GAS})
          .then( val => Promise.all([
            race.getAccount.call(racerC),
            race.getAuthority.call(racerC),
            race.getVerifier.call(racerC),
            race.getTimeVerified.call(racerC),
            race.getState.call(racerC),
            race.getMostRecentCommit.call() ])
          .then(([
            account,
            authority,
            verifier,
            timeVerified,
            state,
            mostRecentCommit]) => {
              account.should.equal(racerC)
              authority.should.equal(racerC)
              verifier.should.equal(utils.toAddress(0))
              parseInt(timeVerified).should.equal(0)
              parseInt(state).should.equal(0)
              mostRecentCommit.should.equal(racerC)              
              // Clean up
              race.deleteLastRacer(racerC).then( del => done()) 
          })
        )
      })

      it('should broadcast the racers registration', (done) => {
        let racerC = accounts[3]
        chai.spy.on(race, 'broadcastCommit')

        race.commitSelf({from: racerC, gas: MAX_GAS}).then(() => {
          race.broadcastCommit.should.have.been.called
          race.deleteLastRacer(racerC).then(del => done()) // Clean up
        })
      })

      // -- Should have mods: senderUnknown, contractIsOpen --

      // where: contractIsOpen passes, senderUnknown fails
      it('should throw if the sender has already committed to race', () => {
        // Racer A gets committed by default in the before fn of this test
        return race.commitSelf({from: racerA, gas: MAX_GAS})
          .then(val => val.should.not.exist)
          .catch(err => err.should.be.thrown)
      })

      // where: senderUnknown passes, contractIsOpen fails
      it('should throw if the contract is closed to new registrants', () => {
        let racerC = accounts[3]

        return race.setRaceOpen(false, {from: node, gas: MAX_GAS})
          .then(val => race.commitSelf({from: racerC, gas: MAX_GAS})
          .then(val => val.should.not.exist)
          .catch(err => err.should.be.thrown))
      })
    })

    describe('advanceSelf()', () => {
      it('should advance the racer one step and reset their verification status', () => {
        // Apparently these can't all be called sequentially in a Promise All ?
        return race.setClientVerifier(racerA, node, {from: node, gas: MAX_GAS})
          .then(val => race.advanceSelf({from: racerA, gas: MAX_GAS})
          .then(val => Promise.all([
              race.getState.call(racerA),
              race.getVerifier.call(racerA)])
          .then(([state, verifier]) => {
              parseInt(state).should.equal(1)
              verifier.should.equal(utils.toAddress(0))
          }))
        )
      })

      // Racer advances from 0 (default) to 1, endState is 1
      it('should set racers endBlock field to current block if they finished', () => {
        return race.setClientVerifier(racerA, node, {from: node, gas: MAX_GAS})
          .then(setup => race.advanceSelf({from: racerA, gas: MAX_GAS})
          .then(advanced => race.getEndBlock.call(racerA)
          .then(endBlock => parseInt(endBlock).should.equal(web3.eth.blockNumber)
        )))
      })

      // Racer advances from 0 to 1, endState is 2
      it('should not alter racers endBlock field if they havent finished', () => {
        return Promise.all([
          race.setClientVerifier(racerA, node, {from: node, gas: MAX_GAS}),
          race.setContractEndState(2, {from: node, gas: MAX_GAS})
        ])
        .then(setup => race.advanceSelf({from: racerA, gas: MAX_GAS})
        .then(advanced => race.getEndBlock.call(racerA)
        .then(endBlock => parseInt(endBlock).should.equal(0))))
      })

      // -- Should have mods: senderCanStep, senderIsRacer, senderIsVerified --

      // where: senderIsRacer fails - other mods would fail too, but it's first.
      it('should throw if the client has not committed to the race', () => {
        return race.advanceSelf({from: racerA, gas: MAX_GAS})
          .then(val => val.should.not.exist)
          .catch(err => err.should.be.thrown)
      })

      // where: senderIsRacer passes, senderIsVerified passes, senderCanStep fails
      it('should throw if the client cannot step', () => {
        return Promise.all([
          race.setClientVerifier(racerA, node, {from: node, gas: MAX_GAS}),
          race.setClientState(racerA, endState, {from: node, gas: MAX_GAS})
        ])
        .then(setup => race.advanceSelf({from: racerA, gas: MAX_GAS})
        .then(val => val.should.not.exist)
        .catch(err => err.should.be.thrown))
      })

      // where: senderCanStep passes, senderIsRacer passes, senderIsVerified fails
      it('should throw if sender has not been verified by the correct node', () => {
        return race.setClientVerifier(racerA, utils.toAddress(0), {from: node, gas: MAX_GAS})
          .then(setup => race.advanceSelf({from: racerA, gas: MAX_GAS})
          .then(val => val.should.not.exist)
          .catch(err => err.should.be.thrown)
        )
      })
    })

    describe('rewardSelf()', () => {
      // Functionality after the 'first' check has not been written yet
      it('should check to see if the caller came first', () => {
        let now = web3.eth.blockNumber
        chai.spy.on(race, 'isFirst')

        return Promise.all([
          race.setClientEndBlock(racerA, now, {from: node, gas: MAX_GAS}),
          race.setClientState(racerA, endState, {from: node, gas: MAX_GAS})
        ])
        .then( setup => race.rewardSelf({from: racerA, gas: MAX_GAS})
        .then( rewarded => race.isFirst.should.have.been.called))
      })

      // -- Should have mods: senderIsRacer, senderIsFinished, senderCanCheckResults --

      // Racer DNE - there's nothing to set here . . .
      it('should throw if the client has not committed to the race', () => {
        let badRacer = accounts[4]
        return race.rewardSelf({from: badRacer, gas: MAX_GAS})
          .then(val => val.should.not.exist)
          .catch(err => err.should.be.thrown)
      })

      // where: senderIsRacer passes, senderCanCheckResults passes, senderIsFinished fails.
      it('should throw if sender has not finished', () => {
        let now = web3.eth.blockNumber

        return race.setClientEndBlock(racerA, now, {from: node, gas: MAX_GAS})
          .then(setup => race.rewardSelf({from: racerA, gas: MAX_GAS})
          .then(val => val.should.not.exist)
          .catch(err => err.should.be.thrown))
      })

      // where: senderIsRacer passes, senderIsFinished passes, senderCanCheckResults fails
      it('should throw if the sender finished in the current block', () => {
        // Test-rpc advances a block for each tx: 'now + 3' reflects the the two
        // blocks churned during the test setup? Frankly confused by this -
        // the unitary modifier test for this behaves differently (in race_modifiers.js).
        let now = web3.eth.blockNumber + 3

        return Promise.all([
          race.setClientState(racerA, endState, {from: node, gas: MAX_GAS}),
          race.setClientEndBlock(racerA, now, {from: node, gas: MAX_GAS})
        ])
        .then(setup => race.rewardSelf({from: racerA, gas: MAX_GAS})
        .then(val => val.should.not.exist)
        .catch(err => err.should.be.thrown))
      })
    })

    // ------------------------------------------------------------------------------------
    // -------------------------------  Internal Methods   --------------------------------
    // ------------------------------------------------------------------------------------

    describe('isFirst(racer)', () => {
      it('should return true if the queried racer is the only person who finished', () => {
        let now = Date.now()
        let endBlock = web3.eth.blockNumber

        // Set up racerA to be only winnner
        return Promise.all([
          race.setClientTimeVerified(racerA, now, {from: node, gas: MAX_GAS}),
          race.setClientEndBlock(racerA, endBlock, {from: node, gas: MAX_GAS})
        ])
        .then(setup => race.testIsFirst(racerA)
        .then(isFirst => isFirst.should.be.true))
      })

      it('should return true if others finished and queried racer finished earliest', () => {
        let now = Date.now()
        let win = now - 10
        let endBlock = web3.eth.blockNumber

        // Set up racerA to finish, racerB to win
        return Promise.all([
          race.setClientTimeVerified(racerA, now, {from: node, gas: MAX_GAS}),
          race.setClientEndBlock(racerA, endBlock, {from: node, gas: MAX_GAS}),
          race.setClientTimeVerified(racerB, win, {from: node, gas: MAX_GAS}),
          race.setClientEndBlock(racerB, endBlock, {from: node, gas: MAX_GAS})

        ])
        .then(setup => race.testIsFirst(racerB)
        .then(isFirst => isFirst.should.be.true))
      })

      it('should return false if others finished earlier than queried racer', () => {
        let now = Date.now()
        let win = now - 10
        let endBlock = web3.eth.blockNumber

        // Set up racerA to finish, racerB to win
        return Promise.all([
          race.setClientTimeVerified(racerA, now, {from: node, gas: MAX_GAS}),
          race.setClientEndBlock(racerA, endBlock, {from: node, gas: MAX_GAS}),
          race.setClientTimeVerified(racerB, win, {from: node, gas: MAX_GAS}),
          race.setClientEndBlock(racerB, endBlock, {from: node, gas: MAX_GAS})
        ])
        .then(setup => race.testIsFirst(racerA)
        .then(isFirst => isFirst.should.be.false))
      })
    })

    describe('isValidStartSignal( string signal )', () => {
      let msg = 'B4D5272F-D4AD-4903-A6F5-37032700EB7D:64444:63333'
      let badMsg = 'bad'
      let msgHash = web3.sha3(msg)
      let signed = web3.eth.sign(node, msgHash)
      let sig = util.fromRpcSig(signed)

      it('should return true if input is the same string as the one the node signed', () => {
        // Covert to hex string for correct bytes32 translation
        sig.r = util.addHexPrefix(sig.r.toString('hex'))
        sig.s = util.addHexPrefix(sig.s.toString('hex'))

        return race.submitSignedBeaconId(sig.v, sig.r, sig.s, {from: node, gas: MAX_GAS})
          .then(setup => race.testIsValidStartSignal(msg)
          .then(isValid => isValid.should.be.true))
      })

      it('should return false if input is different than the one the node signed', () => {
        // Covert to hex string for correct bytes32 translation
        sig.r = util.addHexPrefix(sig.r.toString('hex'))
        sig.s = util.addHexPrefix(sig.s.toString('hex'))

        return race.submitSignedBeaconId(sig.v, sig.r, sig.s, {from: node, gas: MAX_GAS})
          .then(setup => race.testIsValidStartSignal(badMsg)
          .then(isValid => isValid.should.be.false))
      })
    })

    describe('isAuthorizedToReadMessage', () => {
      it('should return true if visitor is authorized client and method caller is node', () => {
        return race.setAuthorizedClient(racerA, {from: node, gas: MAX_GAS})
          .then(setup => race.isAuthorizedToReadMessage(racerA, 'some message', {from: node})
          .then(isAuthorized => isAuthorized.should.be.true))
      })

      it('should return false if method caller is NOT node', () => {
        return race.setAuthorizedClient(racerA, {from: node, gas: MAX_GAS})
          .then(setup => race.isAuthorizedToReadMessage(racerA, 'some message', {from: racerB})
          .then(isAuthorized => isAuthorized.should.be.false))
      })

      it('should return false if authorizedClient is not "visitor" ', () => {
        return race.setAuthorizedClient(racerA, {from: node, gas: MAX_GAS})
          .then(setup => race.isAuthorizedToReadMessage(racerB, 'some message', {from: node})
          .then(isAuthorized => isAuthorized.should.be.false))
      })
    })

    describe('confirmMessageDelivery', () => {
      it('should set the delivered flag to true if method caller is node and visitor is authorizedClient', () => {
        return race.setAuthorizedClient(racerA, {from: node, gas: MAX_GAS})
          .then(setup => race.confirmMessageDelivery(racerA, 'message', 12345, {from: node, gas: MAX_GAS})
          .then(confirm => race.getMessageDelivered()
          .then(delivered => delivered.should.be.true)))
      })

      it('should NOT toggle the delivered flag if caller is NOT node and visitor is authorizedClient', () => {
        return race.setAuthorizedClient(racerA, {from: node, gas: MAX_GAS})
          .then(setup => race.confirmMessageDelivery(racerA, 'message', 12345, {from: racerB, gas: MAX_GAS})
          .then(confirm => race.getMessageDelivered()
          .then(delivered => delivered.should.be.false)))
      })

      it('should NOT toggle the delivered flag if caller is node and visitor is NOT authorizedClient', () => {
         return race.setAuthorizedClient(racerA, {from: node, gas: MAX_GAS})
          .then(setup => race.confirmMessageDelivery(racerB, 'message', 12345, {from: racerB, gas: MAX_GAS})
          .then(confirm => race.getMessageDelivered()
          .then(delivered => delivered.should.be.false)))
      })
    })

    describe('broadcastCommit()', () => {
      it('should fire a registration event about racer for each node listed in the stateMap', (done) => {
        let now = web3.eth.blockNumber
        let filterParams = {fromBlock: now, toBlock: now + 1}

        // Default stateMap has length 2, 'node' listed twice.
        let filter = eventContract.LogPresenceVerificationRequest(null, filterParams, (e, res) => {
          if (res.logIndex === 0) {
            res.args.account.should.equal(racerA)
            res.args.node.should.equal(node)
            res.args.contractAddress.should.equal(race.address)
            filter.stopWatching()
            done()
          }
        })
        // Run
        race.testBroadcastCommit({from: racerA})
      })
    })

    describe('broadcastBeacon', () => {
      it('should request a beacon broadcast from the starting node, using the "startSignal" var', (done) => {
        let now = web3.eth.blockNumber
        let filterParams = {fromBlock: now, toBlock: now + 1}

        race.getStartSignal().then(uuid => {
          let filter = eventContract.LogBeaconBroadcastRequest({node: node}, filterParams, (e, res) => {
            res.args.uuid.should.equal(uuid)
            res.args.contractAddress.should.equal(race.address)
            filter.stopWatching()
            done()
          })
          race.testBroadcastBeacon({from: racerA, gas: MAX_GAS})
        })
      })
    })

    describe('publishMessage()', () => {
      it('should publish a message', (done) => {
        let now = web3.eth.blockNumber
        let uuid = 'B4D5272F-D4AD-4903-A6F5-37032700EB7D'
        let message = 'Hello'
        let expires = 30000
        let filterParams =  {fromBlock: now, toBlock: now + 1}

        let filter = eventContract.LogMessagePublicationRequest( null, filterParams, (e, res) => {
          res.args.node.should.equal(node)
          res.args.uuid.should.equal(uuid)
          res.args.message.should.equal(message)
          res.args.expires.toNumber().should.equal(expires)
          filter.stopWatching()
          done()
        })
        // Run
        race.testPublishMessage(
          uuid, 
          message, 
          expires, 
          race.address, 
          race, 
          {from: racerA, gas: MAX_GAS})
      })
    })
  })

  // ------------------------------------------------------------------------------------
  // -------------------------------  Modifier Units  -----------------------------------
  // ------------------------------------------------------------------------------------

  describe('Modifiers', () => {
    describe('nodeCanVerify', () => {
      it('should pass if node is specified to auth for racers current step', () => {
        return race.testNodeCanVerify(racerA, {from: node, gas: MAX_GAS})
          .then(passed => passed.should.be.true)
      })

      it('should throw if node is NOT specified to auth for racers current step', () => {
        let badNode = accounts[4]
        return race.testNodeCanVerify(racerA, {from: badNode, gas: MAX_GAS})
          .then(val => val.should.not.exist)
          .catch(err => err.should.be.thrown)
      })
    })

    describe('clientCanStep', () => {
      it('should pass if racers last completed step is before the final step', () => {
        return race.testClientCanStep(racerA, {from: node, gas: MAX_GAS})
          .then(passed => passed.should.be.true)
      })

      it('should throw if racers last completed step was the final step', () => {
        return race.setClientState(racerA, endState, {from: node, gas: MAX_GAS})
          .then(setup => race.testClientCanStep(racerA, {from: node, gas: MAX_GAS})
          .then(val => val.should.not.exist)
          .catch(err => err.should.be.thrown))
      })
    })

    describe('clientIsRacer', () => {
      it('should pass if client has committed to race', () => {
        return race.testClientIsRacer(racerA, {from: node, gas: MAX_GAS})
          .then(passed => passed.should.be.true)
      })

      it('should throw if client has NOT commited to race', () => {
        let badRacer = accounts[4]
        return race.testClientIsRacer(badRacer, {from: node, gas: MAX_GAS})
          .then(val => val.should.not.exist)
          .catch(err => err.should.be.thrown)
      })
    })

    describe('senderCanStep', () => {
      it('should pass if racers last completed step is before the final step', () => {
        return race.testSenderCanStep({from: racerA, gas: MAX_GAS})
          .then(passed => passed.should.be.true)
      })

      it('should throw if racers last completed step was the final step', () => {
        return race.setClientState(racerA, endState, {from: node, gas: MAX_GAS})
          .then(setup => race.testSenderCanStep({from: racerA, gas: MAX_GAS})
          .then(val => val.should.not.exist)
          .catch(err => err.should.be.thrown))
      })
    })

    describe('senderIsRacer', () => {
      it('should pass if sender has committed to race', () => {
        return race.testSenderIsRacer({from: racerA, gas: MAX_GAS})
          .then(passed => passed.should.be.true)
      })

      it('should throw if sender has NOT commited to race', () => {
        let badRacer = accounts[4]
        return race.testSenderIsRacer({from: badRacer, gas: MAX_GAS})
          .then(val => val.should.not.exist)
          .catch(err => err.should.be.thrown)
      })
    })

    describe('senderIsVerified', () => {
      // Note: The test contract's stateMap has test node address for both states.

      it('should pass if sender has been verified by the correct node', () => {
        return race.setClientVerifier(racerA, node, {from: node, gas: MAX_GAS})
          .then(setup => race.testSenderIsVerified({from: racerA, gas: MAX_GAS})
          .then(passed => passed.should.be.true))
      })

      it('should throw if sender has NOT been verified by the correct node', () => {
        return race.setClientVerifier(racerA, utils.toAddress(0), {from: node, gas: MAX_GAS})
          .then(setup => race.testSenderIsVerified({from: racerA, gas: MAX_GAS})
          .then(val => val.should.not.exist)
          .catch(err => err.should.be.thrown))
      })
    })

    describe('senderIsAuthorized', () => {
      it('should pass if sender can authorize their own tx', () => {
        return race.setClientAuthority(racerA, racerA, {from: node, gas: MAX_GAS})
          .then(setup => race.testSenderIsAuthorized({from: racerA})
          .then(passed => passed.should.be.true))
      })

      it('should throw if sender cannot authorize their own tx', () => {
        return race.setClientAuthority(racerA, racerB, {from: node, gas: MAX_GAS})
          .then(setup => race.testSenderIsAuthorized({from: racerA, gas: MAX_GAS})
          .then(val => val.should.not.exist)
          .catch(err => err.should.be.thrown))
      })
    })

    describe('senderUnknown', () => {
      it('should pass if the sender has NOT registered w/ the contract', () => {
        let unknown = accounts[4]
        return race.testSenderUnknown({from: unknown, gas: MAX_GAS})
          .then(passed => passed.should.be.true)
      })

      it('should throw if the sender has registered w/ the contract', () => {
        return race.testSenderUnknown({from: racerA, gas: MAX_GAS})
          .then(val => val.should.not.exist)
          .catch(err => err.should.be.thrown)
      })
    })

    describe('senderIsFinished', () => {
      it('should pass if the racer has reached the end state', () => {
        return race.setClientState(racerA, endState, {from: node, gas: MAX_GAS})
          .then(setup => race.testSenderIsFinished({from: racerA, gas: MAX_GAS})
          .then(passed => passed.should.be.true))
      })

      // Note: Racer state defaults to 0 before test
      it('should throw if the sender has NOT reached the end state', () => {
        return race.testSenderIsFinished({from: racerA, gas: MAX_GAS})
          .then(val => val.should.not.exist)
          .catch(err => err.should.be.thrown)
      })
    })

    describe('senderCanCheckpasseds', () => {
      it('should pass if the racer finished before the current block', () => {
        let before = web3.eth.blockNumber - 1
        return race.setClientEndBlock(racerA, before, {from: node, gas: MAX_GAS})
          .then(setup => race.testSenderCanCheckResults({from: racerA, gas: MAX_GAS})
          .then(passed => passed.should.be.true))
      })

      // Note: Because test-rpc automatically increments per transaction
      // 'now' will be blockNumber + 1 after the set tx is run. . . So
      // this IS actually a test for endBlock/currentBlock equivalence.
      it('should throw if racer finished in the current block', () => {
        let present = web3.eth.blockNumber + 1
        return race.setClientEndBlock(racerA, present, {from: node, gas: MAX_GAS})
          .then(setup => race.testSenderCanCheckResults({from: racerA, gas: MAX_GAS})
          .then(val => val.should.not.exist)
          .catch(err => err.should.be.thrown))
      })
    })

    describe('contractIsOpen', () => {
      // Note: Contract defaults to open
      it('should pass if the contract is still accepting registrants', () => {
        return race.testContractIsOpen(racerA, {from: node, gas: MAX_GAS})
          .then(passed => passed.should.be.true)
      })

      it('should throw if the contract is closed to new registrants', () => {
        return race.setRaceOpen(false, {from: node, gas: MAX_GAS})
          .then(setup => race.testContractIsOpen({from: node, gas: MAX_GAS})
          .then(val => val.should.not.exist)
          .catch(err => err.should.be.thrown))
      })
    })
  })
})

