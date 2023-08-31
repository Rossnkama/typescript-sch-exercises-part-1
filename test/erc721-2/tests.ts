import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { assert, expect } from "chai";
import { DummyERC721, DummyERC721__factory, OpenOcean, OpenOcean__factory } from "../../typechain-types";

describe("ERC721 Tokens Exercise 2", function () {
    let deployer: SignerWithAddress,
        user1: SignerWithAddress,
        user2: SignerWithAddress,
        user3: SignerWithAddress;

    let OpenOceanFactory: OpenOcean__factory;

    const CUTE_NFT_PRICE = parseEther("5");
    const BOOBLES_NFT_PRICE = parseEther("7");

    let cuteNFT: DummyERC721;
    let booblesNFT: DummyERC721;
    let openOcean: OpenOcean;

    let user1InitialBalance: BigNumber;
    let user2InitialBalance: BigNumber;
    let user3InitialBalance: BigNumber;

    before(async function () {
        /** Deployment and minting tests */

        [deployer, user1, user2, user3] = await ethers.getSigners();

        // User1 creates his own NFT collection
        let NFTFactory = (await ethers.getContractFactory(
            "contracts/utils/DummyERC721.sol:DummyERC721",
            user1
        )) as DummyERC721__factory;
        cuteNFT = await NFTFactory.deploy("Crypto Cuties", "CUTE", 1000);

        await cuteNFT.mintBulk(30);
        expect(await cuteNFT.balanceOf(user1.address)).to.be.equal(30);

        OpenOceanFactory = (await ethers.getContractFactory(
            "OpenOcean", deployer
        )) as OpenOcean__factory;

        // User3 creates his own NFT collection
        NFTFactory = await ethers.getContractFactory("DummyERC721", user3);
        booblesNFT = await NFTFactory.deploy("Rare Boobles", "BOO", 10000);
        await booblesNFT.mintBulk(120);
        expect(await booblesNFT.balanceOf(user3.address)).to.be.equal(120);
    });

    it("Deployment & Listing Tests", async function () {
        /** CODE YOUR SOLUTION HERE */
        // Deploy Marketplace from deployer
        openOcean = await OpenOceanFactory.deploy();
        // User1 lists Cute NFT tokens 1-10 for 5 ETH each
        await cuteNFT.connect(user1).setApprovalForAll(openOcean.address, true);

        // Make parameterized
        for (let index = 1; index <= 10; index++) {
            await openOcean.connect(user1).listItem(cuteNFT.address, index, CUTE_NFT_PRICE);
            expect(await cuteNFT.ownerOf(index)).to.be.eq(openOcean.address, "OpenOcean contract does not own cute NFT");
        }
        // Check that Marketplace owns 10 Cute NFTs
        expect(await cuteNFT.balanceOf(openOcean.address)).to.be.eq(10)
        // Checks that the marketplace mapping is correct (All data is correct), check the 10th item.
        let tenthItem = ((await openOcean.listedItems(10)));
        expect(tenthItem.seller).to.be.eq(user1.address)
        expect(tenthItem.tokenId).to.be.eq(10)

        // User3 lists Boobles NFT tokens 1-5 for 7 ETH each
        await booblesNFT.connect(user3).setApprovalForAll(openOcean.address, true);
        for (let index = 1; index <= 5; index++) {
            await openOcean.connect(user3).listItem(booblesNFT.address, index, BOOBLES_NFT_PRICE);
            expect(await booblesNFT.ownerOf(index)).to.be.eq(openOcean.address, "OpenOcean contract does not own boobles NFT");
        }

        // Check that Marketplace owns 5 Booble NFTs
        expect(await booblesNFT.balanceOf(openOcean.address)).to.be.eq(5)
        // Checks that the marketplace mapping is correct (All data is correct), check the 15th item.
        let fifteenthItem = ((await openOcean.listedItems(15)));
        expect(fifteenthItem.seller).to.be.eq(user3.address)
        expect(fifteenthItem.tokenId).to.be.eq(5)

        // After gas fees for TXs
        user1InitialBalance = await ethers.provider.getBalance(user1.address);
        user2InitialBalance = await ethers.provider.getBalance(user2.address);
        user3InitialBalance = await ethers.provider.getBalance(user3.address);
    });

    it("Purchases Tests", async function () {
        /** CODE YOUR SOLUTION HERE */
        // All Purchases From User2 //
        // TODO: Try to purchase itemId 100, should revert
        await expect(openOcean.connect(user2).purchase(100, { value: parseEther("0") })).to.be.revertedWith("Item out of range");
        // TODO: Try to purchase itemId 3, without ETH, should revert
        await expect(openOcean.connect(user2).purchase(3, { value: parseEther("0") })).to.be.revertedWith("Too little/much ETH paid");
        // TODO: Try to purchase itemId 3, with ETH, should work
        await openOcean.connect(user2).purchase(3, { value: parseEther("5") })
        // TODO: Can't purchase sold item
        // TODO: User2 owns itemId 3 -> Cuties tokenId 3
        expect(await cuteNFT.ownerOf(3)).to.be.eq(user2.address);
        // TODO: User1 got the right amount of ETH for the sale
        expect(await user1.getBalance()).to.be.eq(user1InitialBalance.add(parseEther("5")))
        // TODO: Purchase itemId 11
        // TODO: User2 owns itemId 11 -> Boobles tokenId 1
        // TODO: User3 got the right amount of ETH for the sale
    });
});
