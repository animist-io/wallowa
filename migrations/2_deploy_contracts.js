module.exports = function(deployer) {
  deployer.deploy(AnimistEvent);
  deployer.deploy(AnimistAPI);
  deployer.deploy(Race);
  deployer.deploy(TestRace);
  deployer.autolink();
};
