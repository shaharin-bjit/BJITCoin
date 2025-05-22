import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

describe("BJITCoin - Allowance Functionality", function () {
  async function deployBJITCoinFixture() {
    const [owner, spender, otherAccount] = await hre.ethers.getSigners();
    const BJITCoin = await hre.ethers.getContractFactory("BJITCoin");
    const token = await BJITCoin.deploy(owner.address);
    await token.waitForDeployment();

    return { token, owner, spender, otherAccount };
  }

  describe("Allowance Functionality", function () {
    it("Should return zero allowance by default", async function () {
      const { token, owner, spender } = await loadFixture(
        deployBJITCoinFixture
      );
      const allowance = await token.allowance(owner.address, spender.address);
      expect(allowance).to.equal(0);
    });

    it("Should update allowance after approval", async function () {
      const { token, owner, spender } = await loadFixture(
        deployBJITCoinFixture
      );
      const approveAmount = hre.ethers.parseUnits("1000", 18);
      await token.connect(owner).approve(spender.address, approveAmount);

      const allowance = await token.allowance(owner.address, spender.address);
      expect(allowance).to.equal(approveAmount);
    });

    it("Should decrease allowance after transferFrom", async function () {
      const { token, owner, spender, otherAccount } = await loadFixture(
        deployBJITCoinFixture
      );
      const approveAmount = hre.ethers.parseUnits("1000", 18);
      const transferAmount = hre.ethers.parseUnits("500", 18);

      await token.connect(owner).approve(spender.address, approveAmount);
      await token
        .connect(spender)
        .transferFrom(owner.address, otherAccount.address, transferAmount);

      const remainingAllowance = await token.allowance(
        owner.address,
        spender.address
      );
      expect(remainingAllowance).to.equal(approveAmount - transferAmount);
    });

    it("Should revert if transferFrom exceeds allowance", async function () {
      const { token, owner, spender, otherAccount } = await loadFixture(
        deployBJITCoinFixture
      );
      const approveAmount = hre.ethers.parseUnits("1000", 18);
      const transferAmount = hre.ethers.parseUnits("1500", 18);

      await token.connect(owner).approve(spender.address, approveAmount);

      await expect(
        token
          .connect(spender)
          .transferFrom(owner.address, otherAccount.address, transferAmount)
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientAllowance");
    });

    it("Should allow infinite allowance", async function () {
      const { token, owner, spender, otherAccount } = await loadFixture(
        deployBJITCoinFixture
      );
      const infiniteAllowance = hre.ethers.MaxUint256;
      const transferAmount = hre.ethers.parseUnits("1000", 18);

      await token.connect(owner).approve(spender.address, infiniteAllowance);
      await token
        .connect(spender)
        .transferFrom(owner.address, otherAccount.address, transferAmount);

      const remainingAllowance = await token.allowance(
        owner.address,
        spender.address
      );
      expect(remainingAllowance).to.equal(infiniteAllowance);
    });

    it("Should allow setting allowance to zero", async function () {
      const { token, owner, spender } = await loadFixture(
        deployBJITCoinFixture
      );
      const approveAmount = hre.ethers.parseUnits("1000", 18);

      await token.connect(owner).approve(spender.address, approveAmount);
      await token.connect(owner).approve(spender.address, 0);

      const allowance = await token.allowance(owner.address, spender.address);
      expect(allowance).to.equal(0);
    });

    it("Should handle multiple approvals correctly", async function () {
      const { token, owner, spender } = await loadFixture(
        deployBJITCoinFixture
      );
      const firstApproveAmount = hre.ethers.parseUnits("500", 18);
      const secondApproveAmount = hre.ethers.parseUnits("300", 18);

      await token.connect(owner).approve(spender.address, firstApproveAmount);
      await token.connect(owner).approve(spender.address, secondApproveAmount);

      const allowance = await token.allowance(owner.address, spender.address);
      expect(allowance).to.equal(secondApproveAmount);
    });

    it("Should revert if spender is the zero address", async function () {
      const { token, owner } = await loadFixture(deployBJITCoinFixture);
      const approveAmount = hre.ethers.parseUnits("1000", 18);

      await expect(
        token
          .connect(owner)
          .approve(ZERO_ADDRESS, approveAmount)
      ).to.be.revertedWithCustomError(token, "ERC20InvalidSpender");
    });

    it("Should revert if owner tries to transfer more than allowance", async function () {
      const { token, owner, spender, otherAccount } = await loadFixture(
        deployBJITCoinFixture
      );
      const approveAmount = hre.ethers.parseUnits("1000", 18);
      const transferAmount = hre.ethers.parseUnits("1500", 18);

      await token.connect(owner).approve(spender.address, approveAmount);

      await expect(
        token
          .connect(spender)
          .transferFrom(owner.address, otherAccount.address, transferAmount)
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientAllowance");
    });

    it("Should allow infinite allowance and not decrease it after transferFrom", async function () {
      const { token, owner, spender, otherAccount } = await loadFixture(
        deployBJITCoinFixture
      );
      const infiniteAllowance = hre.ethers.MaxUint256;
      const transferAmount = hre.ethers.parseUnits("1000", 18);

      await token.connect(owner).approve(spender.address, infiniteAllowance);
      await token
        .connect(spender)
        .transferFrom(owner.address, otherAccount.address, transferAmount);

      const remainingAllowance = await token.allowance(
        owner.address,
        spender.address
      );
      expect(remainingAllowance).to.equal(infiniteAllowance);
    });

    it("Should emit Approval event on approve", async function () {
      const { token, owner, spender } = await loadFixture(
        deployBJITCoinFixture
      );
      const approveAmount = hre.ethers.parseUnits("1000", 18);

      await expect(token.connect(owner).approve(spender.address, approveAmount))
        .to.emit(token, "Approval")
        .withArgs(owner.address, spender.address, approveAmount);
    });

    it("Should not allow transferFrom if owner has insufficient balance", async function () {
      const { token, owner, spender, otherAccount } = await loadFixture(
        deployBJITCoinFixture
      );
      const approveAmount = hre.ethers.parseUnits("1000", 18);
      const transferAmount = hre.ethers.parseUnits("2000", 18);

      await token.connect(owner).approve(spender.address, approveAmount);

      await expect(
        token
          .connect(spender)
          .transferFrom(owner.address, otherAccount.address, transferAmount)
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientAllowance");
    });

    it("Should allow spender to transfer multiple times within allowance", async function () {
      const { token, owner, spender, otherAccount } = await loadFixture(
        deployBJITCoinFixture
      );
      const approveAmount = hre.ethers.parseUnits("1000", 18);
      const firstTransferAmount = hre.ethers.parseUnits("400", 18);
      const secondTransferAmount = hre.ethers.parseUnits("300", 18);

      await token.connect(owner).approve(spender.address, approveAmount);

      await token
        .connect(spender)
        .transferFrom(owner.address, otherAccount.address, firstTransferAmount);
      await token
        .connect(spender)
        .transferFrom(
          owner.address,
          otherAccount.address,
          secondTransferAmount
        );

      const remainingAllowance = await token.allowance(
        owner.address,
        spender.address
      );
      expect(remainingAllowance).to.equal(
        approveAmount - firstTransferAmount - secondTransferAmount
      );
    });
  });
});
