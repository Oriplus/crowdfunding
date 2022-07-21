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
    const [owner, addr1] = await hre.ethers.getSigners();
    const crowdfundingContract = await hre.ethers.getContractFactory('Crowdfunding');
    const crowdfunding = await crowdfundingContract.deploy();
    return {
      crowdfunding,
      owner,
      addr1,
    };
  }

  async function createProject() {
    const { crowdfunding, owner, addr1 } = await loadFixture(deployCrowfundingFixture);
    const values = {
      id: 'pro001', projectName: 'project 1', description: "I'm the first project here", fundsGoal: hre.ethers.utils.parseEther('2.0'),
    };
    await crowdfunding.createProject(
      values.id,
      values.projectName,
      values.description,
      values.fundsGoal,
    );
    const [id, projectName, description, author, active, funds, fundsGoal] = await crowdfunding.projects(0);
    return {
      values,
      id,
      projectName,
      description,
      author,
      active,
      funds,
      fundsGoal,
      owner,
      addr1,
      crowdfunding,
    };
  }

  it('Should fail. Goal must be greater than 0', async () => {
    const { crowdfunding } = await loadFixture(deployCrowfundingFixture);
    const values = {
      id: 'pro001', projectName: 'project 1', description: "I'm the first project here", fundsGoal: hre.ethers.utils.parseEther('0'),
    };
    await expect(crowdfunding.createProject(
      values.id,
      values.projectName,
      values.description,
      values.fundsGoal,
    )).to.be.revertedWith(
      'Goal must be greater than 0',
    );
  });

  it('Project id', async () => {
    const { values, id } = await loadFixture(createProject);
    expect(id).to.equal(values.id);
  });

  it('Name of the Project', async () => {
    const { values, projectName } = await loadFixture(createProject);
    expect(projectName).to.equal(values.projectName);
  });

  it('Description of the project', async () => {
    const { values, description } = await loadFixture(createProject);
    expect(description).to.equal(values.description);
  });

  it('Author of the Project', async () => {
    const { author, owner } = await loadFixture(createProject);
    expect(author).equal(owner.address);
  });

  it('Status of the project', async () => {
    const { active } = await loadFixture(createProject);
    expect(active).to.equal(1);
  });

  it('Project funds', async () => {
    const { funds } = await loadFixture(createProject);
    expect(funds).to.equal(0);
  });

  it('Project funds goal', async () => {
    const { fundsGoal, values } = await loadFixture(createProject);
    expect(fundsGoal).to.equal(values.fundsGoal);
  });

  describe('Sending funds to a project', async () => {
    it('Sends funds to a Project from other address', async () => {
      const { crowdfunding, addr1 } = await loadFixture(createProject);
      const options = { value: hre.ethers.utils.parseEther('1') };
      await expect(crowdfunding.connect(addr1).fundProject(0, options)).to.emit(crowdfunding, 'projectFunded').withArgs(options.value, 'pro001');
      const [id, projectName, description, author, active, funds, fundsGoal] = await crowdfunding.projects(0);
      expect(await funds).to.equal(options.value);
    });

    it('Should fail. Can not fund inactive projects', async () => {
      const { crowdfunding, addr1 } = await loadFixture(createProject);
      const options = { value: hre.ethers.utils.parseEther('1.0') };
      await crowdfunding.changeStatus(0, 0);
      await expect(crowdfunding.connect(addr1).fundProject(0, options)).to.be.revertedWith(
        'The project is closed, you can not send funds',
      );
    });

    it('Should fail. Can not fund 0 value', async () => {
      const { crowdfunding, addr1 } = await await loadFixture(createProject);
      const options = { value: hre.ethers.utils.parseEther('0') };
      await expect(crowdfunding.connect(addr1).fundProject(0, options)).to.be.revertedWith(
        'Fund value must be greater than 0',
      );
    });

    it('Should fail. Owners can not fund their own projects', async () => {
      const { crowdfunding, owner } = await await loadFixture(createProject);
      const options = { value: hre.ethers.utils.parseEther('1.0') };
      await expect(crowdfunding.connect(owner).fundProject(0, options)).to.be.revertedWith(
        'Owners can not fund their own projects',
      );
    });
  });

  describe('Changing status of a project', async () => {
    it('Owner changes the status of the Project', async () => {
      const { crowdfunding, owner } = await loadFixture(createProject);
      await expect(crowdfunding.connect(owner).changeStatus(0, 0)).to.emit(crowdfunding, 'statusProject').withArgs(0, 'pro001');
      const [id, projectName, description, author, active, funds, fundsGoal] = await crowdfunding.projects(0);
      expect(active).to.equal(0);
    });

    it('Should fail. Only the owner can changes the status of the Project', async () => {
      const { crowdfunding, owner } = await loadFixture(createProject);
      await expect(crowdfunding.connect(owner).changeStatus(1, 0)).to.be.revertedWith(
        'The project is in that status already',
      );
    });

    it('Should fail. Only the owner can changes the status of the Project', async () => {
      const { crowdfunding, addr1 } = await loadFixture(createProject);
      await expect(crowdfunding.connect(addr1).changeStatus(0, 0)).to.be.revertedWith(
        'Only the owner can changes the status of the Project',
      );
    });
  });
});
