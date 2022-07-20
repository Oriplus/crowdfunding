const { expect } = require('chai');
const hre = require('hardhat');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

describe('Crowdfunding file', () => {
  it('gets the Crowdfunding contract', async () => {
    await hre.ethers.getContractFactory('Crowdfunding');
  });
});

describe('Crowdfunding contract', () => {
  async function deployCrowfundingFixture() {
    const id = 'pro001';
    const projectName = 'project 1';
    const projectDescription = 'I\'m the first project here';
    const [owner] = await hre.ethers.getSigners();
    const fundsGoal = 2;
    const crowdfundingContract = await hre.ethers.getContractFactory('Crowdfunding');
    const crowdfunding = await crowdfundingContract.deploy(
      id,
      projectName,
      projectDescription,
      fundsGoal,
    );
    return {
      crowdfunding, id, projectName, projectDescription, owner, fundsGoal,
    };
  }
  it("Project's id", async () => {
    const { crowdfunding, id } = await loadFixture(deployCrowfundingFixture);
    expect(await crowdfunding.id()).to.equal(id);
  });
  it("Project's name", async () => {
    const { crowdfunding, projectName } = await loadFixture(deployCrowfundingFixture);
    expect(await crowdfunding.projectName()).to.equal(projectName);
  });
  it("Project's description", async () => {
    const { crowdfunding, projectDescription } = await loadFixture(deployCrowfundingFixture);
    expect(await crowdfunding.description()).to.equal(projectDescription);
  });
  it("Project's author", async () => {
    const { crowdfunding, owner } = await loadFixture(deployCrowfundingFixture);
    expect(await crowdfunding.author()).equal(owner.address);
  });
  it("Project's status", async () => {
    const { crowdfunding } = await loadFixture(deployCrowfundingFixture);
    expect(await crowdfunding.status()).to.equal(false);
  });
  it("Project's fund", async () => {
    const { crowdfunding } = await loadFixture(deployCrowfundingFixture);
    expect(await crowdfunding.funds()).to.equal(0);
  });
  it("Project's funds' goal", async () => {
    const { crowdfunding, fundsGoal } = await loadFixture(deployCrowfundingFixture);
    expect(await crowdfunding.fundsGoal()).to.equal(fundsGoal);
  });
});
