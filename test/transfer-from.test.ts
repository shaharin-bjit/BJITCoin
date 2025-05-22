import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

describe('BJITCoin - Transfer From Token Functionality', function () {
  async function deployBJITCoinFixture() {
    const [owner, spender, recipient, otherAccount] =
      await hre.ethers.getSigners();
    const BJITCoin = await hre.ethers.getContractFactory('BJITCoin');
    const token = await BJITCoin.deploy(owner.address);
    await token.waitForDeployment();

    return { token, owner, spender, recipient, otherAccount };
  }

  describe('Transfer From Token Functionality', function () {
    it('Should allow transferFrom when allowance and balance are sufficient', async function () {
      const { token, owner, spender, recipient } = await loadFixture(
        deployBJITCoinFixture
      );

      // Approve spender
      const approveAmount = 500;
      await token.connect(owner).approve(spender.address, approveAmount);

      // Transfer tokens
      const transferAmount = 500;
      await expect(
        token
          .connect(spender)
          .transferFrom(owner.address, recipient.address, transferAmount)
      )
        .to.emit(token, 'Transfer')
        .withArgs(owner.address, recipient.address, transferAmount);

      // Check balances
      const ownerBalance = await token.balanceOf(owner.address);
      const initialOwnerBalance = hre.ethers.parseEther('50000000000');
      const transferAmountInUnits = hre.ethers.parseUnits('500', 0);
      const expectedOwnerBalance = initialOwnerBalance - transferAmountInUnits;

      expect(ownerBalance).to.equal(expectedOwnerBalance);
      expect(await token.balanceOf(recipient.address)).to.equal(transferAmount);
    });

    it('Should revert if allowance is insufficient', async function () {
      const { token, owner, spender, recipient } = await loadFixture(
        deployBJITCoinFixture
      );
      const approveAmount = 400;
      const sendAmount = 500;
      // Approve spender with insufficient allowance
      await token.connect(owner).approve(spender.address, approveAmount);

      // Attempt transfer exceeding allowance
      await expect(
        token
          .connect(spender)
          .transferFrom(owner.address, recipient.address, sendAmount)
      )
        .to.be.revertedWithCustomError(token, 'ERC20InsufficientAllowance')
        .withArgs(spender.address, approveAmount, sendAmount);
    });

    it('Should revert if balance is insufficient', async function () {
      const { token, owner, spender, recipient } = await loadFixture(
        deployBJITCoinFixture
      );
      const ownerBalance = await token.balanceOf(owner.address);

      // Approve spender
      const approveAmount = hre.ethers.parseEther('50000000001');
      await token.connect(owner).approve(spender.address, approveAmount);

      // Attempt transfer exceeding balance
      await expect(
        token
          .connect(spender)
          .transferFrom(owner.address, recipient.address, approveAmount)
      )
        .to.be.revertedWithCustomError(token, 'ERC20InsufficientBalance')
        .withArgs(owner.address, ownerBalance, approveAmount);
    });

    it('Should not update allowance if it is set to maximum uint256', async function () {
      const { token, owner, spender, recipient } = await loadFixture(
        deployBJITCoinFixture
      );

      // Approve spender with maximum uint256 allowance
      const maxUint256 = hre.ethers.MaxUint256;
      await token.connect(owner).approve(spender.address, maxUint256);

      // Transfer tokens
      const transferAmount = 500;
      await token
        .connect(spender)
        .transferFrom(owner.address, recipient.address, transferAmount);

      // Check allowance remains unchanged
      expect(await token.allowance(owner.address, spender.address)).to.equal(
        maxUint256
      );
    });

    it('Should revert if `to` address is zero', async function () {
      const { token, owner, spender } = await loadFixture(
        deployBJITCoinFixture
      );

      // Approve spender
      const approveAmount = 1000;
      await token.connect(owner).approve(spender.address, approveAmount);

      // Attempt transfer to zero address
      const transferAmount = 500;
      await expect(
        token
          .connect(spender)
          .transferFrom(owner.address, ZERO_ADDRESS, transferAmount)
      )
        .to.be.revertedWithCustomError(token, 'ERC20InvalidReceiver')
        .withArgs(ZERO_ADDRESS);
    });

    it('Should allow multiple transfers within allowance', async function () {
      const { token, owner, spender, recipient } = await loadFixture(
        deployBJITCoinFixture
      );

      // Approve spender
      const approveAmount = hre.ethers.parseEther('1000');
      await token.connect(owner).approve(spender.address, approveAmount);

      // First transfer
      const transferAmount1 = hre.ethers.parseEther('400');
      await token
        .connect(spender)
        .transferFrom(owner.address, recipient.address, transferAmount1);

      // Second transfer
      const transferAmount2 = hre.ethers.parseEther('600');
      await token
        .connect(spender)
        .transferFrom(owner.address, recipient.address, transferAmount2);

      // Check balances
      const initialOwnerBalance = hre.ethers.parseEther('50000000000');
      expect(await token.balanceOf(owner.address)).to.equal(
        initialOwnerBalance - approveAmount
      );
      expect(await token.balanceOf(recipient.address)).to.equal(approveAmount);

      // Check allowance is reduced to zero
      expect(await token.allowance(owner.address, spender.address)).to.equal(0);
    });

    it('Should emit Transfer event on successful transfer', async function () {
      const { token, owner, spender, recipient } = await loadFixture(
        deployBJITCoinFixture
      );

      // Approve spender
      const approveAmount = 1000;
      await token.connect(owner).approve(spender.address, approveAmount);

      // Transfer tokens
      const transferAmount = 500;
      await expect(
        token
          .connect(spender)
          .transferFrom(owner.address, recipient.address, transferAmount)
      )
        .to.emit(token, 'Transfer')
        .withArgs(owner.address, recipient.address, transferAmount);
    });

    it('Should allow transferFrom when allowance is exactly equal to the transfer amount', async function () {
      const { token, owner, spender, recipient } = await loadFixture(
        deployBJITCoinFixture
      );

      // Approve spender with exact allowance
      const approveAmount = 500;
      await token.connect(owner).approve(spender.address, approveAmount);

      // Transfer tokens
      await expect(
        token
          .connect(spender)
          .transferFrom(owner.address, recipient.address, approveAmount)
      )
        .to.emit(token, 'Transfer')
        .withArgs(owner.address, recipient.address, approveAmount);

      // Check balances
      expect(await token.balanceOf(owner.address)).to.equal(
        50000000000n * 10n ** 18n - 500n
      );
      expect(await token.balanceOf(recipient.address)).to.equal(500n);

      // Check allowance is reduced to zero
      expect(await token.allowance(owner.address, spender.address)).to.equal(0);
    });

    it('Should revert if spender tries to transfer more than their allowance after partial transfer', async function () {
      const { token, owner, spender, recipient } = await loadFixture(
        deployBJITCoinFixture
      );

      // Approve spender
      const approveAmount = 1000;
      await token.connect(owner).approve(spender.address, approveAmount);

      // Partial transfer
      const partialTransferAmount = 500;
      await token
        .connect(spender)
        .transferFrom(owner.address, recipient.address, partialTransferAmount);

      // Attempt to transfer more than remaining allowance
      const amount = 600;
      await expect(
        token
          .connect(spender)
          .transferFrom(owner.address, recipient.address, amount)
      )
        .to.be.revertedWithCustomError(token, 'ERC20InsufficientAllowance')
        .withArgs(spender.address, partialTransferAmount, amount);
    });

    it("Should revert if spender tries to transfer tokens from an account with no approval", async function () {
      const { token, spender, recipient, otherAccount } = await loadFixture(
        deployBJITCoinFixture
      );

      // Attempt transfer without approval
      const transferAmount = 500;
      await expect(
        token
          .connect(spender)
          .transferFrom(otherAccount.address, recipient.address, transferAmount)
      )
        .to.be.revertedWithCustomError(token, 'ERC20InsufficientAllowance')
        .withArgs(spender.address, 0, transferAmount);
    });

    it('Should not update allowance if it is set to maximum uint256', async function () {
      const { token, owner, spender, recipient } = await loadFixture(
        deployBJITCoinFixture
      );

      // Approve spender with maximum uint256 allowance
      const maxUint256 = hre.ethers.MaxUint256;
      await token.connect(owner).approve(spender.address, maxUint256);

      // Transfer tokens
      const transferAmount = 500;
      await token
        .connect(spender)
        .transferFrom(owner.address, recipient.address, transferAmount);

      // Check allowance remains unchanged
      expect(await token.allowance(owner.address, spender.address)).to.equal(
        maxUint256
      );
    });

    it('Should revert approve if `from` address is zero', async function () {
      const { token, spender, recipient } = await loadFixture(
        deployBJITCoinFixture
      );

      // Attempt transfer from zero address
      const transferAmount = 1000;
      await expect(token.connect(spender).approve(ZERO_ADDRESS, transferAmount))
        .to.be.revertedWithCustomError(token, 'ERC20InvalidSpender')
        .withArgs(ZERO_ADDRESS);
    });

    it('Should revert if `to` address is zero', async function () {
      const { token, owner, spender } = await loadFixture(
        deployBJITCoinFixture
      );

      // Approve spender
      const approveAmount = 1000;
      await token.connect(owner).approve(spender.address, approveAmount);

      // Attempt transfer to zero address
      const transferAmount = 500;
      await expect(
        token
          .connect(spender)
          .transferFrom(owner.address, ZERO_ADDRESS, transferAmount)
      )
        .to.be.revertedWithCustomError(token, 'ERC20InvalidReceiver')
        .withArgs(ZERO_ADDRESS);
    });

    it('Should allow multiple transfers within allowance', async function () {
      const { token, owner, spender, recipient } = await loadFixture(
        deployBJITCoinFixture
      );

      // Approve spender
      const approveAmount = 1000;
      await token.connect(owner).approve(spender.address, approveAmount);

      // First transfer
      const transferAmount1 = 400;
      await token
        .connect(spender)
        .transferFrom(owner.address, recipient.address, transferAmount1);

      // Second transfer
      const transferAmount2 = 600;
      await token
        .connect(spender)
        .transferFrom(owner.address, recipient.address, transferAmount2);

      // Check balances
      const ownerBalance = await token.balanceOf(owner.address);
      const initialOwnerBalance = hre.ethers.parseEther('50000000000');
      const transferAmountInUnits = hre.ethers.parseUnits('1000', 0);
      const expectedOwnerBalance = initialOwnerBalance - transferAmountInUnits;
      expect(await token.balanceOf(recipient.address)).to.equal(
        transferAmountInUnits
      );

      // Check allowance is reduced to zero
      expect(await token.allowance(owner.address, spender.address)).to.equal(0);
    });
  });
});
