// Factory "morphs" into a Pudding class.
// The reasoning is that calling load in each context
// is cumbersome.

(function() {

  var contract_data = {
    abi: [{"constant":false,"inputs":[{"name":"node","type":"address"},{"name":"channel","type":"uint256"},{"name":"val","type":"uint256"}],"name":"broadcast","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"node","type":"address"},{"name":"account","type":"address"},{"name":"contractAddress","type":"address"}],"name":"register","outputs":[],"type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"address"},{"indexed":true,"name":"account","type":"address"},{"indexed":true,"name":"contractAddress","type":"address"}],"name":"LogRegistration","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"node","type":"address"},{"indexed":true,"name":"channel","type":"uint256"},{"indexed":true,"name":"value","type":"uint256"}],"name":"LogBroadcast","type":"event"}],
    binary: "606060405260c88060106000396000f3606060405260e060020a600035046375655d3981146024578063f3201424146073575b005b6022600435602435604435808273ffffffffffffffffffffffffffffffffffffffff85167f3c5c79b8d057b8cbdd71e29ff2756026514301e851e7f16e029959f4b1334ce860006060a4505050565b602260043560243560443573ffffffffffffffffffffffffffffffffffffffff808216908084169085167fbf2838abc9c382fb1ebe7c6c085800054b50c6b634989a38ca619e318f6cc94360006060a450505056",
    unlinked_binary: "606060405260c88060106000396000f3606060405260e060020a600035046375655d3981146024578063f3201424146073575b005b6022600435602435604435808273ffffffffffffffffffffffffffffffffffffffff85167f3c5c79b8d057b8cbdd71e29ff2756026514301e851e7f16e029959f4b1334ce860006060a4505050565b602260043560243560443573ffffffffffffffffffffffffffffffffffffffff808216908084169085167fbf2838abc9c382fb1ebe7c6c085800054b50c6b634989a38ca619e318f6cc94360006060a450505056",
    address: "0x37083264b459cfb396ae4af268fea02b31cd0646",
    generated_with: "2.0.9",
    contract_name: "AnimistEvent"
  };

  function Contract() {
    if (Contract.Pudding == null) {
      throw new Error("AnimistEvent error: Please call load() first before creating new instance of this contract.");
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
      throw new Error("AnimistEvent error: Please call load() first before calling new().");
    }

    return Contract.Pudding.new.apply(Contract, arguments);
  };

  Contract.at = function() {
    if (Contract.Pudding == null) {
      throw new Error("AnimistEvent error: Please call load() first before calling at().");
    }

    return Contract.Pudding.at.apply(Contract, arguments);
  };

  Contract.deployed = function() {
    if (Contract.Pudding == null) {
      throw new Error("AnimistEvent error: Please call load() first before calling deployed().");
    }

    return Contract.Pudding.deployed.apply(Contract, arguments);
  };

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of Pudding in the browser,
    // and we can use that.
    window.AnimistEvent = Contract;
  }

})();
