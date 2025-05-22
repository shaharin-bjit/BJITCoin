import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "ethers";
import hre from "hardhat"; // Explicitly import ethers

describe("BJITCoin - Transfer Token Function", function () {
  async function deployBJITCoinFixture() {
    const [owner, recipient, otherAccount] = await hre.ethers.getSigners();
    const BJITCoin = await hre.ethers.getContractFactory("BJITCoin");
    const token = await BJITCoin.deploy(owner.address);
    await token.waitForDeployment();

    return { token, owner, recipient, otherAccount };
  }

  describe("Transfer Token Functionality", function () {
    it("Should transfer tokens between accounts", async function () {
      const { token, owner, recipient } = await loadFixture(
        deployBJITCoinFixture
      );
      const transferAmount = hre.ethers.parseUnits("1000", 18);

      // Transfer tokens from owner to recipient
      await token.transfer(recipient.address, transferAmount);

      // Check balances
      expect(await token.balanceOf(owner.address)).to.equal(
        (await token.totalSupply()) - transferAmount
      );
      expect(await token.balanceOf(recipient.address)).to.equal(transferAmount);
    });

    it("Should fail if sender does not have enough tokens", async function () {
      const { token, owner, recipient } = await loadFixture(
        deployBJITCoinFixture
      );
      const transferAmount = hre.ethers.parseUnits("1000", 18);

      // Attempt to transfer without minting tokens
      await expect(
        token.connect(recipient).transfer(owner.address, transferAmount)
      )
        .to.be.revertedWithCustomError(token, "ERC20InsufficientBalance")
        .withArgs(recipient.address, 0, transferAmount);
    });

    it("Should fail if transferring to the zero address", async function () {
      const { token, owner } = await loadFixture(deployBJITCoinFixture);
      const transferAmount = hre.ethers.parseUnits("1000", 18);

      // Attempt to transfer to the zero address
      await expect(token.transfer(ethers.ZeroAddress, transferAmount)).to.be
        .reverted;
    });

    it("Should allow partial transfers", async function () {
      const { token, owner, recipient } = await loadFixture(
        deployBJITCoinFixture
      );
      const initialSupply = await token.balanceOf(owner.address); // Get the initial supply
      const transferAmount = hre.ethers.parseUnits("400", 18);

      // Transfer a portion of the tokens
      await token.transfer(recipient.address, transferAmount);

      // Check balances
      expect(await token.balanceOf(owner.address)).to.equal(
        initialSupply - transferAmount // Use BigInt subtraction
      );
      expect(await token.balanceOf(recipient.address)).to.equal(transferAmount);
    });

    it("Should emit a Transfer event", async function () {
      const { token, owner, recipient } = await loadFixture(
        deployBJITCoinFixture
      );
      const transferAmount = hre.ethers.parseUnits("1000", 18);

      // Transfer tokens from owner to recipient
      await expect(token.transfer(recipient.address, transferAmount))
        .to.emit(token, "Transfer")
        .withArgs(owner.address, recipient.address, transferAmount);
    });

    it("Should handle full balance transfer", async function () {
      const { token, owner, recipient } = await loadFixture(
        deployBJITCoinFixture
      );
      const initialSupply = await token.balanceOf(owner.address); // Get the initial supply

      // Transfer the full balance from owner to recipient
      await token.transfer(recipient.address, initialSupply);

      // Check balances
      expect(await token.balanceOf(owner.address)).to.equal(0);
      expect(await token.balanceOf(recipient.address)).to.equal(initialSupply);
    });

    it("Should work with small fractional values (e.g., 1 wei)", async function () {
      const { token, owner, recipient } = await loadFixture(
        deployBJITCoinFixture
      );
      const fractionalAmount = hre.ethers.parseUnits("1", 0); // 1 wei

      // Transfer 1 wei from owner to recipient
      await token.transfer(recipient.address, fractionalAmount);

      // Check balances
      expect(await token.balanceOf(owner.address)).to.equal(
        (await token.totalSupply()) - fractionalAmount
      );
      expect(await token.balanceOf(recipient.address)).to.equal(
        fractionalAmount
      );
    });

    it("Should not affect total supply", async function () {
      const { token, owner, recipient } = await loadFixture(
        deployBJITCoinFixture
      );
      const transferAmount = hre.ethers.parseUnits("1000", 18);

      // Get total supply before transfer
      const totalSupplyBefore = await token.totalSupply();

      // Transfer tokens from owner to recipient
      await token.transfer(recipient.address, transferAmount);

      // Get total supply after transfer
      const totalSupplyAfter = await token.totalSupply();

      // Check that total supply remains unchanged
      expect(totalSupplyBefore).to.equal(totalSupplyAfter);
    });

    it("Should allow transferring 0 tokens", async function () {
      const { token, owner, recipient } = await loadFixture(
        deployBJITCoinFixture
      );

      // Transfer 0 tokens from owner to recipient
      await token.transfer(recipient.address, 0);

      // Check balances remain unchanged
      const ownerBalance = await token.balanceOf(owner.address);
      const recipientBalance = await token.balanceOf(recipient.address);

      expect(ownerBalance).to.equal(await token.totalSupply());
      expect(recipientBalance).to.equal(0);
    });

    it("Should allow transferring tokens to self", async function () {
      const { token, owner } = await loadFixture(deployBJITCoinFixture);
      const initialSupply = await token.balanceOf(owner.address); // Get the initial supply

      // Transfer tokens to self
      await token.transfer(owner.address, initialSupply);

      // Check balances remain unchanged
      expect(await token.balanceOf(owner.address)).to.equal(initialSupply);
    });

    it("Should transfer from an account with exactly 1 token", async function () {
      const { token, owner, recipient } = await loadFixture(
        deployBJITCoinFixture
      );
      const initialSupply = await token.balanceOf(owner.address); // Get the initial supply
      const transferAmount = hre.ethers.parseUnits("1", 18); // 1 token

      // Transfer 1 token from owner to recipient
      await token.transfer(recipient.address, transferAmount);

      // Check balances
      expect(await token.balanceOf(owner.address)).to.equal(
        initialSupply - transferAmount
      );
      expect(await token.balanceOf(recipient.address)).to.equal(transferAmount);
    });

    it("Should handle multiple transfers in a single block", async function () {
      const { token, owner, recipient, otherAccount } = await loadFixture(
        deployBJITCoinFixture
      );
      const initialSupply = await token.balanceOf(owner.address); // Get the initial supply

      // Perform multiple transfers
      const transferToRecipient = hre.ethers.parseUnits("300", 18);
      const transferToOtherAccount = hre.ethers.parseUnits("200", 18);

      await token.transfer(recipient.address, transferToRecipient);
      await token.transfer(otherAccount.address, transferToOtherAccount);

      // Check balances
      expect(await token.balanceOf(owner.address)).to.equal(
        initialSupply - transferToRecipient - transferToOtherAccount
      );
      expect(await token.balanceOf(recipient.address)).to.equal(
        transferToRecipient
      );
      expect(await token.balanceOf(otherAccount.address)).to.equal(
        transferToOtherAccount
      );
    });

    it("Should handle transfer while receiving tokens in the same block", async function () {
      const { token, owner, recipient, otherAccount } = await loadFixture(
        deployBJITCoinFixture
      );
      const initialSupply = await token.balanceOf(owner.address); // Get the initial supply

      // Perform multiple transfers in the same block
      const transferToRecipient = hre.ethers.parseUnits("500", 18);
      const transferToOtherAccount = hre.ethers.parseUnits("300", 18);

      await Promise.all([
        token.transfer(recipient.address, transferToRecipient),
        token.transfer(otherAccount.address, transferToOtherAccount),
      ]);

      // Check balances
      expect(await token.balanceOf(owner.address)).to.equal(
        initialSupply - transferToRecipient - transferToOtherAccount
      );
      expect(await token.balanceOf(recipient.address)).to.equal(
        transferToRecipient
      );
      expect(await token.balanceOf(otherAccount.address)).to.equal(
        transferToOtherAccount
      );
    });

    it("Should check gas usage for transfer()", async function () {
      const { token, owner, recipient } = await loadFixture(
        deployBJITCoinFixture
      );
      const transferAmount = hre.ethers.parseUnits("500", 18);

      // Measure gas usage for transfer
      const tx = await token.transfer(recipient.address, transferAmount);
      const receipt = await tx.wait();
    });

    it("Should transfer from an address with balance 1 wei", async function () {
      const { token, owner, recipient } = await loadFixture(
        deployBJITCoinFixture
      );
      const fractionalAmount = hre.ethers.parseUnits("1", 0); // 1 wei

      // Transfer 1 wei from owner to recipient
      await token.transfer(recipient.address, fractionalAmount);

      // Check balances
      expect(await token.balanceOf(owner.address)).to.equal(
        (await token.totalSupply()) - fractionalAmount
      );
      expect(await token.balanceOf(recipient.address)).to.equal(
        fractionalAmount
      );
    });

    it("Should allow transfer back and forth (sender ↔ recipient)", async function () {
      const { token, owner, recipient } = await loadFixture(
        deployBJITCoinFixture
      );
      const transferAmount = hre.ethers.parseUnits("500", 18);

      // Transfer tokens to the recipient
      await token.transfer(recipient.address, transferAmount);

      // Transfer tokens back to the owner
      await token.connect(recipient).transfer(owner.address, transferAmount);

      // Check balances
      expect(await token.balanceOf(owner.address)).to.equal(
        await token.totalSupply()
      );
      expect(await token.balanceOf(recipient.address)).to.equal(0);
    });

    it("Should revert with custom error when transferring to the zero address", async function () {
      const { token, owner } = await loadFixture(deployBJITCoinFixture);
      const transferAmount = hre.ethers.parseUnits("1000", 18);

      await expect(
        token.transfer(ethers.ZeroAddress, transferAmount)
      ).to.be.revertedWithCustomError(token, "ERC20InvalidReceiver");
    });
  });
});
