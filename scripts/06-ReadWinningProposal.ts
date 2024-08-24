import { Address, formatUnits, hexToString } from "viem";

import { abi } from "../artifacts/contracts/TokenizedBallot.sol/TokenizedBallot.json";

import { connectToBlockchainWithRPC } from "../helpers/connectToBlockchainWithRPC";
import { ADDRESS_REGEX } from "../helpers/constants";

async function main() {
  // yarn read-wining-proposal "ballotContractAddress"

  // Take arguments and cut the first two args as it's not needed
  const userInputs = process.argv.slice(2);

  // --- Validate contractAddress ---

  const contractAddress = userInputs[0] as Address;
  if (!contractAddress) {
    throw new Error("Contract address should be provided as first argument");
  }
  if (!ADDRESS_REGEX.test(contractAddress)) {
    throw new Error(`Invalid contract address: ${contractAddress}`);
  }
  console.log("Contract Address:", contractAddress);

  // --- Connect to Sepolia network with RPC ---

  const publicClient = await connectToBlockchainWithRPC();
  const blockNumber = await publicClient.getBlockNumber();
  console.log("\nLast block number:", blockNumber);

  // --- Check the winning proposal ---

  console.log(`\nCheck the wining proposal...`);
  const checkTheWinningProposalIndex = (await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "winningProposal",
    args: [],
  })) as any;

  const checkTheWinnerName = (await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "winnerName",
    args: [],
  })) as any;

  const proposal = (await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "proposals",
    args: [checkTheWinningProposalIndex],
  })) as any[];

  const name = hexToString(proposal[0], { size: 32 });
  const voteCount = formatUnits(proposal[1], 0);
  const winnerProposalIndex = formatUnits(checkTheWinningProposalIndex, 0);

  console.log(
    `The winner proposal is ${winnerProposalIndex} and the name is: ${hexToString(
      checkTheWinnerName
    )}`
  );
  console.log({ index: winnerProposalIndex, name, voteCount });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
