// Factory "morphs" into a Pudding class.
// The reasoning is that calling load in each context
// is cumbersome.

(function() {

  var contract_data = {
    abi: [{"constant":false,"inputs":[{"name":"new_address","type":"address"}],"name":"upgrade","outputs":[],"type":"function"},{"constant":true,"inputs":[],"name":"last_completed_migration","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"completed","type":"uint256"}],"name":"setCompleted","outputs":[],"type":"function"},{"inputs":[],"type":"constructor"}],
    binary: "606060405260008054600160a060020a0319163317905560f7806100236000396000f3606060405260e060020a60003504630900f01081146038578063445df0ac1460b05780638da5cb5b1460b8578063fdacd5761460c9575b005b60366004356000805433600160a060020a039081169116141560ac576001547ffdacd5760000000000000000000000000000000000000000000000000000000060609081526064919091528291600160a060020a0383169163fdacd5769160849160248183876161da5a03f1156002575050505b5050565b60ed60015481565b60ed600054600160a060020a031681565b603660043560005433600160a060020a039081169116141560ea5760018190555b50565b6060908152602090f3",
    unlinked_binary: "606060405260008054600160a060020a0319163317905560f7806100236000396000f3606060405260e060020a60003504630900f01081146038578063445df0ac1460b05780638da5cb5b1460b8578063fdacd5761460c9575b005b60366004356000805433600160a060020a039081169116141560ac576001547ffdacd5760000000000000000000000000000000000000000000000000000000060609081526064919091528291600160a060020a0383169163fdacd5769160849160248183876161da5a03f1156002575050505b5050565b60ed60015481565b60ed600054600160a060020a031681565b603660043560005433600160a060020a039081169116141560ea5760018190555b50565b6060908152602090f3",
    address: "",
    generated_with: "2.0.9",
    contract_name: "Migrations"
  };

  function Contract() {
    if (Contract.Pudding == null) {
      throw new Error("Migrations error: Please call load() first before creating new instance of this contract.");
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
      throw new Error("Migrations error: Please call load() first before calling new().");
    }

    return Contract.Pudding.new.apply(Contract, arguments);
  };

  Contract.at = function() {
    if (Contract.Pudding == null) {
      throw new Error("Migrations error: Please call load() first before calling at().");
    }

    return Contract.Pudding.at.apply(Contract, arguments);
  };

  Contract.deployed = function() {
    if (Contract.Pudding == null) {
      throw new Error("Migrations error: Please call load() first before calling deployed().");
    }

    return Contract.Pudding.deployed.apply(Contract, arguments);
  };

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of Pudding in the browser,
    // and we can use that.
    window.Migrations = Contract;
  }

})();
