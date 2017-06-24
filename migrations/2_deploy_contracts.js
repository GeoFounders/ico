var tokenContract = artifacts.require("./GUNS.sol");

module.exports = async function(deployer, network, accounts) {
    if (network === "development") return;

    deployer.deploy(tokenContract);
};
