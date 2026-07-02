# Grantora

Grantora is a Next.js frontend plus a GenLayer Intelligent Contract for decentralized grant review and impact consensus.

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
