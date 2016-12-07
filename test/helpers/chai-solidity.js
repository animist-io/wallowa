let chai = require('chai');

module.exports = function(chai, util){
  var Assertion = chai.Assertion

  Assertion.addProperty('thrown', function(){
    this.assert(
        Object.keys(this._obj).length === 0
      , 'expected #{this} to have been thrown by solidity'
      , 'expected #{this} not to have been thrown by solidity'
    )
  })
}
  

