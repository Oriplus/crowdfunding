// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Crowdfunding {

  string public id;
  string public projectName;
  string public description;
  address payable public author;
  bool public active;
  uint public funds;
  uint public fundsGoal;

  constructor(string memory _id, string memory _projectName, string memory _description, uint _fundsGoal) {
    id = _id;
    projectName =_projectName;
    description =_description;
    fundsGoal =_fundsGoal;
    author = payable(msg.sender);
  }

  modifier notOwner() {
    require(
      msg.sender != author,
      "Owners can not fund their own projects"
    );
    _;
  }

  modifier onlyOwner() {
    require(
      msg.sender == author,
      "Only the owner can changes the status of the Project"
    );
    _;
  }

  /** Sends Eth to the project */
  function fundProject() public payable notOwner{
    author.transfer(msg.value);
    funds += msg.value;
  }

  /** Change the status of the project */
  function changeStatus(bool _active) public onlyOwner{
    active = _active;
  }
}