import { Address, formatEther } from "viem";

import { abi } from "../artifacts/contracts/ERC20Token.sol/ERC20Token.json";

import { connectToBlockchainWithRPC } from "../helpers/connectToBlockchainWithRPC";
import { userConnectWallet } from "../helpers/userConnectWallet";
import { ADDRESS_REGEX } from "../helpers/constants";

async function main() {
  // yarn get-voting-power "tokenContractAddress" "delegatorAddress"

  // --- Validate contractAddress and delegatorAddress ---

  const [contractAddress, delegatorAddress] = process.argv.slice(
    2
  ) as Address[];
  if (!contractAddress) {
    throw new Error("Contract address should be provided as first argument");
  }
  if (!delegatorAddress) {
    throw new Error("Delegator address should be provided as second argument");
  }
  Array.from([contractAddress, delegatorAddress]).forEach((address, i) => {
    if (!ADDRESS_REGEX.test(address)) {
      if (i === 0) {
        throw new Error(`Invalid contract address: ${address}`);
      } else {
        throw new Error(`Invalid delegator address: ${address}`);
      }
    }
  });
  console.log("Contract Address:", contractAddress);
  console.log("Delegator Address:", delegatorAddress);

  // --- Connect to Sepolia network with RPC ---

  const publicClient = await connectToBlockchainWithRPC();
  const blockNumber = await publicClient.getBlockNumber();
  console.log("\nLast block number:", blockNumber);

  // --- Connect to the user wallet ---

  const user = await userConnectWallet();
  console.log("User address:", user.account.address);

  const balance = await publicClient.getBalance({
    address: user.account.address,
  });
  console.log(
    "User balance:",
    formatEther(balance),
    user.chain.nativeCurrency.symbol
  );

  // --- Get the voting power ---

  console.log(`\nGetting the voting power for ${delegatorAddress}...`);

  const hash = await user.writeContract({
    address: contractAddress,
    abi,
    functionName: "delegate",
    args: [delegatorAddress],
  });

  console.log("Transaction hash:", hash);
  console.log("Waiting for confirmations...");

  await publicClient.waitForTransactionReceipt({ hash });

  console.log("Transaction confirmed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
