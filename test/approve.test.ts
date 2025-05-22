import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

describe("BJITCoin - Approve Functionality", function () {
  async function deployBJITCoinFixture() {
    const [owner, spender, otherAccount] = await hre.ethers.getSigners();
    const BJITCoin = await hre.ethers.getContractFactory("BJITCoin");
    const token = await BJITCoin.deploy(owner.address);
    await token.waitForDeployment();

    return { token, owner, spender, otherAccount };
  }

  describe("Approve Functionality", function () {
    it("Should approve a spender with a valid allowance", async function () {
      const { token, owner, spender } = await loadFixture(
        deployBJITCoinFixture
      );
      const approveAmount = hre.ethers.parseUnits("1000", 18);

      await expect(token.connect(owner).approve(spender.address, approveAmount))
        .to.emit(token, "Approval")
        .withArgs(owner.address, spender.address, approveAmount);

      const allowance = await token.allowance(owner.address, spender.address);
      expect(allowance).to.equal(approveAmount);
    });

    it("Should update allowance when called multiple times", async function () {
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

    it("Should set allowance to zero before updating to a new value", async function () {
      const { token, owner, spender } = await loadFixture(
        deployBJITCoinFixture
      );
      const approveAmount = hre.ethers.parseUnits("1000", 18);

      await token.connect(owner).approve(spender.address, approveAmount);
      await token.connect(owner).approve(spender.address, 0);

      const allowance = await token.allowance(owner.address, spender.address);
      expect(allowance).to.equal(0);
    });

    it("Should revert if spender is the zero address", async function () {
      const { token, owner } = await loadFixture(deployBJITCoinFixture);
      const approveAmount = hre.ethers.parseUnits("1000", 18);

      await expect(
        token.connect(owner).approve(hre.ethers.ZeroAddress, approveAmount)
      ).to.be.revertedWithCustomError(token, "ERC20InvalidSpender");
    });

    it("Should allow approving zero allowance", async function () {
      const { token, owner, spender } = await loadFixture(
        deployBJITCoinFixture
      );

      await expect(token.connect(owner).approve(spender.address, 0))
        .to.emit(token, "Approval")
        .withArgs(owner.address, spender.address, 0);

      const allowance = await token.allowance(owner.address, spender.address);
      expect(allowance).to.equal(0);
    });

    it("Should emit an Approval event with correct parameters", async function () {
      const { token, owner, spender } = await loadFixture(
        deployBJITCoinFixture
      );
      const approveAmount = hre.ethers.parseUnits("500", 18);

      await expect(token.connect(owner).approve(spender.address, approveAmount))
        .to.emit(token, "Approval")
        .withArgs(owner.address, spender.address, approveAmount);
    });

    it("Should not affect other spender allowances", async function () {
      const { token, owner, spender, otherAccount } = await loadFixture(
        deployBJITCoinFixture
      );
      const approveAmount = hre.ethers.parseUnits("1000", 18);

      await token.connect(owner).approve(spender.address, approveAmount);

      const otherAllowance = await token.allowance(
        owner.address,
        otherAccount.address
      );
      expect(otherAllowance).to.equal(0);
    });

    it("Should allow re-approving the same allowance value", async function () {
      const { token, owner, spender } = await loadFixture(
        deployBJITCoinFixture
      );
      const approveAmount = hre.ethers.parseUnits("1000", 18);

      await token.connect(owner).approve(spender.address, approveAmount);
      await token.connect(owner).approve(spender.address, approveAmount);

      const allowance = await token.allowance(owner.address, spender.address);
      expect(allowance).to.equal(approveAmount);
    });

    it("Should allow re-approving after reducing allowance to zero", async function () {
      const { token, owner, spender } = await loadFixture(
        deployBJITCoinFixture
      );
      const approveAmount = hre.ethers.parseUnits("1000", 18);

      await token.connect(owner).approve(spender.address, approveAmount);
      await token.connect(owner).approve(spender.address, 0); // Reset allowance to zero
      await token.connect(owner).approve(spender.address, approveAmount); // Re-approve

      const allowance = await token.allowance(owner.address, spender.address);
      expect(allowance).to.equal(approveAmount);
    });

    it("Should revert if transferFrom is called with an amount greater than the owner’s balance", async function () {
      const { token, owner, spender } = await loadFixture(
        deployBJITCoinFixture
      );
      const ownerBalance = await token.balanceOf(owner.address); // Get owner's balance
      const approveAmount = hre.ethers.parseUnits("1000", 18);

      // Approve spender for an amount greater than the owner's balance
      await token.connect(owner).approve(spender.address, approveAmount);

      // Attempt to transfer more than the owner's balance
      const excessAmount = ownerBalance + hre.ethers.parseUnits("1", 18);
      await expect(
        token
          .connect(spender)
          .transferFrom(owner.address, spender.address, excessAmount)
      )
        .to.be.revertedWithCustomError(token, "ERC20InsufficientAllowance")
        .withArgs(spender.address, approveAmount, excessAmount);
    });

    it("Should emit Approval event even if allowance is set to zero", async function () {
      const { token, owner, spender } = await loadFixture(
        deployBJITCoinFixture
      );

      await expect(token.connect(owner).approve(spender.address, 0))
        .to.emit(token, "Approval")
        .withArgs(owner.address, spender.address, 0);
    });

    it("Should allow multiple approvals for different spenders", async function () {
      const { token, owner, spender, otherAccount } = await loadFixture(
        deployBJITCoinFixture
      );
      const approveAmount1 = hre.ethers.parseUnits("500", 18);
      const approveAmount2 = hre.ethers.parseUnits("300", 18);

      await token.connect(owner).approve(spender.address, approveAmount1);
      await token.connect(owner).approve(otherAccount.address, approveAmount2);

      const allowance1 = await token.allowance(owner.address, spender.address);
      const allowance2 = await token.allowance(
        owner.address,
        otherAccount.address
      );

      expect(allowance1).to.equal(approveAmount1);
      expect(allowance2).to.equal(approveAmount2);
    });

    it("Should revert if approve is called with a null spender address", async function () {
      const { token, owner } = await loadFixture(deployBJITCoinFixture);
      const approveAmount = hre.ethers.parseUnits("1000", 18);

      await expect(
        token
          .connect(owner)
          .approve(ZERO_ADDRESS, approveAmount)
      )
        .to.be.revertedWithCustomError(token, "ERC20InvalidSpender")
        .withArgs(ZERO_ADDRESS);
    });
  });
});
