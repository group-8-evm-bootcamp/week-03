import { Abi, formatEther, toHex } from "viem";

import {
  abi as abiToken,
  bytecode as bytecodeToken,
} from "../artifacts/contracts/ERC20Token.sol/ERC20Token.json";

import {
  abi as abiBallot,
  bytecode as bytecodeBallot,
} from "../artifacts/contracts/TokenizedBallot.sol/TokenizedBallot.json";

import { connectToBlockchainWithRPC } from "../helpers/connectToBlockchainWithRPC";
import { userConnectWallet } from "../helpers/userConnectWallet";

async function main() {
  // yarn deploy-contract "token" "tokenName" "tokenSymbol"
  // yarn deploy-contract "ballot" "proposal1,proposal2,proposal3,..." "tokenAddress" "targetBlockNumber"

  // Take arguments and cut the first two args as it's not needed
  const userInputs = process.argv.slice(2);
  if (!userInputs) throw new Error("Parameters not completely provided");

  const contractName = userInputs[0];
  if (contractName !== "token" && contractName !== "ballot")
    throw new Error("Unsupported contract type. Use 'token' or 'ballot'.");
  console.log("Contract Name:", contractName);

  const contractArguments = userInputs.slice(1);
  if (contractName === "token" && contractArguments.length !== 2)
    throw new Error(
      "Token contract requires two arguments: tokenName and tokenSymbol"
    );
  if (contractName === "ballot" && contractArguments.length !== 3)
    throw new Error(
      "Ballot contract requires three arguments: proposalNames, tokenContractAddress, targetBlockNumber"
    );
  console.log("Contract Arguments:");
  contractArguments.forEach((element, index) => {
    console.log(`Argument N. ${index + 1}: ${element}`);
  });

  // --- Connect to Sepolia network with RPC ---

  const publicClient = await connectToBlockchainWithRPC();
  const blockNumber = await publicClient.getBlockNumber();
  console.log("\nLast block number:", blockNumber);

  // --- Connect to the deployer wallet ---

  const deployer = await userConnectWallet();
  console.log("Deployer address:", deployer.account.address);

  const balance = await publicClient.getBalance({
    address: deployer.account.address,
  });
  console.log(
    "Deployer balance:",
    formatEther(balance),
    deployer.chain.nativeCurrency.symbol
  );

  // --- Deploy the contract ---

  let bytecode = "";
  let abi;
  let formattedArgs = [];

  if (contractName === "token") {
    bytecode = bytecodeToken;
    abi = abiToken;
    formattedArgs = contractArguments; // Just pass the string arguments as is
  } else if (contractName === "ballot") {
    bytecode = bytecodeBallot;
    abi = abiBallot;

    // Convert the first argument (proposal names) to bytes32[]
    const proposalNames = contractArguments[0]
      .split(",")
      .map((name) => toHex(name, { size: 32 }));
    const tokenContractAddress = contractArguments[1];
    const targetBlockNumber = BigInt(contractArguments[2]);

    if (targetBlockNumber <= blockNumber)
      throw new Error(
        "Target block number must be greater than the current block number"
      );

    formattedArgs = [proposalNames, tokenContractAddress, targetBlockNumber];
  } else {
    throw new Error("Unsupported contract type.");
  }

  console.log(`\nDeploying ${contractName} contract`);

  const hash = await deployer.deployContract({
    abi: abi as Abi,
    bytecode: bytecode as `0x${string}`,
    args: formattedArgs,
  });

  console.log("Transaction hash:", hash);

  console.log("Waiting for confirmations...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`${contractName} contract deployed to:`, receipt.contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
