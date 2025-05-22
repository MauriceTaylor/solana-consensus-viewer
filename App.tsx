
import React, { useState, useEffect, useCallback } from 'react';
import { Proposal, Validator, ValidatorVote, Delegator, DelegatorSuggestion, VoteOption, ChartDataPoint } from './types';
import { solanaService } from './services/solanaService';
import SimpleBarChart from './components/SimpleBarChart';
import { WalletIcon, CheckCircleIcon, XCircleIcon, MinusCircleIcon, ChevronLeftIcon, UsersIcon } from './components/icons';

// Helper to format stake
const formatStake = (stake: number): string => {
  if (stake >= 1_000_000) return `${(stake / 1_000_000).toFixed(2)}M SOL`;
  if (stake >= 1_000) return `${(stake / 1_000).toFixed(1)}K SOL`;
  return `${stake} SOL`;
};

const VoteOptionDisplay: React.FC<{ vote: VoteOption }> = ({ vote }) => {
  switch (vote) {
    case VoteOption.YES:
      return <span className="flex items-center text-success"><CheckCircleIcon className="w-5 h-5 mr-1" /> Yes</span>;
    case VoteOption.NO:
      return <span className="flex items-center text-error"><XCircleIcon className="w-5 h-5 mr-1" /> No</span>;
    case VoteOption.ABSTAIN:
      return <span className="flex items-center text-warning"><MinusCircleIcon className="w-5 h-5 mr-1" /> Abstain</span>;
    default:
      return <span className="text-neutral">{vote}</span>;
  }
};

