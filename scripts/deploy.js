const { ethers } = require('hardhat');

async function main() {
  const CrowdfundingContract = await ethers.getContractFactory('Crowdfunding');
  const crowdfunding = await CrowdfundingContract.deploy();

  await crowdfunding.deployed();

  console.log('Deployed at', crowdfunding.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
