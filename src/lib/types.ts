export type FundingCall = {
  id: string;
  title: string;
  organization: string;
  fundingObjectives: string;
  eligibilityRequirements: string;
  evaluationCriteria: string;
  maxFundingAmount: string;
  submissionDeadline: string;
  strategicPriorities: string;
};

export type Proposal = {
  id: string;
  fundingCallId: string;
  title: string;
  principalInvestigator: string;
  researchSummary: string;
  problemStatement: string;
  objectives: string;
  methodology: string;
  budgetSummary: string;
  impactStatement: string;
  evidenceUrls: string[];
  ownerAddress: string;
  status: string;
};

export type ConsensusRecord = {
  proposalId: string;
  fundingRecommendation: string;
  scientificMeritScore: number;
  noveltyScore: number;
  societalImpactScore: number;
  feasibilityScore: number;
  budgetCredibilityScore: number;
  fundingCallAlignmentScore: number;
  confidenceScore: number;
  keyStrengths: string[];
  keyRisks: string[];
  followUpQuestions: string[];
  recommendationSummary: string;
};
