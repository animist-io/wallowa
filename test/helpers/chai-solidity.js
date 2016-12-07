let chai = require('chai');

module.exports = function(chai, util){
  var Assertion = chai.Assertion

  Assertion.addProperty('thrown', function(){
    this.assert(
        Object.keys(this._obj).length === 0
      , 'expected "VM Exception" to have been thrown'
      , 'did not expect #{this} to have been thrown by VM'
    )
  })
}
  

