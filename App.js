
import React, { useState, useEffect, useCallback } from 'react';
import { VoteOption, ChartDataPoint } from './types.js'; // Updated import
import { solanaService } from './services/solanaService.js'; // Updated import
import SimpleBarChart from './components/SimpleBarChart.js'; // Updated import
import { WalletIcon, CheckCircleIcon, XCircleIcon, MinusCircleIcon, ChevronLeftIcon, UsersIcon } from './components/icons.js'; // Updated import

// Helper to format stake
const formatStake = (stake) => {
  if (stake >= 1_000_000) return `${(stake / 1_000_000).toFixed(2)}M SOL`;
  if (stake >= 1_000) return `${(stake / 1_000).toFixed(1)}K SOL`;
  return `${stake} SOL`;
};

const VoteOptionDisplay = ({ vote }) => {
  const voteStyle = { display: 'flex', alignItems: 'center' };
  let color = '#9ca3af'; // default gray-400
  let IconComponent = MinusCircleIcon; // Renamed to avoid conflict

  switch (vote) {
    case VoteOption.YES:
      color = '#22c55e'; // green-500
      IconComponent = CheckCircleIcon;
      break;
    case VoteOption.NO:
      color = '#ef4444'; // red-500
      IconComponent = XCircleIcon;
      break;
    case VoteOption.ABSTAIN:
      color = '#f59e0b'; // amber-500
      IconComponent = MinusCircleIcon;
      break;
  }
  return <span style={{...voteStyle, color}}><IconComponent className="w-5 h-5 mr-1" /> {vote}</span>;
};

