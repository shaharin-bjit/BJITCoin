// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ownerAddress = process.env.ACCOUNT_ADDRESS;
if (!ownerAddress) {
  throw new Error("ACCOUNT_ADDRESS environment variable is not set.");
}

const BJITCoinModule = buildModule("BJITCoinModule", (m) => {
  const token = m.contract("BJITCoin", [ownerAddress]);

  return { token };
});

export default BJITCoinModule;
