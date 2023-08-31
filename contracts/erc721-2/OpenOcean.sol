// SPDX-License-Identifier: MIT
// SCH Course Copyright Policy (C): DO-NOT-SHARE-WITH-ANYONE
// https://smartcontractshacking.com/#copyright-policy
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

/**
 * @title OpenOcean
 * @author JohnnyTime (https://smartcontractshacking.com)
 */
contract OpenOcean {
    using Counters for Counters.Counter;
    uint256 private immutable MAX_PRICE = 100 ether;
    Counters.Counter private itemsCounter;
    mapping(uint256 => Item) public listedItems;

    struct Item {
        uint256 itemId;
        address collection;
        uint256 tokenId;
        uint256 price;
        address payable seller;
        bool isSold;
    }

    constructor() {
        itemsCounter.increment();
    }

    function listItem(
        address _collection,
        uint256 _tokenId,
        uint256 _price
    ) external {
        require(_price <= MAX_PRICE, "Price is for NFT is too high");
        IERC721(_collection).transferFrom(msg.sender, address(this), _tokenId);
        Item memory _item;
        
        _item.itemId = itemsCounter.current();
        _item.collection = _collection;
        _item.tokenId = _tokenId;
        _item.price = _price;
        _item.seller = payable(msg.sender);

        uint256 _current = itemsCounter.current();
        itemsCounter.increment();
        listedItems[_current] = _item;
    }

    // TODO: Purchase item function
    // 1. Check that item exists and not sold
    //    ===> Items[itemId] _isSold should be False
    // 2. Check that enough ETH was paid
    //    ===> Check msg.value
    // 3. Change item status to "sold"
    //    ===> Items[itemId] _isSold should set to True
    // 4. Transfer NFT to buyer
    //    ===> call TransferFrom(this, buyer, tokenId(fromItemId))
    // 5. Transfer ETH to seller
    //    ===> Native Eth Transfer
    function purchase(uint _itemId) external payable {
        Item memory _item = listedItems[_itemId];
        require(_itemId <= itemsCounter.current(), "Item out of range");
        require(_item.isSold == false, "Item has already been purchased");
        require(msg.value == _item.price, "Too little/much ETH paid");
        Item storage item = listedItems[_itemId];
        item.isSold = true;
        IERC721(_item.collection).transferFrom(address(this), msg.sender, _item.tokenId);
        (bool sent,) = _item.seller.call{value: msg.value}("");
        require(sent, "Failed to send Ether");
    }
}