const App = () => {
  const [proposals, setProposals] = useState([]);
  const [validators, setValidators] = useState([]);
  const [validatorVotes, setValidatorVotes] = useState([]);
  const [delegators, setDelegators] = useState([]);
  const [delegatorSuggestions, setDelegatorSuggestions] = useState([]);
  
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [connectedDelegator, setConnectedDelegator] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const mockDelegatorId = 'delegator1_wallet_address_xxxxxxxxxxxx';

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        fetchedProposals, 
        fetchedValidators, 
        fetchedDelegators,
      ] = await Promise.all([
        solanaService.getProposals(),
        solanaService.getValidators(),
        solanaService.getDelegators(),
      ]);
      setProposals(fetchedProposals);
      setValidators(fetchedValidators);
      setDelegators(fetchedDelegators);

      if (selectedProposal) {
        const [fetchedValidatorVotes, fetchedDelegatorSuggestions] = await Promise.all([
            solanaService.getValidatorVotesForProposal(selectedProposal.id),
            solanaService.getDelegatorSuggestionsForProposal(selectedProposal.id)
        ]);
        setValidatorVotes(fetchedValidatorVotes);
        setDelegatorSuggestions(fetchedDelegatorSuggestions);
      } else {
        setValidatorVotes([]);
        setDelegatorSuggestions([]);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProposal]); // Include selectedProposal in dependency array

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleConnectWallet = async () => {
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

  const handleSelectProposal = (proposal) => {
    setSelectedProposal(proposal);
  };

  const handleBackToProposals = () => {
    setSelectedProposal(null);
  };

  const handleCastDelegatorVote = async (proposalId, vote) => {
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
      const updatedSuggestions = await solanaService.getDelegatorSuggestionsForProposal(proposalId);
      setDelegatorSuggestions(updatedSuggestions);
    } catch (error) {
      console.error("Error casting vote:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getOverallConsensusData = (proposal) => {
    if (!proposal) return [];
    return [
      { name: VoteOption.YES, value: proposal.totalYesStake || 0, fill: 'rgb(34 197 94)' },
      { name: VoteOption.NO, value: proposal.totalNoStake || 0, fill: 'rgb(239 68 68)' },
      { name: VoteOption.ABSTAIN, value: proposal.totalAbstainStake || 0, fill: 'rgb(245 158 11)' },
    ];
  };
  
  const getDelegatorSuggestionDataForValidator = (proposalId, validatorId) => {
    const suggestionsForValidator = delegatorSuggestions.filter(
      s => s.proposalId === proposalId && s.validatorId === validatorId
    );
    let yesStake = 0, noStake = 0, abstainStake = 0;
    suggestionsForValidator.forEach(s => {
      if (s.vote === VoteOption.YES) yesStake += s.stakeWeight;
      else if (s.vote === VoteOption.NO) noStake += s.stakeWeight;
      else if (s.vote === VoteOption.ABSTAIN) abstainStake += s.stakeWeight;
    });
    return [
      { name: VoteOption.YES, value: yesStake, fill: 'rgba(34, 197, 94, 0.7)' },
      { name: VoteOption.NO, value: noStake, fill: 'rgba(239, 68, 68, 0.7)' },
      { name: VoteOption.ABSTAIN, value: abstainStake, fill: 'rgba(245, 158, 11, 0.7)' },
    ].filter(d => d.value > 0);
  };

  if (isLoading && !selectedProposal && proposals.length === 0) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.25rem', color: '#d1d5db' }}>Loading Solana Consensus Data...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', padding: '1rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#34d399' /* Green for simplicity */ }}>
            Solana Consensus Viewer
          </h1>
          {connectedDelegator ? (
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }}>
              <img 
                src={`https://picsum.photos/seed/${connectedDelegator.id}/32/32`} 
                alt={connectedDelegator.name} 
                style={{ width: '32px', height: '32px', borderRadius: '50%', marginRight: '0.5rem', border: '2px solid #22c55e' }}
              />
              <span style={{ marginRight: '1rem', fontSize: '0.875rem' }}>{connectedDelegator.name} ({formatStake(connectedDelegator.stakeAmount)})</span>
              <button onClick={handleDisconnectWallet} style={{ backgroundColor: '#dc2626'}}>Disconnect</button>
            </div>
          ) : (
            <button onClick={handleConnectWallet} style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', backgroundColor: '#16a34a' }}>
              <WalletIcon className="w-5 h-5 mr-2" /> Connect Wallet (Simulated)
            </button>
          )}
        </div>
      </header>

      {selectedProposal ? (
        <div className="card">
          <button onClick={handleBackToProposals} style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', backgroundColor: '#2563eb' }}>
            <ChevronLeftIcon className="w-5 h-5 mr-1" /> Back to Proposals
          </button>
          <h2 className="text-2xl font-semibold mb-2 text-green-500">{selectedProposal.title}</h2>
          <p className="text-sm text-gray-400 mb-1">Status: <span className={`font-semibold ${selectedProposal.status === 'Active' ? 'text-green-500' : 'text-red-500'}`}>{selectedProposal.status}</span></p>
          <p className="text-sm text-gray-400 mb-4">Created: {new Date(selectedProposal.creationDate).toLocaleDateString()}</p>
          <p className="text-gray-300 mb-6">{selectedProposal.description}</p>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3 text-purple-400">Overall Validator Consensus (by Stake)</h3>
            {isLoading && validatorVotes.length === 0 ? <p className="text-gray-400">Loading consensus data...</p> : 
            getOverallConsensusData(selectedProposal).reduce((sum, item) => sum + item.value, 0) > 0 ?
             <SimpleBarChart data={getOverallConsensusData(selectedProposal)} barKey="value" xAxisKey="name" height={250} />
             : <p className="text-gray-400">No validator votes recorded yet for this proposal.</p>
            }
          </div>

          {connectedDelegator && selectedProposal.status === 'Active' && (
            <div className="card mb-8" style={{ backgroundColor: '#374151' /* gray-700 */ }}>
              <h3 className="text-lg font-semibold mb-3 text-green-500">Your Vote Suggestion (as {connectedDelegator.name})</h3>
              <p className="text-sm text-gray-400 mb-3">
                You are delegating to: {validators.find(v => v.id === connectedDelegator.delegatedToValidatorId)?.name || 'Unknown Validator'}. 
                Your stake: {formatStake(connectedDelegator.stakeAmount)}.
              </p>
              <div className="flex space-x-3">
                {[VoteOption.YES, VoteOption.NO, VoteOption.ABSTAIN].map(option => {
                  const existingSuggestion = delegatorSuggestions.find(s => s.delegatorId === connectedDelegator.id && s.proposalId === selectedProposal.id);
                  const isCurrentVote = existingSuggestion?.vote === option;
                  let buttonStyle = {};
                  if (isCurrentVote) {
                    if (option === VoteOption.YES) buttonStyle = {backgroundColor: '#22c55e', color: 'white', outline: '2px solid #86efac'};
                    else if (option === VoteOption.NO) buttonStyle = {backgroundColor: '#ef4444', color: 'white', outline: '2px solid #fca5a5'};
                    else buttonStyle = {backgroundColor: '#f59e0b', color: '#1f2937', outline: '2px solid #fcd34d'};
                  } else {
                     buttonStyle = {backgroundColor: '#4b5563'};
                  }
                  return (
                    <button
                      key={option}
                      onClick={() => handleCastDelegatorVote(selectedProposal.id, option)}
                      disabled={isLoading}
                      style={buttonStyle}
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
            <h3 className="text-xl font-semibold mb-4 text-purple-400">Validator Votes & Delegator Suggestions</h3>
            {isLoading && validatorVotes.length === 0 ? <p className="text-gray-400">Loading validator votes...</p> :
            validatorVotes.length > 0 ? (
              <div className="space-y-6">
                {validatorVotes.map(vote => {
                  const validator = validators.find(v => v.id === vote.validatorId);
                  if (!validator) return null;
                  const delegatorSuggestionData = getDelegatorSuggestionDataForValidator(selectedProposal.id, validator.id);
                  const totalDelegatorSuggestionStake = delegatorSuggestionData.reduce((sum, item) => sum + item.value, 0);

                  return (
                    <div key={validator.id} className="card" style={{ backgroundColor: '#374151' /* gray-700 */}}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <img src={validator.avatarUrl || `https://picsum.photos/seed/${validator.id}/32/32`} alt={validator.name} style={{width: '32px', height: '32px', borderRadius: '50%', marginRight: '0.75rem', border: '1px solid #6b7280'}} />
                          <div>
                             <p className="font-semibold">{validator.name}</p>
                             <p className="text-xs text-gray-400">Total Stake: {formatStake(validator.totalStake)}</p>
                          </div>
                        </div>
                        <div style={{textAlign: 'right'}}>
                            <p className="text-sm text-gray-400">Validator Voted:</p>
                            <VoteOptionDisplay vote={vote.vote} />
                        </div>
                      </div>
                      
                      <div style={{marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #4b5563'}}>
                        <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                          <UsersIcon className="w-4 h-4 mr-1 text-green-500"/> Delegator Suggestions for {validator.name}
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
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>
          {proposals.map(proposal => (
            <div 
              key={proposal.id} 
              className="card"
              style={{cursor: 'pointer'}}
              onClick={() => handleSelectProposal(proposal)}
            >
              <h3 className="text-xl font-semibold mb-2 text-green-500">{proposal.title}</h3>
              <p className="text-sm text-gray-400 mb-1">Status: <span className={`font-semibold ${proposal.status === 'Active' ? 'text-green-500' : 'text-red-500'}`}>{proposal.status}</span></p>
              <p className="text-sm text-gray-400 mb-3">Created: {new Date(proposal.creationDate).toLocaleDateString()}</p>
              <p className="text-gray-300 text-sm line-clamp-3 mb-4">{proposal.description}</p>
              <div className="mt-auto pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-500">Validator Consensus (Stake):</p>
                <div className="flex justify-between text-xs mt-1">
                    <span className="text-green-500">Yes: {formatStake(proposal.totalYesStake || 0)}</span>
                    <span className="text-red-500">No: {formatStake(proposal.totalNoStake || 0)}</span>
                    <span className="text-amber-500">Abstain: {formatStake(proposal.totalAbstainStake || 0)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <footer style={{textAlign: 'center', marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid #374151'}}>
        <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Solana Consensus Viewer. For demonstration purposes only.</p>
      </footer>
    </div>
  );
};

export default App;
