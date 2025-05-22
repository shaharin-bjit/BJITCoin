// This script checks the balance of the owner and receiver addresses
import { ethers } from "hardhat";
import BJITCoinArtifact from "../artifacts/contracts/BJITCoin.sol/BJITCoin.json"; // Adjust path as needed
import * as dotenv from "dotenv";

async function main() {
  const [owner] = await ethers.getSigners();
  dotenv.config();

  const token = new ethers.Contract(
    process.env.CONTRACT_ADDRESS || "",
    BJITCoinArtifact.abi,
    ethers.provider
  );

  if (!process.env.CONTRACT_ADDRESS) {
    throw new Error("CONTRACT_ADDRESS is not defined in the .env file");
  }
  try {
    const ownerBalance = await token.balanceOf(owner.address);
    console.log("Owner balance:", ethers.formatEther(ownerBalance));
  } catch (error) {
    console.error("Error fetching owner balance:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
