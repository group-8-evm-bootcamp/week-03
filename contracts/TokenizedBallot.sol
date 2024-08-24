// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

// Import the IMyToken interface from the MyToken contract
interface IERC20Token {
    function getPastVotes(address, uint256) external view returns (uint256);
}

contract TokenizedBallot {
    // This is a type for a single proposal.
    struct Proposal {
        bytes32 name;
        uint voteCount;
    }

    // A dynamically-sized array of `Proposal` structs.
    Proposal[] public proposals;
    IERC20Token public tokenContract;
    uint256 public targetBlockNumber;
    mapping(address => uint256) public spendVotePower;

    /// Create a new ballot to choose one of `proposalNames`.
    constructor(
        bytes32[] memory proposalNames,
        IERC20Token _tokenContract,
        uint256 _targetBlockNumber
    ) {
        tokenContract = IERC20Token(_tokenContract);
        targetBlockNumber = _targetBlockNumber;
        // For each of the provided proposal names,
        // create a new proposal object and add it
        // to the end of the array.
        for (uint i = 0; i < proposalNames.length; i++) {
            // `Proposal({...})` creates a temporary
            // Proposal object and `proposals.push(...)`
            // appends it to the end of `proposals`.
            proposals.push(Proposal({name: proposalNames[i], voteCount: 0}));
        }
    }

    /// Give your vote (including votes delegated to you)
    /// to proposal `proposals[proposal].name`.
    function vote(uint proposal, uint256 amount) external {
        // TODO: Implement vote function
        uint256 senderVotingPower = getVotePower(msg.sender);
        require(
            senderVotingPower >= amount,
            "TokenizedBallot: insufficient voting power"
        );
        spendVotePower[msg.sender] += amount;
        proposals[proposal].voteCount += amount;
    }

    function getVotePower(
        address voter
    ) public view returns (uint256 votePower_) {
        votePower_ =
            tokenContract.getPastVotes(voter, targetBlockNumber) -
            spendVotePower[voter];
    }

    /// @dev Computes the winning proposal taking all
    /// previous votes into account.
    function winningProposal() public view returns (uint winningProposal_) {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    // Calls winningProposal() function to get the index
    // of the winner contained in the proposals array and then
    // returns the name of the winner
    function winnerName() external view returns (bytes32 winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }
}
