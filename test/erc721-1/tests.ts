import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { expect } from "chai";
import { MyNft, MyNft__factory } from '../../typechain-types';

describe("ERC721 Tokens Exercise 1", function () {
    let deployer: SignerWithAddress,
        user1: SignerWithAddress,
        user2: SignerWithAddress;

    // Constants
    const DEPLOYER_MINT = 5;
    const USER1_MINT = 3;
    const MINT_PRICE = parseEther("0.1");

    // Declare variables here so they can be used in all functions
    
    let myNftTokenContract: MyNft;
    let initialBalance: BigNumber;

    before(async function () {
        /** Deployment and minting tests */

        [deployer, user1, user2] = await ethers.getSigners();

        /** CODE YOUR SOLUTION HERE */
        // TODO: Contract deployment
        // Remember to import Typechain types for type-safe contract interactions
        //
        const MyNftTokenContractFactory = (await ethers.getContractFactory(
            "MyNft",
            deployer
        )) as MyNft__factory;

        myNftTokenContract = await MyNftTokenContractFactory.deploy();
    });

    it("Minting Tests", async function () {
        /** CODE YOUR SOLUTION HERE */
        await myNftTokenContract.batchSafeMint(deployer.address, 5, { value: parseEther("0.5") });
        let deployerBalance = await myNftTokenContract.balanceOf(deployer.address);

        let ownerOfOne = await myNftTokenContract.ownerOf(1);
        let ownerOfTwo = await myNftTokenContract.ownerOf(2);
        let ownerOfThree = await myNftTokenContract.ownerOf(3);
        let ownerOfFour = await myNftTokenContract.ownerOf(4);
        let ownerOfFive = await myNftTokenContract.ownerOf(5);
        
        // Deployer should own token ids 1-5
        expect(deployerBalance).to.be.eq(5, `Deployer mint (${deployerBalance}) is not equal to expected 5`);
        expect(ownerOfOne).to.be.eq(deployer.address, `Owner of token 1 is not deployer but is (${ownerOfOne}).`);
        expect(ownerOfTwo).to.be.eq(deployer.address, `Owner of token 2 is not deployer but is (${ownerOfTwo}).`);
        expect(ownerOfThree).to.be.eq(deployer.address, `Owner of token 3 is not deployer but is (${ownerOfThree}).`);
        expect(ownerOfFour).to.be.eq(deployer.address, `Owner of token 4 is not deployer but is (${ownerOfFour}).`);
        expect(ownerOfFive).to.be.eq(deployer.address, `Owner of token 5 is not deployer but is (${ownerOfFive}).`);

        // TODO: User 1 mints
        // User1 should own token ids 6-8
        await myNftTokenContract.batchSafeMint(user1.address, 3, { value: parseEther("0.3") });
        let userOneBalance = await myNftTokenContract.balanceOf(user1.address);
        let ownerOfSix = await myNftTokenContract.ownerOf(6);
        let ownerOfSeven = await myNftTokenContract.ownerOf(7);
        let ownerOfEight = await myNftTokenContract.ownerOf(8);
        // TODO: Check Minting
        expect(userOneBalance).to.be.eq(3, `Deployer mint (${userOneBalance}) is not equal to expected 5`);
        expect(ownerOfSix).to.be.eq(user1.address, `Owner of token 6 is not user1 but is (${ownerOfSix}).`);
        expect(ownerOfSeven).to.be.eq(user1.address, `Owner of token 7 is not user1 but is (${ownerOfSeven}).`);
        expect(ownerOfEight).to.be.eq(user1.address, `Owner of token 8 is not user1 but is (${ownerOfEight}).`);
    });

    it("Transfers Tests", async function () {
        /** CODE YOUR SOLUTION HERE */
        // TODO: Transferring tokenId 6 from user1 to user2
        await myNftTokenContract.connect(user1).transferFrom(user1.address, user2.address, 6);
        // TODO: Checking that user2 owns tokenId 6
        expect(await myNftTokenContract.ownerOf(6)).to.be.eq(user2.address);
        // TODO: Deployer approves User1 to spend tokenId 3
        await myNftTokenContract.connect(deployer).approve(user1.address, 3);
        // TODO: Test that User1 has approval to spend TokenId3
        let token3approvedAddress = await myNftTokenContract.getApproved(3);
        // TODO: Use approval and transfer tokenId 3 from deployer to User1
        expect(token3approvedAddress).to.be.eq(user1.address)
        await myNftTokenContract.connect(user1).transferFrom(deployer.address, user1.address, 3);
        // TODO: Checking that user1 owns tokenId 3
        let ownerOfThree = await myNftTokenContract.ownerOf(3);
        expect(ownerOfThree).to.be.eq(user1.address)
        // TODO: Checking balances after transfer
        // Deployer: 5 minted, 1 sent, 0 received
        let deployerBalance = await myNftTokenContract.balanceOf(deployer.address);
        expect(deployerBalance).to.be.eq(4, `Deployer mint (${deployerBalance}) is not equal to expected 4`);
        // User1: 3 minted, 1 sent, 1 received
        let user1Balance = await myNftTokenContract.balanceOf(user1.address);
        expect(user1Balance).to.be.eq(3, `Deployer mint (${user1Balance}) is not equal to expected 3`);
        // User2: 0 minted, 0 sent, 1 received
        let user2Balance = await myNftTokenContract.balanceOf(user2.address);
        expect(user2Balance).to.be.eq(1, `Deployer mint (${user2Balance}) is not equal to expected 1`);
    });
});
