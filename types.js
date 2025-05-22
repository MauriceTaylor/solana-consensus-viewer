// TypeScript enums and interfaces are not directly supported in plain JavaScript without a build step.
// We are converting VoteOption to a plain object for basic usage.
// Interfaces are commented out as they serve no runtime purpose in JS.

export const VoteOption = {
  YES: 'Yes',
  NO: 'No',
  ABSTAIN: 'Abstain',
  PENDING: 'Pending'
};

// export interface Proposal {
//   id: string;
//   title: string;
//   description: string;
//   status: 'Active' | 'Closed';
//   creationDate: string; // ISO Date string
//   // Additional fields for overall consensus
//   totalYesStake?: number;
//   totalNoStake?: number;
//   totalAbstainStake?: number;
// }

// export interface Validator {
//   id: string;
//   name: string;
//   totalStake: number; // Total SOL staked to this validator
//   avatarUrl?: string; // Optional: URL for validator avatar
// }

// export interface ValidatorVote {
//   proposalId: string;
//   validatorId: string;
//   vote: VoteOption; // This would refer to the object keys if used, or string values
// }

// export interface Delegator {
//   id: string; // Wallet address
//   name: string; // Optional: Nickname or ENS-like name
//   stakeAmount: number; // SOL staked by this delegator
//   delegatedToValidatorId: string;
// }

// export interface DelegatorSuggestion {
//   proposalId: string;
//   delegatorId: string; // Wallet address
//   validatorId: string; // To easily find suggestions for a specific validator
//   vote: VoteOption; // This would refer to the object keys if used, or string values
//   stakeWeight: number; // The stakeAmount of the delegator at the time of voting
// }

// // For chart data
// export interface ChartDataPoint {
//   name: string;
//   value: number;
//   fill: string;
// }
