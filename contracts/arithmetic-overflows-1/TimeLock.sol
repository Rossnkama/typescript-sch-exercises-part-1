// SCH Course Copyright Policy (C): DO-NOT-SHARE-WITH-ANYONE
// https://smartcontractshacking.com/#copyright-policy
pragma solidity ^0.7.0;

import "hardhat/console.sol";

/**
 * @title TimeLock
 * @author JohnnyTime (https://smartcontractshacking.com)
 */
contract TimeLock {
    mapping(address => uint) public balancesByWallet;
    mapping(address => uint) public lockTimesByWallet;

    constructor() {
        console.log("CONTRUCTOR");
    }

    function depositETH() public payable {
        balancesByWallet[msg.sender] += msg.value;
        lockTimesByWallet[msg.sender] = block.timestamp + 30 days;
    }

    function increaseMyLockTime(uint _secondsToIncrease) public {
        lockTimesByWallet[msg.sender] += _secondsToIncrease;
    }

    function withdrawETH() public {
        require(balancesByWallet[msg.sender] > 0);
        require(block.timestamp > lockTimesByWallet[msg.sender]);

        uint transferValue = balancesByWallet[msg.sender];
        balancesByWallet[msg.sender] = 0;

        (bool sent, ) = msg.sender.call{value: transferValue}("");
        require(sent, "Failed to send ETH");
    }
}
