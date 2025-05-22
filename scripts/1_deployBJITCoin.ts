// This script deploys the BJITCoin contract
import { ethers, run } from "hardhat";

async function main() {
  // Compile the contract if not already compiled
  console.log("Compiling contracts...");
  await run("compile");

  // Get the contract factory
  const BJITCoin = await ethers.getContractFactory("BJITCoin");

  const [owner] = await ethers.getSigners();

  // Deploy the contract
  console.log("Deploying BJITCoin...");
  const coin = await BJITCoin.deploy(owner.address);

  // Wait for the deployment to complete
  const deploymentTx = coin.deploymentTransaction();
  await coin.waitForDeployment();

  console.log(`BJITCoin deployed to: ${await coin.getAddress()}`);

  // Get the current network name
  const network = (await ethers.provider.getNetwork()).name;

  // Map network names to explorer URLs
  const explorerUrls: { [key: string]: string } = {
    sepolia: "https://sepolia.etherscan.io/tx/",
    mainnet: "https://etherscan.io/tx/",
  };

  // Log the transaction hash
  // Log the transaction hash with the correct explorer URL
  if (deploymentTx) {
    const baseUrl = explorerUrls[network] || "http://localhost:8545/tx/";
    console.log(`Transaction: ${baseUrl}${deploymentTx.hash}`);
  } else {
    console.log("Transaction hash not available.");
  }
}

// Handle errors and execute the deployment script
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
