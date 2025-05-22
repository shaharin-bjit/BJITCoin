import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import "solidity-coverage";
import "hardhat-gas-reporter";
import "@nomicfoundation/hardhat-verify";

// Load environment variables from a .env file
dotenv.config();

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || ""; // Add your Sepolia RPC URL in the .env file
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || ""; // Add your Mainnet RPC URL in the .env file
const PRIVATE_KEY = process.env.PRIVATE_KEY || ""; // Add your wallet's private key in the .env file
// const MNEMONIC = process.env.MNEMONIC || "";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.5.15",
      },
    ],
  },
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY !== "" ? [PRIVATE_KEY] : [],
    },
    mainnet: {
      url: MAINNET_RPC_URL || "",
      accounts: PRIVATE_KEY !== "" ? [PRIVATE_KEY] : [],
    },
    local: {
      url: "http://127.0.0.1:8545",
    },
  },
  gasReporter: {
    enabled: true,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
