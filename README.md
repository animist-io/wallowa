# wallowa
**(Warning: Draft. Under construction. Unusable.)**

This repo will house Solidity templates that target Animist IoT endpoints. Initial work is being done on a simple contract that allows contestants to participate in a wagered race from one endpoint to another.

## Installation

```
$ npm install -g truffle@1.0.3
$ npm install -g ethereumjs-testrpc
```

To run test-rpc with 5 accounts that are preserved between sessions

```
$ ./bin/rpc.sh
```

# Race.sol    [![Build Status](https://travis-ci.org/animist-io/wallowa.svg?branch=master)](https://travis-ci.org/animist-io/wallowa)

**Draft. Incomplete (see issues).**

Race.sol allows contestants commit stakes to a race and pay an Animist IoT node to authenticate their presence at specified start, finish and through points. If implemented in a mobile app the solidity file would serve as a template whose details are filled out, compiled and deployed on a race by race basis. 

(See /resources/ProvidedRace.sol for an example of a race where a third party - an app producer/provider - manages transactions on behalf of racers)

## Description 

+ A 'race' is a finite sequence of steps, each consisting of a visit to a pre-defined location. A location's identity is represented by the account address of the Animist node resident there. Step zero of a race differs from other steps in that all contestants must be simultaneously present before any contestant can advance beyond it. 

+ When a racer connects to the Animist node specified for a given step, it prints a timestamped verification of their presence to the contract. The racer can then publish a request to advance a step.  

+ A racer finishes by completing the last step. Winning entails having the earliest verified finishing time among the contestants who finish. The contract can pay out as soon as the fastest racer's finishing step has been mined. 


## Contract Mechanics

Each step consists of: 

a) Endpoint verification of racer presence (accomplished w/ the endpoints account)  
b) Racer's request to the contract advance them a step. (Predicated by endpoint ver.)

After each step the contract checks to see if the racer has finished. If a racer has finished and the block they ended on has been mined, they may query the contract to see if they won and receive a reward.

## Design Issues

**To Do**

+ Discuss [contract oriented programming](https://medium.com/@gavofyork/condition-orientated-programming-969f6ba0161a#.vh880g6mw)
+ Iterate through these [security issues / best practices](https://github.com/ConsenSys/smart-contract-best-practices) and talk about how contract addresses them.

## Repo Goals: 

+ To provide examples of contracts using the animist API.
+ To provide Solidity code that has some continuous integration features (e.g tests running on Travis CI and coherent, navigable documentation). 
+ To be a resource that lets you quickly adapt simple code & patterns to achieve your own ends.  
