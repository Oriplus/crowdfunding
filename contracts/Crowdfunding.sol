// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Crowdfunding {

  string public id;
  string public projectName;
  string public description;
  address public author;
  bool public status;
  uint public funds;
  uint public fundsGoal;

  constructor(string memory _id, string memory _projectName, string memory _description, uint _fundsGoal) {
    id = _id;
    projectName =_projectName;
    description =_description;
    fundsGoal =_fundsGoal;
    author = payable(msg.sender);
  }
}