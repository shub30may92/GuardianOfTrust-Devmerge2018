var Election = artifacts.require("./Bidding.sol");

module.exports = function(deployer) {
  deployer.deploy(Election);
};