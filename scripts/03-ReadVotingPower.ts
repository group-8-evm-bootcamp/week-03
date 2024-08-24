import { Address, formatEther } from "viem";

import { abi as abiToken } from "../artifacts/contracts/ERC20Token.sol/ERC20Token.json";
import { abi as abiBallot } from "../artifacts/contracts/TokenizedBallot.sol/TokenizedBallot.json";

import { connectToBlockchainWithRPC } from "../helpers/connectToBlockchainWithRPC";
import { ADDRESS_REGEX } from "../helpers/constants";

async function main() {
  // yarn read-voting-power "tokenContractAddress" "ballotContractAddress" "address1" "address2" "address3"...

  // --- Validate tokenContractAddress, ballotContractAddress and walletAddresses ---

  const [tokenContractAddress, ballotContractAddress, ...walletAddresses] =
    process.argv.slice(2) as Address[];
  if (!tokenContractAddress) {
    throw new Error(
      "Token contract address should be provided as first argument"
    );
  }
  if (!ballotContractAddress) {
    throw new Error(
      "Ballot contract address should be provided as second argument"
    );
  }
  if (!walletAddresses.length) {
    throw new Error("At least one wallet address should be provided");
  }
  Array.from([
    tokenContractAddress,
    ballotContractAddress,
    ...walletAddresses,
  ]).forEach((address, i) => {
    if (!ADDRESS_REGEX.test(address)) {
      if (i === 0) {
        throw new Error(`Invalid token contract address: ${address}`);
      } else if (i === 1) {
        throw new Error(`Invalid ballot contract address: ${address}`);
      } else {
        throw new Error(`Invalid wallet address: ${address}`);
      }
    }
  });
  console.log("Token Contract Address:", tokenContractAddress);
  console.log("Ballot Contract Address:", ballotContractAddress);
  console.log("Wallet Addresses:", walletAddresses);

  // --- Connect to Sepolia network with RPC ---

  const publicClient = await connectToBlockchainWithRPC();
  const blockNumber = await publicClient.getBlockNumber();
  console.log("\nLast block number:", blockNumber);

  // --- Read the voting power ---

  for (const address of walletAddresses) {
    console.log(`\nCheck the voting power for ${address}...`);

    const checkVotingPowerFromToken = (await publicClient.readContract({
      address: tokenContractAddress,
      abi: abiToken,
      functionName: "getVotes",
      args: [address],
    })) as bigint;

    console.log(
      "Voting power from token contract:",
      formatEther(checkVotingPowerFromToken)
    );

    const checkVotingPowerForBallot = (await publicClient.readContract({
      address: ballotContractAddress,
      abi: abiBallot,
      functionName: "getVotePower",
      args: [address],
    })) as bigint;

    console.log(
      "Voting power for ballot contract:",
      formatEther(checkVotingPowerForBallot)
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
