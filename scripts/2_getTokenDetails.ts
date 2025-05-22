// This script fetches and logs the token details such as name, symbol, decimals, and total supply
import { ethers } from "hardhat";
import BJITCoinArtifact from "../artifacts/contracts/BJITCoin.sol/BJITCoin.json"; // Adjust path as needed
import * as dotenv from "dotenv";

async function main() {
  dotenv.config();

  const token = new ethers.Contract(
    process.env.CONTRACT_ADDRESS || "",
    BJITCoinArtifact.abi,
    ethers.provider
  );

  if (!process.env.CONTRACT_ADDRESS) {
    throw new Error("CONTRACT_ADDRESS is not defined in the .env file");
  }

  // Fetch and log the token details
  const name = await token.name();
  console.log(`Token Name: ${name}`);

  const symbol = await token.symbol();
  console.log(`Token Symbol: ${symbol}`);

  const decimals = await token.decimals();
  console.log(`Decimals: ${decimals}`);

  const totalSupply = await token.totalSupply();
  console.log(`Total Supply: ${ethers.formatUnits(totalSupply, decimals)}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
