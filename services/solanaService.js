
import { VoteOption } from '../types.js'; // Updated import

const MOCK_PROPOSALS = [
  { id: 'prop1', title: 'Upgrade Network Protocol to v1.5', description: 'This proposal aims to upgrade the Solana network protocol to version 1.5, introducing new features for enhanced scalability and security. Key changes include improved transaction processing and reduced latency.', status: 'Active', creationDate: '2024-07-01T10:00:00Z' },
  { id: 'prop2', title: 'Allocate Treasury Funds for Ecosystem Grants', description: 'Proposal to allocate 5 million SOL from the treasury for grants to projects building on Solana. The grants will focus on DeFi, NFTs, and infrastructure development.', status: 'Active', creationDate: '2024-07-15T14:30:00Z' },
  { id: 'prop3', title: 'Implement New Staking Reward Mechanism', description: 'This proposal suggests a revised staking reward mechanism to better incentivize long-term stakers and network security. It includes adjustments to inflation rates and reward distribution.', status: 'Closed', creationDate: '2024-06-01T09:00:00Z' },
];

const MOCK_VALIDATORS = [
  { id: 'val1', name: 'Certus One', totalStake: 1500000, avatarUrl: 'https://picsum.photos/seed/val1/40/40' },
  { id: 'val2', name: 'Chorus One', totalStake: 1200000, avatarUrl: 'https://picsum.photos/seed/val2/40/40' },
  { id: 'val3', name: 'Everstake', totalStake: 1800000, avatarUrl: 'https://picsum.photos/seed/val3/40/40' },
  { id: 'val4', name: 'Figment', totalStake: 900000, avatarUrl: 'https://picsum.photos/seed/val4/40/40' },
  { id: 'val5', name: 'P2P.org', totalStake: 2000000, avatarUrl: 'https://picsum.photos/seed/val5/40/40' },
];

const MOCK_VALIDATOR_VOTES = [
  // Prop1
  { proposalId: 'prop1', validatorId: 'val1', vote: VoteOption.YES },
  { proposalId: 'prop1', validatorId: 'val2', vote: VoteOption.YES },
  { proposalId: 'prop1', validatorId: 'val3', vote: VoteOption.NO },
  { proposalId: 'prop1', validatorId: 'val4', vote: VoteOption.YES },
  { proposalId: 'prop1', validatorId: 'val5', vote: VoteOption.ABSTAIN },
  // Prop2
  { proposalId: 'prop2', validatorId: 'val1', vote: VoteOption.NO },
  { proposalId: 'prop2', validatorId: 'val2', vote: VoteOption.YES },
  { proposalId: 'prop2', validatorId: 'val3', vote: VoteOption.YES },
  { proposalId: 'prop2', validatorId: 'val4', vote: VoteOption.ABSTAIN },
  { proposalId: 'prop2', validatorId: 'val5', vote: VoteOption.YES },
   // Prop3 (Closed)
  { proposalId: 'prop3', validatorId: 'val1', vote: VoteOption.YES },
  { proposalId: 'prop3', validatorId: 'val2', vote: VoteOption.YES },
  { proposalId: 'prop3', validatorId: 'val3', vote: VoteOption.YES },
  { proposalId: 'prop3', validatorId: 'val4', vote: VoteOption.NO },
  { proposalId: 'prop3', validatorId: 'val5', vote: VoteOption.YES },
];

const MOCK_DELEGATORS = [
  { id: 'delegator1_wallet_address_xxxxxxxxxxxx', name: 'Alice (High Stake)', stakeAmount: 100000, delegatedToValidatorId: 'val1' },
  { id: 'delegator2_wallet_address_yyyyyyyyyyyy', name: 'Bob (Med Stake)', stakeAmount: 50000, delegatedToValidatorId: 'val1' },
  { id: 'delegator3_wallet_address_zzzzzzzzzzzz', name: 'Carol (Low Stake)', stakeAmount: 10000, delegatedToValidatorId: 'val2' },
  { id: 'delegator4_wallet_address_wwwwwwwwwwww', name: 'Dave (High Stake)', stakeAmount: 120000, delegatedToValidatorId: 'val3' },
  { id: 'delegator5_wallet_address_vvvvvvvvvvvv', name: 'Eve (Med Stake)', stakeAmount: 60000, delegatedToValidatorId: 'val3' },
];

