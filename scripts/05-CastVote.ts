import { Address, formatEther, hexToString } from "viem";

import { abi } from "../artifacts/contracts/TokenizedBallot.sol/TokenizedBallot.json";

import { connectToBlockchainWithRPC } from "../helpers/connectToBlockchainWithRPC";
import { userConnectWallet } from "../helpers/userConnectWallet";
import { ADDRESS_REGEX } from "../helpers/constants";

async function main() {
  // yarn cast-vote "contractAddress" "proposalIndex" "amount"

  // Take arguments and cut the first two args as it's not needed
  const userInputs = process.argv.slice(2);
  if (!userInputs) throw new Error("Parameters not completely provided");

  // --- Validate contractAddress ---

  const contractAddress = userInputs[0] as Address;
  if (!contractAddress) {
    throw new Error("Contract address should be provided as first argument");
  }
  if (!ADDRESS_REGEX.test(contractAddress)) {
    throw new Error(`Invalid contract address: ${contractAddress}`);
  }
  console.log("Contract Address:", contractAddress);

  // --- Validate proposalIndex ---

  const proposalIndex = BigInt(userInputs[1]) as bigint;
  if (!proposalIndex) {
    throw new Error("Proposal index should be provided as second argument");
  }
  console.log("Proposal Index:", proposalIndex);

  // --- Validate amount ---

  const amount = BigInt(userInputs[2]) as bigint;
  if (!amount) throw new Error("Amount should be provided as third argument");
  console.log("Amount:", amount);

  // --- Connect to Sepolia network with RPC ---

  const publicClient = await connectToBlockchainWithRPC();
  const blockNumber = await publicClient.getBlockNumber();
  console.log("\nLast block number:", blockNumber);

  // --- Connect to the user wallet ---

  const voter = await userConnectWallet();
  console.log("voter address:", voter.account.address);

  const balance = await publicClient.getBalance({
    address: voter.account.address,
  });
  console.log(
    "Voter balance:",
    formatEther(balance),
    voter.chain.nativeCurrency.symbol
  );

  // --- Check if the proposal exists ---

  console.log("Proposal selected: ");
  const proposal = (await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "proposals",
    args: [proposalIndex],
  })) as any[];

  const name = hexToString(proposal[0], { size: 32 });
  console.log("Voting to proposal", name);
  console.log("Confirm? (Y/n)");

  // --- Confirmation the selection ---

  const stdin = process.stdin;

  stdin.addListener("data", async function (d) {
    if (d.toString().trim().toLowerCase() != "n") {
      const hash = await voter.writeContract({
        address: contractAddress,
        abi,
        functionName: "vote",
        args: [proposalIndex, amount],
      });

      console.log("Transaction hash:", hash);
      console.log("Waiting for confirmations...");

      await publicClient.waitForTransactionReceipt({ hash });

      console.log("Transaction confirmed");
    } else {
      console.log("Operation cancelled");
    }
    process.exit();
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
