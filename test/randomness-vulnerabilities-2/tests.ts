import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { expect } from "chai";
import { Game2, Game2__factory, Exploit2, Exploit2__factory } from "../../typechain-types";

describe("Randomness Vulnerabilities Exercise 2", function () {
    let deployer: SignerWithAddress, attacker: SignerWithAddress;

    const INITIAL_POT = parseEther("20");
    const GAME_FEE = parseEther("1");

    let game: Game2;
    let exploit: Exploit2;

    let attackerInitialBalance: BigNumber;

    before(async function () {
        /** SETUP EXERCISE - DON'T CHANGE ANYTHING HERE */

        [deployer, attacker] = await ethers.getSigners();
        attackerInitialBalance = await ethers.provider.getBalance(
            attacker.address
        );

        // Deploy wallet and deposit ETH
        const gameFactory = (await ethers.getContractFactory(
            "contracts/randomness-vulnerabilities-2/Game2.sol:Game2",
            deployer
        )) as Game2__factory;
        game = await gameFactory.deploy({ value: INITIAL_POT });

        const exploit2Factory = (await ethers.getContractFactory(
            "Exploit2",
            attacker
        )) as Exploit2__factory;
        exploit = await exploit2Factory.deploy(game.address);

        let inGame = await ethers.provider.getBalance(game.address);
        expect(inGame).to.equal(INITIAL_POT);
    });

    it("Exploit", async function () {
        await exploit.connect(attacker).attack({ value: GAME_FEE });
        await exploit.connect(attacker).attack({ value: GAME_FEE });
        await exploit.connect(attacker).attack({ value: GAME_FEE });
        await exploit.connect(attacker).attack({ value: GAME_FEE });
        await exploit.connect(attacker).attack({ value: GAME_FEE });
        await exploit.connect(attacker).withdraw();
    });

    after(async function () {
        /** SUCCESS CONDITIONS */

        // Game funds were stolen
        expect(await ethers.provider.getBalance(game.address)).to.equal(0);

        // Attacker supposed to own the stolen ETH (-0.2 ETH for gas...)
        expect(await ethers.provider.getBalance(attacker.address)).to.be.gt(
            attackerInitialBalance.add(INITIAL_POT).sub(parseEther("0.2"))
        );
    });
});
