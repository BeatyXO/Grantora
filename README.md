# Grantora

What Grantora is
Grantora is a decentralized grant review and impact consensus protocol. It replaces the traditional single-reviewer grant evaluation process — where one program officer or a small panel scores a proposal, often inconsistently and without a public record — with an on-chain, AI-validator consensus process that is transparent, auditable, and resistant to individual bias or backroom decision-making.

Funders publish funding calls with explicit objectives, eligibility rules, evaluation criteria, and strategic priorities. Applicants submit proposals with their research summary, methodology, budget, and public evidence (GitHub repos, publications, project pages). Once submitted, anyone can trigger a review, and the review isn't done by a person — it's done by GenLayer's decentralized validator network reaching consensus on a structured, criteria-based assessment. The outcome — scores, funding recommendation, strengths, risks, follow-up questions — is written on-chain, permanently and publicly readable.

How it uses GenLayer
GenLayer is what makes this possible, because it's a blockchain where smart contracts (Intelligent Contracts) can call out to LLMs and reach Byzantine-fault-tolerant consensus on non-deterministic, subjective outputs — something a normal EVM smart contract can't do, since normal contracts can only execute deterministic code.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- shadcn-style UI primitives
- `genlayer-js@1.1.8`
- GenLayer Intelligent Contract in `contracts/grantora_protocol.py`

## Run

```bash
npm install
npm run dev
```

## Configure

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_GENLAYER_NETWORK`
- `NEXT_PUBLIC_GENLAYER_RPC_URL`
- `NEXT_PUBLIC_GRANTORA_CONTRACT_ADDRESS`

## Deploy the contract

The GenLayer contract source is in `contracts/grantora_protocol.py`.

The deployment helper is in `deploy/deployScript.ts`.

For GenLayer Studio, paste the contract into the Contracts panel or use the GenLayer CLI deployment flow against StudioNet.
