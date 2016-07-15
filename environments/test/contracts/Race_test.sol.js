// Factory "morphs" into a Pudding class.
// The reasoning is that calling load in each context
// is cumbersome.

(function() {

  var contract_data = {
    abi: [{"constant":false,"inputs":[{"name":"state","type":"uint8"}],"name":"setContractEndState","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"client","type":"address"},{"name":"authority","type":"address"}],"name":"setClientAuthority","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"racer","type":"address"}],"name":"getVerifier","outputs":[{"name":"verifier","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"node","type":"address"},{"name":"i","type":"uint256"}],"name":"setStateMap","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"stateMap","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[],"name":"testSenderUnknown","outputs":[{"name":"result","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"racer","type":"address"}],"name":"getState","outputs":[{"name":"state","type":"uint8"}],"type":"function"},{"constant":false,"inputs":[],"name":"advanceSelf","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"testSenderIsRacer","outputs":[{"name":"result","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"getMostRecentCommit","outputs":[{"name":"racer","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"client","type":"address"}],"name":"testClientCanStep","outputs":[{"name":"result","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"val","type":"bool"}],"name":"setContractOpen","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"racer","type":"address"}],"name":"testIsFirst","outputs":[{"name":"result","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"racer","type":"address"}],"name":"getEndBlock","outputs":[{"name":"endBlock","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"getStateMap","outputs":[{"name":"map","type":"address[2]"}],"type":"function"},{"constant":true,"inputs":[{"name":"racer","type":"address"}],"name":"getAuthority","outputs":[{"name":"authority","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"client","type":"address"}],"name":"getClientAccount","outputs":[{"name":"a","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"client","type":"address"},{"name":"state","type":"uint8"}],"name":"setClientState","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"startTime","outputs":[{"name":"","type":"uint64"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"racers","outputs":[{"name":"account","type":"address"},{"name":"authority","type":"address"},{"name":"state","type":"uint8"},{"name":"verifier","type":"address"},{"name":"timeVerified","type":"uint64"},{"name":"endBlock","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[],"name":"testBroadcastCommit","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"racer","type":"address"}],"name":"getTimeVerified","outputs":[{"name":"time","type":"uint64"}],"type":"function"},{"constant":true,"inputs":[],"name":"endState","outputs":[{"name":"","type":"uint8"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"racerList","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"client","type":"address"},{"name":"verifier","type":"address"}],"name":"setClientVerifier","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"racer","type":"address"}],"name":"deleteLastRacer","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"client","type":"address"},{"name":"time","type":"uint64"}],"name":"setClientTimeVerified","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"client","type":"address"},{"name":"time","type":"uint64"}],"name":"verify","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"client","type":"address"},{"name":"endBlock","type":"uint256"}],"name":"setClientEndBlock","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"client","type":"address"}],"name":"testClientIsRacer","outputs":[{"name":"result","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"testSenderIsFinished","outputs":[{"name":"result","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"client","type":"address"}],"name":"testNodeCanVerify","outputs":[{"name":"result","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"testSenderIsVerified","outputs":[{"name":"result","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"testContractIsOpen","outputs":[{"name":"result","type":"bool"}],"type":"function"},{"constant":false,"inputs":[],"name":"rewardSelf","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"testSenderIsAuthorized","outputs":[{"name":"result","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"testSenderCanStep","outputs":[{"name":"result","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"openContract","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"racer","type":"address"}],"name":"getAccount","outputs":[{"name":"account","type":"address"}],"type":"function"},{"constant":true,"inputs":[],"name":"testSenderCanCheckResults","outputs":[{"name":"result","type":"bool"}],"type":"function"},{"constant":false,"inputs":[],"name":"commitSelf","outputs":[],"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"address"},{"indexed":true,"name":"racer","type":"address"},{"indexed":true,"name":"contractAddress","type":"address"}],"name":"LogRegistration","type":"event"}],
    binary: "60606040526000805460018054600280546901000000000000000000604860020a60ff0219958616811760ff1990811686179096161790941683178555600160a060020a031991821673579fadbb36a7b7284ef4e50bbc83f3f294e9a8ec9081178316811790935592811682171617905561109690819061007f90396000f3606060405236156101d75760e060020a600035046301fbdbe581146101d95780630407bb3314610200578063059ce95d14610234578063092fb8fe1461025e5780631003b5021461028d578063120d450d146102ae5780631bab58f5146102d85780631e47505c14610309578063255a24161461033357806326cc8f041461035e578063390e0872146103ac5780633952f11d146103f05780633bc4a6041461040357806357702bff1461050557806359d171e21461052d5780635fabcaaf146105945780636c594f04146105bd5780636fa2e009146105e357806378e9792514610620578063790c5155146106385780637c6cd9591461069157806382eb51fc1461070d578063846329f1146107455780638e1ffe7c14610758578063a11595f11461078c578063ab32d9ce146107c3578063afc971cf1461088a578063b0ff50d9146108cb578063b786d278146108fc578063bcaeef2f14610924578063cc779a6214610955578063cf2a50c214610994578063cf8415a1146109f1578063d83978a014610a4f578063dd26851a14610a67578063e8709c6814610a91578063eeee34e714610abf578063f1864f1a14610aff578063fbcbc0f1146105bd578063fc1839e114610b0b578063fca285c814610b36575b005b6101d760043560008054604860020a830269ff000000000000000000199091161790555b50565b600435600160a060020a031660009081526003602052604090206001018054600160a060020a0319166024351790556101d7565b610b5f600435600160a060020a03818116600090815260036020526040902060020154165b919050565b6101d76004356024358160018260028110156100025750919091018054600160a060020a031916909117905550565b610b5f600435600181600281101561000257500154600160a060020a031681565b600160a060020a03338116600090815260036020526040812054610b7c92168114610c5c57610002565b610b90600435600160a060020a03811660009081526003602052604090206001015460a060020a900460ff16610259565b600160a060020a033381166000908152600360205260408120546101d792161415610d0257610002565b600160a060020a03338116600090815260036020526040812054610b7c9216811415610c5c57610002565b610b5f60048054600091906000198101908110156100025750805491527f8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19a0154600160a060020a0316610c60565b610b7c60043560008054600160a060020a0383168252600360205260408220600101548391604860020a900460ff90811660a060020a9092041610610d9c57610002565b6000805460ff19166004351790556101d7565b610b7c6004356000610da6825b6000808080805b60045460ff8516101561105c57600160a060020a03861660009081526003602081905260048054604084206002015460a060020a900467ffffffffffffffff16965091929160ff881690811015610002576000805160206110768339815191520154600160a060020a031682526040822060020154815460a060020a90910467ffffffffffffffff16955060ff881690811015610002576000805160206110768339815191520154600160a060020a03168252506040812090910154915081148015906104f757508167ffffffffffffffff168367ffffffffffffffff16115b1561106a5760009450611061565b610ba7600435600160a060020a03811660009081526003602081905260409091200154610259565b610bb96040604051908101604052806002905b600081526020019060019003908161054057505060408051808201918290529060019060029082845b8154600160a060020a0316815260019190910190602001808311610569575b50505050509050610c60565b610b5f600435600160a060020a0381811660009081526003602052604090206001015416610259565b610b5f600435600160a060020a0381811660009081526003602052604090205416610259565b600435600160a060020a03166000908152600360205260409020600101805460243560a060020a0260a060020a60ff0219919091161790556101d7565b610bdd600054610100900467ffffffffffffffff1681565b600360208190526004356000908152604090206002810154600182015482549290930154610bfb93600160a060020a03938416938181169360a060020a9283900460ff169391811692900467ffffffffffffffff169086565b6101d7610d005b60005b600260ff821610156101fd5730600160a060020a031633600160a060020a031660016000508360ff166002811015610002570154604051600160a060020a0391909116907fbf2838abc9c382fb1ebe7c6c085800054b50c6b634989a38ca619e318f6cc94390600090a460010161069b565b610bdd600435600160a060020a03811660009081526003602052604090206002015460a060020a900467ffffffffffffffff16610259565b610b90600054604860020a900460ff1681565b610b5f60043560048054829081101561000257506000526000805160206110768339815191520154600160a060020a031681565b600435600160a060020a031660009081526003602052604090206002018054602435600160a060020a0319919091161790556101d7565b6101d7600435600160a060020a038116600090815260036020819052604082208054600160a060020a031916815560018101805474ffffffffffffffffffffffffffffffffffffffffff191690556002810180547fffffffff00000000000000000000000000000000000000000000000000000000169055015560048054600019810190811015610002575080546000919091527f8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19a018054600160a060020a031916905550565b600435600160a060020a03166000908152600360205260409020600201805460a060020a67ffffffffffffffff02191660243560a060020a021790556101d7565b6101d7600435602435600160a060020a038281166000908152600360205260408120548492161415610dad57610002565b600435600160a060020a031660009081526003602081905260409091206024359101556101d7565b610b7c600435600160a060020a038181166000908152600360205260408120549091839116821415610d9c57610002565b610b7c6000805433600160a060020a031682526003602052604082206001015460a060020a900460ff908116604860020a9092041614610c5c57610002565b610b7c600435600160a060020a0381166000908152600360205260408120600190810154839160a060020a90910460ff9081168201919082166002811015610002570154600160a060020a039081163390911614610e9257610002565b610b7c33600160a060020a0316600090815260036020526040812060019081015460a060020a900460ff9081168201919082166002811015610002576040842060020154910154600160a060020a03908116911614610e9d57610002565b610b7c6000805460ff161515600114610c5c57610002565b600160a060020a033381166000908152600360205260408120546101d792161415610ea757610002565b610b7c33600160a060020a0390811660008181526003602052604081206001015490921614610c5c57610002565b610b7c6000805433600160a060020a0316825260036020526040822060010154604860020a90910460ff90811660a060020a9092041610610c5c57610002565b610b7c60005460ff1681565b610b7c33600160a060020a0316600090815260036020819052604082200154439010610c5c57610002565b600160a060020a033381166000908152600360205260408120546101d7921614610f1e57610002565b60408051600160a060020a03929092168252519081900360200190f35b604080519115158252519081900360200190f35b6040805160ff929092168252519081900360200190f35b60408051918252519081900360200190f35b60408051908190839080838184600060046021f15090500191505060405180910390f35b6040805167ffffffffffffffff929092168252519081900360200190f35b6040518087600160a060020a0316815260200186600160a060020a031681526020018560ff16815260200184600160a060020a031681526020018367ffffffffffffffff168152602001828152602001965050505050505060405180910390f35b5060015b90565b600160a060020a03331660009081526003602052604081206001818101805460a060020a60ff0219811660a060020a9182900460ff908116909401820217918290556002939093018054600160a060020a03191690559254604860020a900481169190920490911614156101fd57436003600050600033600160a060020a0316815260200190815260200160002060005060030160005081905550505b565b6000805433600160a060020a031682526003602052604090912060010154604860020a90910460ff90811660a060020a9092041610610d4057610002565b33600160a060020a0316600090815260036020526040902060019081015460a060020a900460ff908116820191908216600281101561000257604060002060020154910154600160a060020a03918216911614610c6357610002565b6001915050610259565b9050610259565b60008054600160a060020a038516825260036020526040909120600101548491604860020a900460ff90811660a060020a9092041610610dec57610002565b600160a060020a0384166000908152600360205260409020600190810154859160a060020a90910460ff9081168201919082166002811015610002570154600160a060020a039081163390911614610e4357610002565b50505050600160a060020a0382166000908152600360205260409020600201805460a060020a8302600160a060020a031991909116331760a060020a67ffffffffffffffff0219161790555050565b600192505050610259565b6001915050610c60565b6000805433600160a060020a03168252600360205260409091206001015460a060020a900460ff908116604860020a9092041614610ee457610002565b33600160a060020a031660009081526003602081905260409091200154439010610f0d57610002565b610f1633610410565b15610d00575b565b60005460ff161515600114610f3257610002565b6040805160c0810182523380825260208281018281526000848601818152606086018281526080870183815260a08801848152600160a060020a0390971684526003958690529790922095518654600160a060020a03199081169091178755925160018781018054935193861690921760a060020a60ff02191660a060020a9384021790915591516002870180549851989094161760a060020a67ffffffffffffffff02191696029590951790559051910155600480549182018082559091908281838015829011611031576000839052611031906000805160206110768339815191529081019083015b80821115611058576000815560010161101d565b5050506000928352506020909120018054600160a060020a03191633179055610d00610698565b5090565b600194505b50505050919050565b60019390930192610417568a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b",
    unlinked_binary: "60606040526000805460018054600280546901000000000000000000604860020a60ff0219958616811760ff1990811686179096161790941683178555600160a060020a031991821673579fadbb36a7b7284ef4e50bbc83f3f294e9a8ec9081178316811790935592811682171617905561109690819061007f90396000f3606060405236156101d75760e060020a600035046301fbdbe581146101d95780630407bb3314610200578063059ce95d14610234578063092fb8fe1461025e5780631003b5021461028d578063120d450d146102ae5780631bab58f5146102d85780631e47505c14610309578063255a24161461033357806326cc8f041461035e578063390e0872146103ac5780633952f11d146103f05780633bc4a6041461040357806357702bff1461050557806359d171e21461052d5780635fabcaaf146105945780636c594f04146105bd5780636fa2e009146105e357806378e9792514610620578063790c5155146106385780637c6cd9591461069157806382eb51fc1461070d578063846329f1146107455780638e1ffe7c14610758578063a11595f11461078c578063ab32d9ce146107c3578063afc971cf1461088a578063b0ff50d9146108cb578063b786d278146108fc578063bcaeef2f14610924578063cc779a6214610955578063cf2a50c214610994578063cf8415a1146109f1578063d83978a014610a4f578063dd26851a14610a67578063e8709c6814610a91578063eeee34e714610abf578063f1864f1a14610aff578063fbcbc0f1146105bd578063fc1839e114610b0b578063fca285c814610b36575b005b6101d760043560008054604860020a830269ff000000000000000000199091161790555b50565b600435600160a060020a031660009081526003602052604090206001018054600160a060020a0319166024351790556101d7565b610b5f600435600160a060020a03818116600090815260036020526040902060020154165b919050565b6101d76004356024358160018260028110156100025750919091018054600160a060020a031916909117905550565b610b5f600435600181600281101561000257500154600160a060020a031681565b600160a060020a03338116600090815260036020526040812054610b7c92168114610c5c57610002565b610b90600435600160a060020a03811660009081526003602052604090206001015460a060020a900460ff16610259565b600160a060020a033381166000908152600360205260408120546101d792161415610d0257610002565b600160a060020a03338116600090815260036020526040812054610b7c9216811415610c5c57610002565b610b5f60048054600091906000198101908110156100025750805491527f8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19a0154600160a060020a0316610c60565b610b7c60043560008054600160a060020a0383168252600360205260408220600101548391604860020a900460ff90811660a060020a9092041610610d9c57610002565b6000805460ff19166004351790556101d7565b610b7c6004356000610da6825b6000808080805b60045460ff8516101561105c57600160a060020a03861660009081526003602081905260048054604084206002015460a060020a900467ffffffffffffffff16965091929160ff881690811015610002576000805160206110768339815191520154600160a060020a031682526040822060020154815460a060020a90910467ffffffffffffffff16955060ff881690811015610002576000805160206110768339815191520154600160a060020a03168252506040812090910154915081148015906104f757508167ffffffffffffffff168367ffffffffffffffff16115b1561106a5760009450611061565b610ba7600435600160a060020a03811660009081526003602081905260409091200154610259565b610bb96040604051908101604052806002905b600081526020019060019003908161054057505060408051808201918290529060019060029082845b8154600160a060020a0316815260019190910190602001808311610569575b50505050509050610c60565b610b5f600435600160a060020a0381811660009081526003602052604090206001015416610259565b610b5f600435600160a060020a0381811660009081526003602052604090205416610259565b600435600160a060020a03166000908152600360205260409020600101805460243560a060020a0260a060020a60ff0219919091161790556101d7565b610bdd600054610100900467ffffffffffffffff1681565b600360208190526004356000908152604090206002810154600182015482549290930154610bfb93600160a060020a03938416938181169360a060020a9283900460ff169391811692900467ffffffffffffffff169086565b6101d7610d005b60005b600260ff821610156101fd5730600160a060020a031633600160a060020a031660016000508360ff166002811015610002570154604051600160a060020a0391909116907fbf2838abc9c382fb1ebe7c6c085800054b50c6b634989a38ca619e318f6cc94390600090a460010161069b565b610bdd600435600160a060020a03811660009081526003602052604090206002015460a060020a900467ffffffffffffffff16610259565b610b90600054604860020a900460ff1681565b610b5f60043560048054829081101561000257506000526000805160206110768339815191520154600160a060020a031681565b600435600160a060020a031660009081526003602052604090206002018054602435600160a060020a0319919091161790556101d7565b6101d7600435600160a060020a038116600090815260036020819052604082208054600160a060020a031916815560018101805474ffffffffffffffffffffffffffffffffffffffffff191690556002810180547fffffffff00000000000000000000000000000000000000000000000000000000169055015560048054600019810190811015610002575080546000919091527f8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19a018054600160a060020a031916905550565b600435600160a060020a03166000908152600360205260409020600201805460a060020a67ffffffffffffffff02191660243560a060020a021790556101d7565b6101d7600435602435600160a060020a038281166000908152600360205260408120548492161415610dad57610002565b600435600160a060020a031660009081526003602081905260409091206024359101556101d7565b610b7c600435600160a060020a038181166000908152600360205260408120549091839116821415610d9c57610002565b610b7c6000805433600160a060020a031682526003602052604082206001015460a060020a900460ff908116604860020a9092041614610c5c57610002565b610b7c600435600160a060020a0381166000908152600360205260408120600190810154839160a060020a90910460ff9081168201919082166002811015610002570154600160a060020a039081163390911614610e9257610002565b610b7c33600160a060020a0316600090815260036020526040812060019081015460a060020a900460ff9081168201919082166002811015610002576040842060020154910154600160a060020a03908116911614610e9d57610002565b610b7c6000805460ff161515600114610c5c57610002565b600160a060020a033381166000908152600360205260408120546101d792161415610ea757610002565b610b7c33600160a060020a0390811660008181526003602052604081206001015490921614610c5c57610002565b610b7c6000805433600160a060020a0316825260036020526040822060010154604860020a90910460ff90811660a060020a9092041610610c5c57610002565b610b7c60005460ff1681565b610b7c33600160a060020a0316600090815260036020819052604082200154439010610c5c57610002565b600160a060020a033381166000908152600360205260408120546101d7921614610f1e57610002565b60408051600160a060020a03929092168252519081900360200190f35b604080519115158252519081900360200190f35b6040805160ff929092168252519081900360200190f35b60408051918252519081900360200190f35b60408051908190839080838184600060046021f15090500191505060405180910390f35b6040805167ffffffffffffffff929092168252519081900360200190f35b6040518087600160a060020a0316815260200186600160a060020a031681526020018560ff16815260200184600160a060020a031681526020018367ffffffffffffffff168152602001828152602001965050505050505060405180910390f35b5060015b90565b600160a060020a03331660009081526003602052604081206001818101805460a060020a60ff0219811660a060020a9182900460ff908116909401820217918290556002939093018054600160a060020a03191690559254604860020a900481169190920490911614156101fd57436003600050600033600160a060020a0316815260200190815260200160002060005060030160005081905550505b565b6000805433600160a060020a031682526003602052604090912060010154604860020a90910460ff90811660a060020a9092041610610d4057610002565b33600160a060020a0316600090815260036020526040902060019081015460a060020a900460ff908116820191908216600281101561000257604060002060020154910154600160a060020a03918216911614610c6357610002565b6001915050610259565b9050610259565b60008054600160a060020a038516825260036020526040909120600101548491604860020a900460ff90811660a060020a9092041610610dec57610002565b600160a060020a0384166000908152600360205260409020600190810154859160a060020a90910460ff9081168201919082166002811015610002570154600160a060020a039081163390911614610e4357610002565b50505050600160a060020a0382166000908152600360205260409020600201805460a060020a8302600160a060020a031991909116331760a060020a67ffffffffffffffff0219161790555050565b600192505050610259565b6001915050610c60565b6000805433600160a060020a03168252600360205260409091206001015460a060020a900460ff908116604860020a9092041614610ee457610002565b33600160a060020a031660009081526003602081905260409091200154439010610f0d57610002565b610f1633610410565b15610d00575b565b60005460ff161515600114610f3257610002565b6040805160c0810182523380825260208281018281526000848601818152606086018281526080870183815260a08801848152600160a060020a0390971684526003958690529790922095518654600160a060020a03199081169091178755925160018781018054935193861690921760a060020a60ff02191660a060020a9384021790915591516002870180549851989094161760a060020a67ffffffffffffffff02191696029590951790559051910155600480549182018082559091908281838015829011611031576000839052611031906000805160206110768339815191529081019083015b80821115611058576000815560010161101d565b5050506000928352506020909120018054600160a060020a03191633179055610d00610698565b5090565b600194505b50505050919050565b60019390930192610417568a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b",
    address: "0x4cfdbf099e9da3e2a06701902ac5da54da5b61e8",
    generated_with: "2.0.9",
    contract_name: "Race_test"
  };

  function Contract() {
    if (Contract.Pudding == null) {
      throw new Error("Race_test error: Please call load() first before creating new instance of this contract.");
    }

    Contract.Pudding.apply(this, arguments);
  };

  Contract.load = function(Pudding) {
    Contract.Pudding = Pudding;

    Pudding.whisk(contract_data, Contract);

    // Return itself for backwards compatibility.
    return Contract;
  }

  Contract.new = function() {
    if (Contract.Pudding == null) {
      throw new Error("Race_test error: Please call load() first before calling new().");
    }

    return Contract.Pudding.new.apply(Contract, arguments);
  };

  Contract.at = function() {
    if (Contract.Pudding == null) {
      throw new Error("Race_test error: Please call load() first before calling at().");
    }

    return Contract.Pudding.at.apply(Contract, arguments);
  };

  Contract.deployed = function() {
    if (Contract.Pudding == null) {
      throw new Error("Race_test error: Please call load() first before calling deployed().");
    }

    return Contract.Pudding.deployed.apply(Contract, arguments);
  };

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of Pudding in the browser,
    // and we can use that.
    window.Race_test = Contract;
  }

})();
