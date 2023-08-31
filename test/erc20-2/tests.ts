import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { assert, expect } from "chai";
import { IERC20, IRTOKEN, TokensDepository, TokensDepository__factory } from "../../typechain-types";
import { deployContract } from "@nomiclabs/hardhat-ethers/types";
import { ERC20 } from "../../typechain-types/contracts/access-control-4/Starlight.sol";

describe("ERC20 Tokens Exercise 2", function () {
    let deployer: SignerWithAddress,
        aaveHolder: SignerWithAddress,
        uniHolder: SignerWithAddress,
        wethHolder: SignerWithAddress;

    const AAVE_ADDRESS = "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9";
    const UNI_ADDRESS = "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984";
    const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

    const AAVE_HOLDER = "0x2efb50e952580f4ff32d8d2122853432bbf2e204";
    const UNI_HOLDER = "0x193ced5710223558cd37100165fae3fa4dfcdc14";
    const WETH_HOLDER = "0x741aa7cfb2c7bf2a1e7d4da2e3df6a56ca4131f3";

    const ZERO_ETH = parseEther("0");
    const ONE_ETH = parseEther("1");
    const ONE_HUNDRED_ETH = parseEther("100");
    const TEN_THOUSAND_ETH = parseEther("10000");

    let aave: IERC20;
    let uni: IERC20;
    let weth: IERC20;

    let initialAAVEBalance: BigNumber;
    let initialUNIBalance: BigNumber;
    let initialWETHBalance: BigNumber;

    let depositContractFactory: TokensDepository__factory;
    let depositoryContract: TokensDepository;

    before(async function () {
        /** SETUP EXERCISE - DON'T CHANGE ANYTHING HERE */

        [deployer] = await ethers.getSigners();

        depositContractFactory = await ethers.getContractFactory("TokensDepository", deployer) as TokensDepository__factory;

        // Load tokens mainnet contracts
        aave = (await ethers.getContractAt(
            "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
            AAVE_ADDRESS
        )) as IERC20;
        uni = (await ethers.getContractAt(
            "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
            UNI_ADDRESS
        )) as IERC20;
        weth = (await ethers.getContractAt(
            "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
            WETH_ADDRESS
        )) as IERC20;

        // Load holders (accounts which hold tokens on Mainnet)
        aaveHolder = await ethers.getImpersonatedSigner(AAVE_HOLDER);
        uniHolder = await ethers.getImpersonatedSigner(UNI_HOLDER);
        wethHolder = await ethers.getImpersonatedSigner(WETH_HOLDER);

        // Send some ETH to tokens holders
        await deployer.sendTransaction({
            to: aaveHolder.address,
            value: ONE_ETH,
        });
        await deployer.sendTransaction({
            to: uniHolder.address,
            value: ONE_ETH,
        });
        await deployer.sendTransaction({
            to: wethHolder.address,
            value: ONE_ETH,
        });

        initialAAVEBalance = await aave.balanceOf(aaveHolder.address);
        initialUNIBalance = await uni.balanceOf(uniHolder.address);
        initialWETHBalance = await weth.balanceOf(wethHolder.address);

        console.log(
            "AAVE Holder AAVE Balance: ",
            ethers.utils.formatUnits(initialAAVEBalance),
            uniHolder.address
        );
        console.log(
            "UNI Holder UNI Balance: ",
            ethers.utils.formatUnits(initialUNIBalance)
        );
        console.log(
            "WETH Holder WETH Balance: ",
            ethers.utils.formatUnits(initialWETHBalance)
        );
    });

    it("Deploy depository and load receipt tokens", async function () {
        /** CODE YOUR SOLUTION HERE */
        
        // TODO: Deploy your depository contract with the supported assets
        depositoryContract = await depositContractFactory.deploy();
        
        // TODO: Load receipt tokens into objects under `this` (e.g rAve)
        this.rAAVE = await depositoryContract.rAAVE();
        this.rUNI = await depositoryContract.rUNI();
        this.rWETH = await depositoryContract.rWETH();
    });

    it("Deposit tokens tests", async function () {
        /** CODE YOUR SOLUTION HERE */
        // TODO: Deposit Tokens
        await aave.connect(aaveHolder).approve(depositoryContract.address, TEN_THOUSAND_ETH)
        await uni.connect(uniHolder).approve(depositoryContract.address, TEN_THOUSAND_ETH)
        await weth.connect(wethHolder).approve(depositoryContract.address, ONE_HUNDRED_ETH)
        
        await depositoryContract.connect(aaveHolder).deposit(AAVE_ADDRESS, TEN_THOUSAND_ETH)
        await depositoryContract.connect(uniHolder).deposit(UNI_ADDRESS, TEN_THOUSAND_ETH)
        await depositoryContract.connect(wethHolder).deposit(WETH_ADDRESS, ONE_HUNDRED_ETH)

        // TODO: Check that the tokens were sucessfuly transfered to the depository
        let depositoryContractAaveBalance = await aave.balanceOf(depositoryContract.address)
        let depositoryContractUniBalance = await uni.balanceOf(depositoryContract.address)
        let depositoryContractWethBalance = await weth.balanceOf(depositoryContract.address)
        
        assert(depositoryContractAaveBalance.eq(TEN_THOUSAND_ETH))
        assert(depositoryContractUniBalance.eq(TEN_THOUSAND_ETH))
        assert(depositoryContractWethBalance.eq(ONE_HUNDRED_ETH))

        // TODO: Check that the right amount of receipt tokens were minted
        let rAAVE = (await ethers.getContractAt(
            "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
            this.rAAVE
        )) as IERC20;
        let rUNI = (await ethers.getContractAt(
            "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
            this.rUNI
        )) as IERC20;
        let rWETH = (await ethers.getContractAt(
            "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
            this.rWETH
        )) as IERC20;

        let aaveHolderRecipetTokensBalance = await rAAVE.balanceOf(aaveHolder.address)
        let uniHolderRecipetTokensBalance = await rUNI.balanceOf(uniHolder.address)
        let wethHolderRecipetTokensBalance = await rWETH.balanceOf(wethHolder.address)

        assert(aaveHolderRecipetTokensBalance.eq(TEN_THOUSAND_ETH))
        assert(uniHolderRecipetTokensBalance.eq(TEN_THOUSAND_ETH))
        assert(wethHolderRecipetTokensBalance.eq(ONE_HUNDRED_ETH))
    });

    it("Withdraw tokens tests", async function () {
        /** CODE YOUR SOLUTION HERE */
        // TODO: Withdraw ALL the Tokens
        let rAAVE = (await ethers.getContractAt(
            "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
            this.rAAVE
        )) as IERC20;
        let rUNI = (await ethers.getContractAt(
            "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
            this.rUNI
        )) as IERC20;
        let rWETH = (await ethers.getContractAt(
            "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
            this.rWETH
        )) as IERC20;

        await depositoryContract.connect(aaveHolder).withdraw(AAVE_ADDRESS, TEN_THOUSAND_ETH)
        await depositoryContract.connect(uniHolder).withdraw(UNI_ADDRESS, TEN_THOUSAND_ETH)
        await depositoryContract.connect(wethHolder).withdraw(WETH_ADDRESS, ONE_HUNDRED_ETH)

        // TODO: Check that the right amount of tokens were withdrawn (depositors got back the assets)
        let depositoryContractAaveBalance = await aave.balanceOf(depositoryContract.address)
        let depositoryContractUniBalance = await uni.balanceOf(depositoryContract.address)
        let depositoryContractWethBalance = await weth.balanceOf(depositoryContract.address)
        
        assert(depositoryContractAaveBalance.eq(ZERO_ETH))
        assert(depositoryContractUniBalance.eq(ZERO_ETH))
        assert(depositoryContractWethBalance.eq(ZERO_ETH))

        // TODO: Check that the right amount of receipt tokens were burned
        let totalSupplyAave = await rAAVE.totalSupply();
        let totalSupplyUni = await rUNI.totalSupply();
        let totalSupplyWeth = await rWETH.totalSupply();

        assert(totalSupplyAave.eq(ZERO_ETH))
        assert(totalSupplyUni.eq(ZERO_ETH))
        assert(totalSupplyWeth.eq(ZERO_ETH))
    });
});
