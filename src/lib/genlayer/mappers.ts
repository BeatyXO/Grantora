import { ConsensusRecord, FundingCall, Proposal } from "@/lib/types";

type ContractFundingCall = {
  id: string;
  title: string;
  organization: string;
  funding_objectives: string;
  eligibility_requirements: string;
  evaluation_criteria: string;
  max_funding_amount: string;
  submission_deadline: string;
  strategic_priorities: string;
  creator: string;
  status: string;
};

type ContractProposal = {
  id: string;
  funding_call_id: string;
  title: string;
  principal_investigator: string;
  research_summary: string;
  problem_statement: string;
  objectives: string;
  methodology: string;
  budget_summary: string;
  impact_statement: string;
  evidence_urls: string[];
  owner_address: string;
  status: string;
};

type ContractConsensus = {
  proposal_id: string;
  funding_recommendation: string;
  scientific_merit_score: number;
  novelty_score: number;
  societal_impact_score: number;
  feasibility_score: number;
  budget_credibility_score: number;
  funding_call_alignment_score: number;
  confidence_score: number;
  key_strengths: string[];
  key_risks: string[];
  follow_up_questions: string[];
  recommendation_summary: string;
};

export function toFundingCall(record: ContractFundingCall): FundingCall {
  return {
    id: record.id,
    title: record.title,
    organization: record.organization,
    fundingObjectives: record.funding_objectives,
    eligibilityRequirements: record.eligibility_requirements,
    evaluationCriteria: record.evaluation_criteria,
    maxFundingAmount: record.max_funding_amount,
    submissionDeadline: record.submission_deadline,
    strategicPriorities: record.strategic_priorities,
  };
}

export function toProposal(record: ContractProposal): Proposal {
  return {
    id: record.id,
    fundingCallId: record.funding_call_id,
    title: record.title,
    principalInvestigator: record.principal_investigator,
    researchSummary: record.research_summary,
    problemStatement: record.problem_statement,
    objectives: record.objectives,
    methodology: record.methodology,
    budgetSummary: record.budget_summary,
    impactStatement: record.impact_statement,
    evidenceUrls: record.evidence_urls ?? [],
    ownerAddress: record.owner_address,
    status: record.status,
  };
}

export function toConsensusRecord(record: ContractConsensus): ConsensusRecord {
  return {
    proposalId: record.proposal_id,
    fundingRecommendation: record.funding_recommendation,
    scientificMeritScore: record.scientific_merit_score,
    noveltyScore: record.novelty_score,
    societalImpactScore: record.societal_impact_score,
    feasibilityScore: record.feasibility_score,
    budgetCredibilityScore: record.budget_credibility_score,
    fundingCallAlignmentScore: record.funding_call_alignment_score,
    confidenceScore: record.confidence_score,
    keyStrengths: record.key_strengths ?? [],
    keyRisks: record.key_risks ?? [],
    followUpQuestions: record.follow_up_questions ?? [],
    recommendationSummary: record.recommendation_summary,
  };
}
