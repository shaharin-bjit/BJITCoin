import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("BJITCoin - Token Specification", function () {
  async function deployBJITCoinFixture() {
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const BJITCoin = await hre.ethers.getContractFactory("BJITCoin");
    const token = await BJITCoin.deploy(owner.address);
    await token.waitForDeployment();

    return { token, owner, otherAccount };
  }

  describe("Token Specification", function () {
    it("Should check deployment fails if zero address is provided", async function () {
      const [owner] = await hre.ethers.getSigners();
      const BJITCoin = await hre.ethers.getContractFactory("BJITCoin");
      await expect(BJITCoin.deploy(ZERO_ADDRESS)).to.be.reverted;
    });

    it("Should return the correct name", async function () {
      const { token } = await loadFixture(deployBJITCoinFixture);
      expect(await token.name()).to.equal("BJITCoin");
    });

    it("Should return the correct symbol", async function () {
      const { token } = await loadFixture(deployBJITCoinFixture);
      expect(await token.symbol()).to.equal("BJIT");
    });

    it("Should return the correct decimals", async function () {
      const { token } = await loadFixture(deployBJITCoinFixture);
      expect(await token.decimals()).to.equal(18);
    });

    it("Should return the correct total supply", async function () {
      const { token, owner } = await loadFixture(deployBJITCoinFixture);
      const expectedSupply = hre.ethers.parseUnits("50000000000", 18);
      expect(await token.totalSupply()).to.equal(expectedSupply);
      expect(await token.balanceOf(owner.address)).to.equal(expectedSupply);
    });

    it("Should return the correct balance of an account", async function () {
      const { token, owner, otherAccount } = await loadFixture(
        deployBJITCoinFixture
      );
      const ownerBalance = await token.balanceOf(owner.address);
      const otherAccountBalance = await token.balanceOf(otherAccount.address);

      expect(ownerBalance).to.equal(hre.ethers.parseUnits("50000000000", 18));
      expect(otherAccountBalance).to.equal(0);
    });

    it("Should return zero for non-existent address balance", async function () {
      const { token } = await loadFixture(deployBJITCoinFixture);
      const nonExistentAddress = "0x000000000000000000000000000000000000dead";
      expect(await token.balanceOf(nonExistentAddress)).to.equal(0);
    });
  });
});
