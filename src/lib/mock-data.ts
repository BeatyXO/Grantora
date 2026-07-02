import { ConsensusRecord, FundingCall, Proposal } from "@/lib/types";

export const demoFundingCalls: FundingCall[] = [];

export const demoProposals: Proposal[] = [];

export const demoConsensus: ConsensusRecord[] = [];

export function getFundingCallById(id: string) {
  return demoFundingCalls.find((call) => call.id === id);
}

export function getProposalById(id: string) {
  return demoProposals.find((proposal) => proposal.id === id);
}

export function getConsensusByProposalId(id: string) {
  return demoConsensus.find((record) => record.proposalId === id);
}
