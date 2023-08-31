import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import chai, { assert, expect, config } from "chai";
import { MyToken, MyToken__factory } from "../../typechain-types";

describe("ERC20 Tokens Exercise 1", function () {
    let deployer: SignerWithAddress,
        user1: SignerWithAddress,
        user2: SignerWithAddress,
        user3: SignerWithAddress;

    // Constants
    const DEPLOYER_MINT = parseEther("100000");
    const USERS_MINT = parseEther("5000");
    const FIRST_TRANSFER = parseEther("100");
    const SECOND_TRANSFER_APPROVAL = parseEther("1000");
    const TOTAL_SUPPLY = parseEther("115000");

    // Declare variables here so they can be used in all functions
    let myTokenContract: MyToken;

    beforeEach(async function () {
        [deployer, user1, user2, user3] = await ethers.getSigners();

        const myTokenFactory = await ethers.getContractFactory("MyToken", deployer) as MyToken__factory;

        myTokenContract = await myTokenFactory.deploy();

        await myTokenContract.mint(deployer.address, DEPLOYER_MINT);
        await myTokenContract.mint(user1.address, parseEther("5000"));
        await myTokenContract.mint(user2.address, parseEther("5000"));
        await myTokenContract.mint(user3.address, parseEther("5000"));
    });

    it("Correct total supply is minted", async function () {
        let actualTotalSupply = await myTokenContract.totalSupply();
        let expectedTotalSupply = TOTAL_SUPPLY;

        assert(actualTotalSupply.eq(expectedTotalSupply), "Total supply is not minted as expected");
    });

    it("Intial balances are congruent with minting", async function () {
        let actualDeployerBalance = await myTokenContract.balanceOf(deployer.address)
        let actualUser1Balance = await myTokenContract.balanceOf(user1.address);
        let actualUser2Balance = await myTokenContract.balanceOf(user2.address);
        let actualUser3Balance = await myTokenContract.balanceOf(user3.address);

        assert(actualDeployerBalance.eq(DEPLOYER_MINT), "Deployer balance is not as expected");
        assert(actualUser1Balance.eq(USERS_MINT), "User1 balance is not as expected");
        assert(actualUser2Balance.eq(USERS_MINT), "User2 balance is not as expected");
        assert(actualUser3Balance.eq(USERS_MINT), "User3 balance is not as expected");
    });

    it("Transfer function correctly update balances", async function () {
        await myTokenContract.connect(user2).transfer(user3.address, FIRST_TRANSFER);

        let actualUser2Balance = await myTokenContract.balanceOf(user2.address);
        let actualUser3Balance = await myTokenContract.balanceOf(user3.address);

        assert(actualUser2Balance.eq(USERS_MINT.sub(FIRST_TRANSFER)), "User2 didn't transfer expected transfer");
        assert(actualUser3Balance.eq(USERS_MINT.add(FIRST_TRANSFER)), "User3 didn't recieve expected transfer");
    });

    it("Account allowance is correcly set", async function () {
        await myTokenContract.connect(user3).approve(user1.address, SECOND_TRANSFER_APPROVAL);

        let actualUser1Allowance = await myTokenContract.allowance(user3.address, user1.address);

        assert(actualUser1Allowance.eq(SECOND_TRANSFER_APPROVAL), "User1 is not approved as expected");
    });

    it("Recipient can spend approved allowance", async function () {
        await myTokenContract.connect(user3).approve(user1.address, SECOND_TRANSFER_APPROVAL);
        await myTokenContract.connect(user1).transferFrom(user3.address, user1.address, SECOND_TRANSFER_APPROVAL);

        let actualUser1Balance = await myTokenContract.balanceOf(user1.address);
        let actualUser3Balance = await myTokenContract.balanceOf(user3.address);

        assert(actualUser1Balance.eq(USERS_MINT.add(SECOND_TRANSFER_APPROVAL)), "Account 1 did not recieve the expected funds after transfer");
        assert(actualUser3Balance.eq(USERS_MINT.sub(SECOND_TRANSFER_APPROVAL)), "Account 3 did not transfer the expected funds after transfer");
    });
});
