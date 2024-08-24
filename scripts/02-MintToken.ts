import { Address, formatEther } from "viem";

import { abi } from "../artifacts/contracts/ERC20Token.sol/ERC20Token.json";

import { connectToBlockchainWithRPC } from "../helpers/connectToBlockchainWithRPC";
import { userConnectWallet } from "../helpers/userConnectWallet";
import { ADDRESS_REGEX } from "../helpers/constants";

async function main() {
  // yarn mint-token "tokenContractAddress" "recipientAddress" "amount"

  // Take arguments and cut the first two args as it's not needed
  const userInputs = process.argv.slice(2);
  if (!userInputs) throw new Error("Parameters not completely provided");

  // --- Validate contractAddress and recipientAddress ---

  const [contractAddress, recipientAddress] = userInputs as Address[];
  if (!contractAddress) {
    throw new Error("Contract address should be provided as first argument");
  }
  if (!recipientAddress) {
    throw new Error("Recipient address should be provided as second argument");
  }
  Array.from([contractAddress, recipientAddress]).forEach((address, i) => {
    if (!ADDRESS_REGEX.test(address)) {
      if (i === 0) {
        throw new Error(`Invalid contract address: ${address}`);
      } else {
        throw new Error(`Invalid recipient address: ${address}`);
      }
    }
  });
  console.log("Contract Address:", contractAddress);
  console.log("Recipient Address:", recipientAddress);

  // --- Validate amount ---

  const amount = BigInt(userInputs[2]);
  if (!amount) throw new Error("Amount should be provided as third argument");
  console.log("Amount:", amount);

  // --- Connect to Sepolia network with RPC ---

  const publicClient = await connectToBlockchainWithRPC();
  const blockNumber = await publicClient.getBlockNumber();
  console.log("\nLast block number:", blockNumber);

  // --- Connect to the minter wallet ---

  const minter = await userConnectWallet();
  console.log("Minter address:", minter.account.address);

  const balance = await publicClient.getBalance({
    address: minter.account.address,
  });
  console.log(
    "Minter balance:",
    formatEther(balance),
    minter.chain.nativeCurrency.symbol
  );

  // --- Mint the token ---

  console.log(`\nMinting token to ${recipientAddress}...`);

  const hash = await minter.writeContract({
    address: contractAddress,
    abi,
    functionName: "mint",
    args: [recipientAddress, amount],
  });

  console.log("Transaction hash:", hash);
  console.log("Waiting for confirmations...");

  await publicClient.waitForTransactionReceipt({ hash });

  console.log("Transaction confirmed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
