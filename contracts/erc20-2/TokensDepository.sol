// SPDX-license-identifier: MIT
// https://smartcontractshacking.com/#copyright-policy
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {rToken} from "./rToken.sol";
import "hardhat/console.sol";

/**
 * @title TokensDepository
 * @author JohnnyTime (https://smartcontractshacking.com)
 */
contract TokensDepository {
    address public WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public AAVE = 0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9;
    address public UNI = 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984;

    mapping(address => rToken) originalToReciept;

    event Debug(address addr);

    rToken public rWETH;
    rToken public rAAVE;
    rToken public rUNI;

    constructor() {
        rWETH = new rToken(WETH, "Reciept WETH", "rWETH");
        rAAVE = new rToken(AAVE, "Reciept AAVE", "rAAVE");
        rUNI = new rToken(UNI, "Reciept UNI", "rUNI");

        originalToReciept[WETH] = rWETH;
        originalToReciept[AAVE] = rAAVE;
        originalToReciept[UNI] = rUNI;
    }

    function deposit(
        address _token,
        uint256 _amount
    ) external payable isSupported(_token) {
        bool success = IERC20(_token).transferFrom(
            msg.sender,
            address(this),
            _amount
        );

        console.log(msg.sender, "TOP LEVEL");
        test();

        require(success, "Transfer from failed");

        originalToReciept[_token].mint(msg.sender, _amount);
    }

    function withdraw(
        address _token,
        uint256 _amount
    ) external isSupported(_token) {
        originalToReciept[_token].burn(msg.sender, _amount);
        bool success = IERC20(_token).transfer(msg.sender, _amount);
        require(success, "Transfer failed");
    }

    function test() internal view {
        _msgSender();
    }

    function _msgSender() internal view {
        console.log(msg.sender, "INTERNAL");
    }

    modifier isSupported(address _token) {
        require(_token != address(0), "Token not supported");
        _;
    }
}