const App: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [validators, setValidators] = useState<Validator[]>([]);
  const [validatorVotes, setValidatorVotes] = useState<ValidatorVote[]>([]);
  const [delegators, setDelegators] = useState<Delegator[]>([]);
  const [delegatorSuggestions, setDelegatorSuggestions] = useState<DelegatorSuggestion[]>([]);
  
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [connectedDelegator, setConnectedDelegator] = useState<Delegator | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const mockDelegatorId = 'delegator1_wallet_address_xxxxxxxxxxxx'; // Simulate one delegator

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        fetchedProposals, 
        fetchedValidators, 
        fetchedValidatorVotes, 
        fetchedDelegators,
        fetchedDelegatorSuggestions
      ] = await Promise.all([
        solanaService.getProposals(),
        solanaService.getValidators(),
        selectedProposal ? solanaService.getValidatorVotesForProposal(selectedProposal.id) : Promise.resolve([]),
        solanaService.getDelegators(),
        selectedProposal ? solanaService.getDelegatorSuggestionsForProposal(selectedProposal.id) : Promise.resolve([])
      ]);
      setProposals(fetchedProposals);
      setValidators(fetchedValidators);
      setValidatorVotes(fetchedValidatorVotes);
      setDelegators(fetchedDelegators);
      setDelegatorSuggestions(fetchedDelegatorSuggestions);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Handle error state in UI if needed
    } finally {
      setIsLoading(false);
    }
  }, [selectedProposal]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleConnectWallet = async () => {
    // Simulate wallet connection
    const delegator = await solanaService.getDelegatorById(mockDelegatorId);
    if (delegator) {
      setConnectedDelegator(delegator);
    } else {
      alert("Simulated delegator not found.");
    }
  };

  const handleDisconnectWallet = () => {
    setConnectedDelegator(null);
  };

  const handleSelectProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    // Data for selected proposal (votes, suggestions) will be fetched by useEffect due to selectedProposal dependency change
  };

  const handleBackToProposals = () => {
    setSelectedProposal(null);
  };

  const handleCastDelegatorVote = async (proposalId: string, vote: VoteOption) => {
    if (!connectedDelegator) return;
    setIsLoading(true);
    try {
      await solanaService.castDelegatorSuggestion(
        proposalId,
        connectedDelegator.id,
        connectedDelegator.delegatedToValidatorId,
        vote,
        connectedDelegator.stakeAmount
      );
      // Refetch suggestions for the current proposal
      const updatedSuggestions = await solanaService.getDelegatorSuggestionsForProposal(proposalId);
      setDelegatorSuggestions(updatedSuggestions);
    } catch (error) {
      console.error("Error casting vote:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getOverallConsensusData = (proposal: Proposal | null): ChartDataPoint[] => {
    if (!proposal) return [];
    return [
      { name: VoteOption.YES, value: proposal.totalYesStake || 0, fill: 'rgb(34 197 94)' },
      { name: VoteOption.NO, value: proposal.totalNoStake || 0, fill: 'rgb(239 68 68)' },
      { name: VoteOption.ABSTAIN, value: proposal.totalAbstainStake || 0, fill: 'rgb(245 158 11)' },
    ];
  };
  
  const getDelegatorSuggestionDataForValidator = (proposalId: string, validatorId: string): ChartDataPoint[] => {
    const suggestionsForValidator = delegatorSuggestions.filter(
      s => s.proposalId === proposalId && s.validatorId === validatorId
    );

    let yesStake = 0;
    let noStake = 0;
    let abstainStake = 0;

    suggestionsForValidator.forEach(s => {
      if (s.vote === VoteOption.YES) yesStake += s.stakeWeight;
      else if (s.vote === VoteOption.NO) noStake += s.stakeWeight;
      else if (s.vote === VoteOption.ABSTAIN) abstainStake += s.stakeWeight;
    });
    
    return [
      { name: VoteOption.YES, value: yesStake, fill: 'rgba(34, 197, 94, 0.7)' },
      { name: VoteOption.NO, value: noStake, fill: 'rgba(239, 68, 68, 0.7)' },
      { name: VoteOption.ABSTAIN, value: abstainStake, fill: 'rgba(245, 158, 11, 0.7)' },
    ].filter(d => d.value > 0); // Only show options with votes
  };


  if (isLoading && !selectedProposal && proposals.length === 0) { // Initial full page load
    return <div className="flex justify-center items-center h-screen text-xl">Loading Solana Consensus Data...</div>;
  }

  return (
    <div className="min-h-screen bg-base-100 text-gray-100 p-4 md:p-8">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-solana-green to-solana-purple">
          Solana Consensus Viewer
        </h1>
        {connectedDelegator ? (
          <div className="flex items-center mt-4 md:mt-0">
            <img 
              src={`https://picsum.photos/seed/${connectedDelegator.id}/32/32`} 
              alt={connectedDelegator.name} 
              className="w-8 h-8 rounded-full mr-2 border-2 border-solana-green"
            />
            <span className="mr-4 text-sm">{connectedDelegator.name} ({formatStake(connectedDelegator.stakeAmount)})</span>
            <button 
              onClick={handleDisconnectWallet}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button 
            onClick={handleConnectWallet}
            className="mt-4 md:mt-0 px-4 py-2 bg-primary hover:bg-green-700 text-white rounded-lg flex items-center transition-colors"
          >
            <WalletIcon className="w-5 h-5 mr-2" /> Connect Wallet (Simulated)
          </button>
        )}
      </header>

      {selectedProposal ? (
        // Proposal Detail View
        <div className="bg-base-200 p-6 rounded-lg shadow-xl">
          <button 
            onClick={handleBackToProposals}
            className="mb-6 px-4 py-2 bg-secondary hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors text-sm"
          >
            <ChevronLeftIcon className="w-5 h-5 mr-1" /> Back to Proposals
          </button>
          <h2 className="text-2xl font-semibold mb-2 text-solana-green">{selectedProposal.title}</h2>
          <p className="text-sm text-gray-400 mb-1">Status: <span className={`font-semibold ${selectedProposal.status === 'Active' ? 'text-green-400' : 'text-red-400'}`}>{selectedProposal.status}</span></p>
          <p className="text-sm text-gray-400 mb-4">Created: {new Date(selectedProposal.creationDate).toLocaleDateString()}</p>
          <p className="text-gray-300 mb-6">{selectedProposal.description}</p>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3 text-solana-purple">Overall Validator Consensus (by Stake)</h3>
            {isLoading && validatorVotes.length === 0 ? <p>Loading consensus data...</p> : 
            getOverallConsensusData(selectedProposal).reduce((sum, item) => sum + item.value, 0) > 0 ?
             <SimpleBarChart data={getOverallConsensusData(selectedProposal)} barKey="value" xAxisKey="name" height={250} />
             : <p className="text-gray-400">No validator votes recorded yet for this proposal.</p>
            }
          </div>

          {connectedDelegator && selectedProposal.status === 'Active' && (
            <div className="mb-8 p-4 bg-base-300 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-solana-green">Your Vote Suggestion (as {connectedDelegator.name})</h3>
              <p className="text-sm text-gray-400 mb-3">
                You are delegating to: {validators.find(v => v.id === connectedDelegator.delegatedToValidatorId)?.name || 'Unknown Validator'}. 
                Your stake: {formatStake(connectedDelegator.stakeAmount)}.
              </p>
              <div className="flex space-x-3">
                {[VoteOption.YES, VoteOption.NO, VoteOption.ABSTAIN].map(option => {
                  const existingSuggestion = delegatorSuggestions.find(s => s.delegatorId === connectedDelegator.id && s.proposalId === selectedProposal.id);
                  const isCurrentVote = existingSuggestion?.vote === option;
                  return (
                    <button
                      key={option}
                      onClick={() => handleCastDelegatorVote(selectedProposal.id, option)}
                      disabled={isLoading}
                      className={`px-4 py-2 rounded-lg transition-all text-sm font-medium
                        ${isCurrentVote 
                          ? (option === VoteOption.YES ? 'bg-success text-white ring-2 ring-offset-2 ring-offset-base-300 ring-green-300' 
                            : option === VoteOption.NO ? 'bg-error text-white ring-2 ring-offset-2 ring-offset-base-300 ring-red-300' 
                            : 'bg-warning text-gray-800 ring-2 ring-offset-2 ring-offset-base-300 ring-amber-300')
                          : 'bg-gray-600 hover:bg-gray-500 text-white'}
                        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {option} {isCurrentVote && ' (Selected)'}
                    </button>
                  );
                })}
              </div>
               {isLoading && <p className="text-sm mt-2 text-gray-400">Processing vote...</p>}
            </div>
          )}
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-solana-purple">Validator Votes & Delegator Suggestions</h3>
            {isLoading && validatorVotes.length === 0 ? <p>Loading validator votes...</p> :
            validatorVotes.length > 0 ? (
              <div className="space-y-6">
                {validatorVotes.map(vote => {
                  const validator = validators.find(v => v.id === vote.validatorId);
                  if (!validator) return null;
                  const delegatorSuggestionData = getDelegatorSuggestionDataForValidator(selectedProposal.id, validator.id);
                  const totalDelegatorSuggestionStake = delegatorSuggestionData.reduce((sum, item) => sum + item.value, 0);

                  return (
                    <div key={validator.id} className="p-4 bg-base-300 rounded-lg shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <img src={validator.avatarUrl || `https://picsum.photos/seed/${validator.id}/32/32`} alt={validator.name} className="w-8 h-8 rounded-full mr-3 border border-gray-500" />
                          <div>
                             <p className="font-semibold text-gray-100">{validator.name}</p>
                             <p className="text-xs text-gray-400">Total Stake: {formatStake(validator.totalStake)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-400">Validator Voted:</p>
                            <VoteOptionDisplay vote={vote.vote} />
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                          <UsersIcon className="w-4 h-4 mr-1 text-solana-green"/> Delegator Suggestions for {validator.name}
                        </h4>
                        {totalDelegatorSuggestionStake > 0 ? (
                          <SimpleBarChart 
                            data={delegatorSuggestionData} 
                            barKey="value" 
                            xAxisKey="name" 
                            height={150} 
                            showLegend={false}
                            layout="vertical"
                          />
                        ) : (
                          <p className="text-xs text-gray-500">No delegator suggestions yet for this validator on this proposal.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-gray-400">No validators have voted on this proposal yet.</p>}
          </div>
        </div>
      ) : (
        // Proposal List View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proposals.map(proposal => (
            <div 
              key={proposal.id} 
              className="bg-base-200 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer transform hover:-translate-y-1"
              onClick={() => handleSelectProposal(proposal)}
            >
              <h3 className="text-xl font-semibold mb-2 text-solana-green">{proposal.title}</h3>
              <p className="text-sm text-gray-400 mb-1">Status: <span className={`font-semibold ${proposal.status === 'Active' ? 'text-green-400' : 'text-red-400'}`}>{proposal.status}</span></p>
              <p className="text-sm text-gray-400 mb-3">Created: {new Date(proposal.creationDate).toLocaleDateString()}</p>
              <p className="text-gray-300 text-sm line-clamp-3 mb-4">{proposal.description}</p>
              <div className="mt-auto pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-500">Validator Consensus (Stake):</p>
                <div className="flex justify-between text-xs mt-1">
                    <span className="text-success">Yes: {formatStake(proposal.totalYesStake || 0)}</span>
                    <span className="text-error">No: {formatStake(proposal.totalNoStake || 0)}</span>
                    <span className="text-warning">Abstain: {formatStake(proposal.totalAbstainStake || 0)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <footer className="text-center mt-12 py-4 border-t border-base-300">
        <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Solana Consensus Viewer. For demonstration purposes only.</p>
      </footer>
    </div>
  );
};

export default App;
    