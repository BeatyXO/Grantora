import { CalldataEncodable, TransactionStatus } from "genlayer-js/types";
import { createGrantoraReadClient, createGrantoraWriteClient, getGrantoraRuntimeConfig } from "@/lib/genlayer/client";
import { toConsensusRecord, toFundingCall, toProposal } from "@/lib/genlayer/mappers";
import { ConsensusRecord, FundingCall, Proposal } from "@/lib/types";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

type DemoPayload = Record<string, string | string[]>;

export type NewFundingCallInput = {
  title: string;
  organization: string;
  fundingObjectives: string;
  eligibilityRequirements: string;
  evaluationCriteria: string;
  maxFundingAmount: string;
  submissionDeadline: string;
  strategicPriorities: string;
};

export type NewProposalInput = {
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
};

export type ConsensusAssessmentReadResult =
  | { status: "available"; record: ConsensusRecord }
  | { status: "missing" }
  | { status: "unavailable"; message: string };

function fakeHash(seed: string) {
  const normalized = seed.padEnd(64, "0").slice(0, 64);
  return `0x${normalized}`;
}

export function formatWalletAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function isLiveModeConfigured() {
  return Boolean(getGrantoraRuntimeConfig().contractAddress);
}

export async function connectInjectedWallet() {
  if (!window.ethereum) {
    throw new Error("No injected wallet found. Install MetaMask or a compatible wallet.");
  }

  const accounts = (await window.ethereum.request({
    method: "eth_requestAccounts",
  })) as string[];

  if (!accounts[0]) {
    throw new Error("No wallet account returned by the provider.");
  }

  return accounts[0];
}

// ---------------------------------------------------------------------------
// Demo mode (no contract configured, or no wallet connected)
// ---------------------------------------------------------------------------

async function demoTransaction(kind: string, payload: DemoPayload) {
  await new Promise((resolve) => setTimeout(resolve, 900));
  const hash = fakeHash(`${kind}${JSON.stringify(payload).length.toString(16)}`);
  return {
    hash,
    message: `Prepared ${kind} transaction using the Grantora contract payload shape.`,
  };
}

export async function submitFundingCallDemo(payload: DemoPayload) {
  return demoTransaction("create_funding_call", payload);
}

export async function submitProposalDemo(payload: DemoPayload) {
  return demoTransaction("submit_proposal", payload);
}

export async function requestReviewDemo(proposalId: string) {
  return demoTransaction("request_review", { proposalId });
}

// ---------------------------------------------------------------------------
// Live mode: reads
// ---------------------------------------------------------------------------

function requireContractAddress(): `0x${string}` {
  const config = getGrantoraRuntimeConfig();
  if (!config.contractAddress) {
    throw new Error("Configure NEXT_PUBLIC_GRANTORA_CONTRACT_ADDRESS to use live mode.");
  }
  return config.contractAddress as `0x${string}`;
}

export async function readFundingCalls(): Promise<Record<string, FundingCall>> {
  const address = requireContractAddress();
  const client = createGrantoraReadClient();
  const raw = (await client.readContract({
    address,
    functionName: "get_funding_calls",
    args: [],
  })) as Record<string, Parameters<typeof toFundingCall>[0]>;

  const result: Record<string, FundingCall> = {};
  for (const [id, record] of Object.entries(raw ?? {})) {
    result[id] = toFundingCall(record);
  }
  return result;
}

export async function readProposals(): Promise<Record<string, Proposal>> {
  const address = requireContractAddress();
  const client = createGrantoraReadClient();
  const raw = (await client.readContract({
    address,
    functionName: "get_proposals",
    args: [],
  })) as Record<string, Parameters<typeof toProposal>[0]>;

  const result: Record<string, Proposal> = {};
  for (const [id, record] of Object.entries(raw ?? {})) {
    result[id] = toProposal(record);
  }
  return result;
}

export async function readProposal(proposalId: string): Promise<Proposal> {
  const address = requireContractAddress();
  const client = createGrantoraReadClient();
  const raw = await client.readContract({
    address,
    functionName: "get_proposal",
    args: [proposalId],
  });
  return toProposal(raw as Parameters<typeof toProposal>[0]);
}

function extractReadErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "Live assessment data is unavailable.";
}

function isMissingConsensusAssessment(error: unknown): boolean {
  return /no consensus assessment found/i.test(extractReadErrorMessage(error));
}

function isConsensusReadyStatus(status: string | undefined): boolean {
  return status?.toUpperCase() === "CONSENSUS_READY";
}

export async function readConsensusAssessment(proposalId: string): Promise<ConsensusAssessmentReadResult> {
  try {
    const address = requireContractAddress();
    const client = createGrantoraReadClient();
    const raw = await client.readContract({
      address,
      functionName: "get_consensus_assessment",
      args: [proposalId],
    });
    return { status: "available", record: toConsensusRecord(raw as Parameters<typeof toConsensusRecord>[0]) };
  } catch (error) {
    if (isMissingConsensusAssessment(error)) {
      return { status: "missing" };
    }

    try {
      const proposal = await readProposal(proposalId);
      if (!isConsensusReadyStatus(proposal.status)) {
        return { status: "missing" };
      }
    } catch {
      // Keep the original assessment-read failure below. A failed proposal fallback
      // means live data is unavailable, not that the assessment is absent.
    }

    return { status: "unavailable", message: extractReadErrorMessage(error) };
  }
}

// ---------------------------------------------------------------------------
// Live mode: writes
// ---------------------------------------------------------------------------

async function writeAndConfirm(
  account: `0x${string}`,
  functionName: string,
  args: CalldataEncodable[],
) {
  if (!window.ethereum) {
    throw new Error("No injected wallet provider is available.");
  }

  const address = requireContractAddress();
  const client = createGrantoraWriteClient(account, window.ethereum);

  const txHash = await client.writeContract({
    address,
    functionName,
    args,
    value: BigInt(0),
  });

  const receipt = await client.waitForTransactionReceipt({
    hash: txHash,
    status: TransactionStatus.ACCEPTED,
    interval: 4000,
    retries: 60,
  });

  return { hash: txHash, receipt };
}

export async function writeCreateFundingCall(account: `0x${string}`, input: NewFundingCallInput) {
  return writeAndConfirm(account, "create_funding_call", [
    input.title,
    input.organization,
    input.fundingObjectives,
    input.eligibilityRequirements,
    input.evaluationCriteria,
    input.maxFundingAmount,
    input.submissionDeadline,
    input.strategicPriorities,
  ]);
}

export async function writeSubmitProposal(account: `0x${string}`, input: NewProposalInput) {
  return writeAndConfirm(account, "submit_proposal", [
    input.fundingCallId,
    input.title,
    input.principalInvestigator,
    input.researchSummary,
    input.problemStatement,
    input.objectives,
    input.methodology,
    input.budgetSummary,
    input.impactStatement,
    JSON.stringify(input.evidenceUrls),
  ]);
}

export async function requestLiveConsensusReview(address: `0x${string}`, proposalId: string) {
  return writeAndConfirm(address, "request_review", [proposalId]);
}

export async function readContractSchema() {
  const config = getGrantoraRuntimeConfig();
  if (!config.contractAddress) {
    return null;
  }

  const client = createGrantoraReadClient();
  return client.getContractSchema(config.contractAddress as `0x${string}`);
}