// In-memory store for delegator suggestions, starts empty
let MOCK_DELEGATOR_SUGGESTIONS = [
    { proposalId: 'prop1', delegatorId: 'delegator1_wallet_address_xxxxxxxxxxxx', validatorId: 'val1', vote: VoteOption.YES, stakeWeight: 100000 },
    { proposalId: 'prop1', delegatorId: 'delegator2_wallet_address_yyyyyyyyyyyy', validatorId: 'val1', vote: VoteOption.NO, stakeWeight: 50000 },
];


// Simulate API delay
const delay = (data, ms = 300) => 
  new Promise(resolve => setTimeout(() => resolve(data), ms));

export const solanaService = {
  getProposals: async () => {
    return delay(MOCK_PROPOSALS.map(p => {
      const votes = MOCK_VALIDATOR_VOTES.filter(v => v.proposalId === p.id);
      const validators = MOCK_VALIDATORS;
      let totalYesStake = 0;
      let totalNoStake = 0;
      let totalAbstainStake = 0;

      votes.forEach(vote => {
        const validator = validators.find(val => val.id === vote.validatorId);
        if (validator) {
          if (vote.vote === VoteOption.YES) totalYesStake += validator.totalStake;
          else if (vote.vote === VoteOption.NO) totalNoStake += validator.totalStake;
          else if (vote.vote === VoteOption.ABSTAIN) totalAbstainStake += validator.totalStake;
        }
      });
      return { ...p, totalYesStake, totalNoStake, totalAbstainStake };
    }));
  },
  getProposalById: async (id) => {
     const proposal = MOCK_PROPOSALS.find(p => p.id === id);
     if (!proposal) return delay(undefined);

     const votes = MOCK_VALIDATOR_VOTES.filter(v => v.proposalId === proposal.id);
     const validators = MOCK_VALIDATORS;
     let totalYesStake = 0;
     let totalNoStake = 0;
     let totalAbstainStake = 0;

     votes.forEach(vote => {
       const validator = validators.find(val => val.id === vote.validatorId);
       if (validator) {
         if (vote.vote === VoteOption.YES) totalYesStake += validator.totalStake;
         else if (vote.vote === VoteOption.NO) totalNoStake += validator.totalStake;
         else if (vote.vote === VoteOption.ABSTAIN) totalAbstainStake += validator.totalStake;
       }
     });
     return delay({ ...proposal, totalYesStake, totalNoStake, totalAbstainStake });
  },
  getValidators: async () => delay(MOCK_VALIDATORS),
  getValidatorVotesForProposal: async (proposalId) => 
    delay(MOCK_VALIDATOR_VOTES.filter(v => v.proposalId === proposalId)),
  
  getDelegators: async () => delay(MOCK_DELEGATORS),
  
  getDelegatorById: async (id) =>
    delay(MOCK_DELEGATORS.find(d => d.id === id)),

  getDelegatorSuggestionsForProposal: async (proposalId) =>
    delay(MOCK_DELEGATOR_SUGGESTIONS.filter(s => s.proposalId === proposalId)),
  
  castDelegatorSuggestion: async (
    proposalId, 
    delegatorId, 
    validatorId,
    vote, 
    stakeWeight
  ) => {
    // Remove previous suggestion from this delegator for this proposal
    MOCK_DELEGATOR_SUGGESTIONS = MOCK_DELEGATOR_SUGGESTIONS.filter(
      s => !(s.proposalId === proposalId && s.delegatorId === delegatorId)
    );
    
    const newSuggestion = { proposalId, delegatorId, validatorId, vote, stakeWeight };
    MOCK_DELEGATOR_SUGGESTIONS.push(newSuggestion);
    return delay(newSuggestion);
  },
};
