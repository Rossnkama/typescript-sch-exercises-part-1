// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract MyNft is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter public currentSupply;
    uint16 public immutable MAX_SUPPLY = 10_000;

    constructor() ERC721("MyNFT", "MYNFT") {}

    function safeMint(address to) external payable {
        require(msg.value >= 0.1 ether, "To mint costs 0.1 ETH");
        require(
            currentSupply.current() < MAX_SUPPLY,
            "Max supply has been exceeded"
        );
        currentSupply.increment();
        _safeMint(to, currentSupply.current());
    }

    function batchSafeMint(address to, uint256 amount) external payable {
        uint256 _amount = MAX_SUPPLY - (amount - 1);
        require(
            msg.value >= 0.1 ether * amount,
            "To mint costs 0.1 ETH per NFT"
        );
        require(currentSupply.current() < _amount);

        for (uint i = 0; i < amount; i++) {
            currentSupply.increment();
            _safeMint(to, currentSupply.current());
        }
    }
}
