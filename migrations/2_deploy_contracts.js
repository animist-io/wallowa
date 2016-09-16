module.exports = function(deployer) {
  //deployer.deploy(ConvertLib);
  deployer.deploy(AnimistEvent);
  deployer.deploy(AnimistAPI);
  deployer.deploy(Race);
  deployer.deploy(Race_test);
  deployer.autolink();
};
