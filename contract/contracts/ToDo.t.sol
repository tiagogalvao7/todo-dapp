// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {ToDo} from "./ToDo.sol";
import {Test} from "forge-std/Test.sol";

// Solidity tests are compatible with foundry, so they
// use the same syntax and offer the same functionality.

contract ToDoTest is Test {
  ToDo counter;

  function setUp() public {
    counter = new ToDo();
  }
}
