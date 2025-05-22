
export enum VoteOption {
  YES = 'Yes',
  NO = 'No',
  ABSTAIN = 'Abstain',
  PENDING = 'Pending'
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  status: 'Active' | 'Closed';
  creationDate: string; // ISO Date string
  // Additional fields for overall consensus
  totalYesStake?: number;
  totalNoStake?: number;
  totalAbstainStake?: number;
}

export interface Validator {
  id: string;
  name: string;
  totalStake: number; // Total SOL staked to this validator
  avatarUrl?: string; // Optional: URL for validator avatar
}

export interface ValidatorVote {
  proposalId: string;
  validatorId: string;
  vote: VoteOption;
}

export interface Delegator {
  id: string; // Wallet address
  name: string; // Optional: Nickname or ENS-like name
  stakeAmount: number; // SOL staked by this delegator
  delegatedToValidatorId: string;
}

export interface DelegatorSuggestion {
  proposalId: string;
  delegatorId: string; // Wallet address
  validatorId: string; // To easily find suggestions for a specific validator
  vote: VoteOption;
  stakeWeight: number; // The stakeAmount of the delegator at the time of voting
}

// For chart data
export interface ChartDataPoint {
  name: string;
  value: number;
  fill: string;
}
    