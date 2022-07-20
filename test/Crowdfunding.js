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
    const projectDescription = "I'm the first project here";
    const [owner, addr1] = await hre.ethers.getSigners();
    const fundsGoal = hre.ethers.utils.parseEther('2.0');
    const crowdfundingContract = await hre.ethers.getContractFactory('Crowdfunding');
    const crowdfunding = await crowdfundingContract.deploy(
      id,
      projectName,
      projectDescription,
      fundsGoal,
    );
    return {
      crowdfunding,
      id,
      projectName,
      projectDescription,
      owner,
      fundsGoal,
      addr1,
    };
  }
  it('Project id', async () => {
    const { crowdfunding, id } = await loadFixture(deployCrowfundingFixture);
    expect(await crowdfunding.id()).to.equal(id);
  });

  it('Name of the Project', async () => {
    const { crowdfunding, projectName } = await loadFixture(deployCrowfundingFixture);
    expect(await crowdfunding.projectName()).to.equal(projectName);
  });

  it('Description of the project', async () => {
    const { crowdfunding, projectDescription } = await loadFixture(deployCrowfundingFixture);
    expect(await crowdfunding.description()).to.equal(projectDescription);
  });

  it('Author of the Project', async () => {
    const { crowdfunding, owner } = await loadFixture(deployCrowfundingFixture);
    expect(await crowdfunding.author()).equal(owner.address);
  });

  it('Status of the project', async () => {
    const { crowdfunding } = await loadFixture(deployCrowfundingFixture);
    expect(await crowdfunding.active()).to.equal(false);
  });

  it('Project funds', async () => {
    const { crowdfunding } = await loadFixture(deployCrowfundingFixture);
    expect(await crowdfunding.funds()).to.equal(0);
  });

  it('Project funds goal', async () => {
    const { crowdfunding, fundsGoal } = await loadFixture(deployCrowfundingFixture);
    expect(await crowdfunding.fundsGoal()).to.equal(fundsGoal);
  });

  describe('Sending funds to a project', async () => {
    it('Sends funds to a Project from other address', async () => {
      const { crowdfunding, addr1 } = await loadFixture(deployCrowfundingFixture);
      const options = { value: hre.ethers.utils.parseEther('1.0') };
      await crowdfunding.connect(addr1).fundProject(options);
      expect(await crowdfunding.funds()).to.equal(options.value);
    });

    it('Should fail. Owners can not fund their own projects', async () => {
      const { crowdfunding, owner } = await loadFixture(deployCrowfundingFixture);
      const options = { value: hre.ethers.utils.parseEther('1.0') };
      await expect(crowdfunding.connect(owner).fundProject(options)).to.be.revertedWith(
        'Owners can not fund their own projects',
      );
    });
  });

  describe('Changing status of a project', async () => {
    it('Owner changes the status of the Project', async () => {
      const { crowdfunding, owner} = await loadFixture(deployCrowfundingFixture);
      await crowdfunding.connect(owner).changeStatus(false);
      expect(await crowdfunding.active()).to.equal(false);
    });

    it('Should fail. Only the owner can changes the status of the Project', async () => {
      const { crowdfunding, addr1 } = await loadFixture(deployCrowfundingFixture);
      await crowdfunding.changeStatus(false);
      await expect(crowdfunding.connect(addr1).changeStatus(false)).to.be.revertedWith(
        'Only the owner can changes the status of the Project',
      );
    });
  });
});
