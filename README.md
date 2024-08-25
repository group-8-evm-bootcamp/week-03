# Weekend Project - Week-03

## Instructions

This is a group activity for at least 3 students:

- Complete the contracts together
- Develop and run scripts for “TokenizedBallot.sol” within your group to give voting tokens, delegating voting power, casting votes, checking vote power and querying results
- Write a report with each function execution and the transaction hash, if successful, or the revert reason, if failed
- Submit your weekend project by filling the form provided in Discord
- Share your code in a github repo in the submission form

## How to Use the Application

### Prerequisites

1. **Alchemy Account**: Obtain your `ALCHEMY_API_KEY`.
2. **Metamask Account**: Retrieve your `PRIVATE_KEY` from your wallet.
3. **Etherscan Account**: Obtain your `ETHERSCAN_API_KEY`.
4. **ETH Sepolia Balance**: To interact with the smart contract, ensure you have a balance of ETH on the Sepolia testnet. You can acquire some from the [Google Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia).
5. **Environment Setup**: Create a `.env` file in the root directory of the application. You can copy and modify the variables from the provided [.env.example](.env.example) file.
6. **Package Manager**: Ensure you have `Yarn v1.22.22 (Classic)` installed.

### Installation

1. Install the necessary dependencies by running:

   ```bash
   yarn install
   ```

### Interactions

1. **Deploy Contract**  
   Deploy the smart contract with your inputs:

   ```bash
   yarn deploy-contract "token" "tokenName" "tokenSymbol" # for token
   yarn deploy-contract "ballot" "proposal1,proposal2,proposal3,..." "tokenContractAddress" "targetBlockNumber" # for ballot
   ```

2. **Mint Token**  
   This step is only for those with the `MINTER_ROLE`, which is assigned during deployment. You can add more `MINTER_ROLE` members after deployment using the token contract's features, but only those with the `DEFAULT_ADMIN_ROLE` can do this. Replace the parameters with your inputs:

   ```bash
   yarn mint-token "tokenContractAddress" "recipientAddress" "amount"
   ```

3. **Read Voting Power**  
   After minting tokens, you can check your voting power. You can also check the voting power of multiple addresses:

   ```bash
   yarn read-voting-power "tokenContractAddress" "ballotContractAddress" "address1" "address2" "address3"...
   ```

   **Note**: If the voting power for the ballot contract is still 0, even though you have voting power from the token contract, it means you are not eligible to become a voter in that ballot contract.

4. **Get Voting Power**  
   If your voting power from the token contract is still 0, you can activate it with this command:

   ```bash
   yarn get-voting-power "tokenContractAddress" "delegatorAddress"
   ```

5. **Cast a Vote**  
   This step is only for voters who have been granted voting rights by the ballot contract based on the target block number (you can check in `step no.3`). Cast your vote by providing the contract address, your chosen proposal index, and the amount of voting power:

   ```bash
   yarn cast-vote "ballotContractAddress" "proposalIndex" "amount"
   ```

6. **Read Winning Proposal**  
   Check which proposal is currently winning by providing the ballot contract address:

   ```bash
   yarn check-winning-proposal "ballotContractAddress"
   ```

7. **Verify Contract in Sepolia Etherscan**

   ```bash
   npx hardhat verify --network sepolia --constructor-args arguments/tokenArguments.js "tokenContractAddress"
   npx hardhat verify --network sepolia --constructor-args arguments/ballotArguments.js "ballotContractAddress"
   ```

## Group 8 Participants

| Unique id | Discord username |
| --------- | ---------------- |
| c8ynre    | @tianbuyung      |
| 4Qt1qT    | @0xOwenn         |
| gGe7Bg    | @ErZeTe          |
| PCy7xD    | @joosh75         |
=======


## Report

Please check into [CONTRACT INTERACTION REPORT](./reports/contract-interaction.md)
