# Grantora

Grantora is a decentralized grant review and impact consensus protocol. It replaces the traditional single-reviewer grant evaluation process, where one program officer or a small panel scores a proposal, with an AI-validator consensus process that is transparent, auditable, evidence-grounded, and resistant to individual bias.

Funders publish funding calls with explicit objectives, eligibility rules, evaluation criteria, and strategic priorities. Applicants submit proposals with their research summary, methodology, budget, and public evidence such as GitHub repos, publications, or project pages. Once submitted, an authorized wallet can trigger a GenLayer validator review that returns a structured assessment: scores, funding recommendation, strengths, risks, follow-up questions, verified claims, unsupported claims, contradictions, and evidence quality.

GenLayer is what makes this possible because Intelligent Contracts can use LLM-backed validator consensus over non-deterministic, subjective outputs: something a normal EVM smart contract cannot do with deterministic execution alone.

The repo has two parts:

- A **Next.js frontend** for creating funding calls, submitting proposals, triggering reviews, and browsing proposal records.
- A **GenLayer Intelligent Contract** (`contracts/grantora_protocol.py`) that stores funding calls/proposals/audit trails and runs the evidence-grounded consensus review.

## How it works

1. A funder creates a **funding call**: objectives, eligibility, evaluation criteria, budget, deadline, and strategic priorities.
2. An applicant **submits a proposal** against that call, including public evidence URLs such as GitHub repos, publications, or project pages.
3. Anyone with permission can **trigger a review**. The contract fetches each evidence URL inside a non-deterministic block and asks GenLayer validators to reach consensus on a structured assessment (`gl.eq_principle.prompt_non_comparative`).
4. The review checks scientific merit, novelty, societal impact, feasibility, budget credibility, funding-call alignment, confidence, evidence quality, verified claims, unsupported claims, and contradictions.
5. The review method returns the evidence-grounded consensus assessment without performing forbidden storage writes after the non-deterministic consensus call.

Every write goes through the connected wallet directly to the deployed contract; every read comes from the contract's public getters. There is no backend database.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS v4
- `genlayer-js@1.1.8` for reads/writes against the GenLayer JSON-RPC endpoint
- Injected wallet connection (MetaMask or any EIP-1193 provider)
- GenLayer Intelligent Contract (Python) deployed to GenLayer StudioNet

## Project structure

```text
contracts/grantora_protocol.py   GenLayer Intelligent Contract source
deploy/deployScript.ts           Deployment helper for the contract
src/app/                         Pages: dashboard, funding calls, proposals, consensus, settings
src/components/                  UI, wallet connector, workflow forms/cards
src/lib/genlayer/                Contract client, read/write calls, mappers, live-data hook
src/lib/wallet-context.tsx       App-wide wallet connection state
src/lib/mock-data.ts             Empty by default; only used if the contract is not configured
```

## Run locally

```bash
npm install
npm run dev
```

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

## Configure

Copy `.env.example` to `.env.local` and set:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_GENLAYER_NETWORK` | `studionet` |
| `NEXT_PUBLIC_GENLAYER_RPC_URL` | `https://studio.genlayer.com/api` |
| `NEXT_PUBLIC_GRANTORA_CONTRACT_ADDRESS` | `0x2F880A3D01944E6c876668df953C84468500E8D6` |

If `NEXT_PUBLIC_GRANTORA_CONTRACT_ADDRESS` is unset, the app falls back to bundled demo data (empty by default) instead of failing.

## Deploy the contract

The contract source is `contracts/grantora_protocol.py`. Deploy it to GenLayer StudioNet either by:

- Pasting it into the Contracts panel in [GenLayer Studio](https://studio.genlayer.com), or
- Using `deploy/deployScript.ts` with the GenLayer CLI/SDK deployment flow.

After deploying, copy the resulting contract address into `NEXT_PUBLIC_GRANTORA_CONTRACT_ADDRESS` in `.env.local` and restart the dev server.

### Contract interface

| Method | Purpose |
|---|---|
| `create_funding_call(...)` | Publish a new funding call |
| `get_funding_calls()` | List all funding calls |
| `submit_proposal(...)` | Submit a proposal against a funding call |
| `get_proposals()` / `get_proposal(id)` | List / fetch proposals |
| `get_proposals_for_funding_call(id)` | Proposals under a specific call |
| `get_proposals_for_owner(address)` | Proposals submitted by a given address |
| `request_review(proposal_id)` | Trigger and return the AI consensus review |
| `get_consensus_assessment(proposal_id)` | Fetch a stored assessment if one was recorded by a compatible deployment flow |
| `get_audit_trail(proposal_id)` | Full audit log for a proposal |
| `pause()` / `unpause()` / `transfer_ownership(address)` | Owner-only contract administration |

## Security notes

- Evidence URLs are fetched inside the non-deterministic consensus block only, via `gl.nondet.web.get`, never outside it.
- Fetched evidence content is sanitized for prompt-injection markers before it is included in the consensus prompt.
- AI-produced scores are normalized to bounded integers and clamped by deterministic thresholds before a funding recommendation is returned.
- The consensus review output includes verified claims, unsupported claims, contradictions, evidence URLs used, and an evidence quality score.
- The contract avoids storage writes after the non-deterministic consensus call.
