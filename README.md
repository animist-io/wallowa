# wallowa
**Warning: Under construction and not usable. Draft copy.**

This repo will house templates for / examples of contracts that can processed by Animist IoT endpoints. Initial work is being done on a simple contract that allows contestants to participate in a wagered race from one endpoint to another.

Goals: 

+ To provide a variety of animist Solidity examples that have good continuous integration features (e.g tests / coverage reports running on Travis CI and coherent, navigable documentation). 
+ To be a resource that lets Animist app developers adapt well-developed code & patterns to achieve their own ends. Or very similar ends. 

Testing requires installation of [truffle](https://github.com/ConsenSys/truffle) and [test-rpc](https://github.com/ethereumjs/testrpc).

```
$ npm install -g truffle
$ npm install -g test-rpc
```

To run test-rpc with 5 accounts that are preserved between sessions

```
$ ./rpc.sh
```

**The following is a draft. 'Race' is an incomplete contract.** 
----------------------------- OVERVIEW OF 'RACE'----------------------------------------

This is a sample contract for a race in which contestants commit stakes and execute 
transactions on their own account, paying an Animist node to authenticate their presence 
at pre-defined locations in a pre-defined sequence. If implemented in a mobile app it would
serve as a template that is filled out, compiled and deployed on a race by race basis. 

(See ProvidedRace.sol for an example of a race where a third
party - an app producer/provider - manages transactions on behalf of racers)

------------------------------- DESCRIPTION --------------------------------------------

// + A 'race' is a finite sequence of steps, each consisting of a visit to
//   a pre-defined location. A location's identity is represented by the
//   account address of the Animist node resident there. Step zero of a race differs from 
//   other steps in that all contestants must be simultaneously present before 
//   any contestant can advance beyond it. 

// + When a racer is proximity detected by the Animist node specified for a given step, 
//   it prints a timestamped verification of the their presence to the contract. 
//   The racer can then request to advance a step. 

// + A racer finishes by completing the last step. Winning entails having 
//   the earliest verified finishing time among the contestants who finish. 
//   Contract can pay out as soon as the fastest racer's finishing step has been mined. 


----------------------------- CONTRACT MECHANICS --------------------------------------

Each step consists of: 

a) Endpoint verification of racer presence (accomplished w/ the endpoints account)  
b) Racer's request to the contract advance them a step. (Predicated by endpoint ver.)

After each step the contract checks to see if the racer has finished. If a racer has
finished and the block they ended on has been mined, they may query the contract to 
see if they won and receive a reward.

--------------------------- CONTRACT DESIGN ISSUES ------------------------------------

To Do

+ Discuss [contract oriented programming](https://medium.com/@gavofyork/condition-orientated-programming-969f6ba0161a#.vh880g6mw)
+ Iterate through these [security issues / best practices](https://github.com/ConsenSys/smart-contract-best-practices) and talk about how contract addresses them.


