// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Ordinary Solidity. It runs on BKC exactly as it runs anywhere else.
contract Counter {
    uint256 public value;

    event Changed(uint256 value, address by);

    function increment() external {
        value += 1;
        emit Changed(value, msg.sender);
    }

    function set(uint256 newValue) external {
        value = newValue;
        emit Changed(newValue, msg.sender);
    }
}
