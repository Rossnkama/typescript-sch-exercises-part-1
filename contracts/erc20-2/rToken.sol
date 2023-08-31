// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title rToken
 * @author JohnnyTime (https://smartcontractshacking.com)
 */
contract rToken is ERC20, Ownable {
    address public underlyingTokenAddress;

    constructor(
        address _underlyingToken,
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) notDead(_underlyingToken) {
        underlyingTokenAddress = _underlyingToken;
    }

    function mint(address account, uint256 amount) external onlyOwner {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) external onlyOwner {
        _burn(account, amount);
    }

    modifier notDead(address addr) {
        require(addr != address(0), "Address is the zero address");
        _;
    }
}
