// SCH Course Copyright Policy (C): DO-NOT-SHARE-WITH-ANYONE
// https://smartcontractshacking.com/#copyright-policy
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * @title EtherBank
 * @author JohnnyTime (https://smartcontractshacking.com)
 */

// @audit extend to use re-entrancy guard
contract EtherBank {

    mapping(address => uint256) public balances;

    function depositETH() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdrawETH() public {

        // @audit Check msg value is <= balances msg.sender
        // @audit Update balances
        // @audit Execute external call

        uint256 balance = balances[msg.sender];

        // Send ETH 
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Withdraw failed");

        // Update Balance
        balances[msg.sender] = 0;
    }
}