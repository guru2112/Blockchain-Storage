import { ethers } from "ethers";
import hre from "hardhat";

async function main() {
  // Detect which network we're deploying to
  let provider;
  let wallet;

  // Check if we're using localhost (hardhat node)
  if (process.env.HARDHAT_NETWORK === "localhost" || hre.network.name === "localhost") {
    // Connect to local hardhat node
    provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    // Use first default hardhat account
    const signer = await hre.ethers.provider.getSigner(0);
    wallet = signer;
  } else {
    // Use Sepolia testnet
    provider = new ethers.JsonRpcProvider(
      process.env.SEPOLIA_RPC_URL
    );

    wallet = new ethers.Wallet(
      process.env.SEPOLIA_PRIVATE_KEY!,
      provider
    );
  }

  const artifact = await hre.artifacts.readArtifact("FileStorage");

  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );

  console.log("Deploying contract...");

  const contract = await factory.deploy();

  await contract.waitForDeployment();

  const deployedAddress = await contract.getAddress();
  console.log("✅ Contract deployed to:", deployedAddress);
  console.log("\n📝 Update your .env.local with:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${deployedAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});