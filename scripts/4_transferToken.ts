//This script transfers tokens from the owner to the receiver address
import { ethers } from "hardhat";
import BJITCoinArtifact from "../artifacts/contracts/BJITCoin.sol/BJITCoin.json"; // Adjust path as needed
import * as dotenv from "dotenv";

async function main() {
  const [owner, _, receiver] = await ethers.getSigners();
  // Set up the connection to the deployed contract
  dotenv.config();

  const token = new ethers.Contract(
    process.env.CONTRACT_ADDRESS || "",
    BJITCoinArtifact.abi,
    owner
  );

  if (!process.env.CONTRACT_ADDRESS) {
    throw new Error("CONTRACT_ADDRESS is not defined in the .env file");
  }
  console.log("Balance before transfer");
  let ownerBalance = await token.balanceOf(owner.address);
  let receiverBalance = await token.balanceOf(receiver.address);
  console.log("Owner balance:", ethers.formatEther(ownerBalance));
  console.log("Receiver balance:", ethers.formatEther(receiverBalance));

  const transferAmount = ethers.parseUnits("100", 18);
  const tx = await token.transfer(receiver.address, transferAmount);
  const res = await tx.wait();
  console.log(res.hash);

  ownerBalance = await token.balanceOf(owner.address);
  receiverBalance = await token.balanceOf(receiver.address);
  console.log("Balance after transfer");
  console.log("Owner balance:", ethers.formatEther(ownerBalance));
  console.log("Receiver balance:", ethers.formatEther(receiverBalance));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
