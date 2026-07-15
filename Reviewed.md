# Grantora Review Summary

Reviewed and verified on 15 July 2026 against the deployed contract at `0xa30353d31b69e4ab23F82C37601F56bd670cfCc2`.

## Contract changes

- `request_review` still fetches submitted public evidence with `gl.nondet.web.get` inside the GenLayer consensus block.
- The consensus-agreed assessment is normalized and persisted in `assessments` after consensus returns.
- The proposal is advanced to `CONSENSUS_READY`.
- A `CONSENSUS_REVIEW_RECORDED` audit event is appended for every successful review.
- `get_consensus_assessment` and `get_audit_trail` expose the persisted result and event history.

## Frontend changes

- Live contract reads are never replaced with demo records when the configured contract is empty or unavailable.
- The UI distinguishes live contract data from demo mode.
- Review success messaging reflects persistence of the assessment, proposal status, and audit event.
- The new contract address is documented in the runtime example, README, and Settings UI.

## End-to-end verification

Two independent wallet lifecycles were executed against the deployed contract:

- `call-2` → `prop-2`: `CONSENSUS_READY`, `RECOMMENDED_WITH_CONDITIONS`, confidence `45`.
- `call-3` → `prop-3`: `CONSENSUS_READY`, `RECOMMENDED_FOR_FULL_REVIEW`, confidence `63`.

Both assessments were read back from `get_consensus_assessment`. Both audit trails contained `PROPOSAL_SUBMITTED` and `CONSENSUS_REVIEW_RECORDED`. The final contract summary reported three funding calls, three proposals, nine audit events, and `paused: false`.

The deployed schema includes all expected funding-call, proposal, consensus-assessment, audit, ownership, pause, and review methods. No ABI method is missing.

Local verification also passed with `npm.cmd run lint` and `npm.cmd run build`.

## Security note

Local QA artifacts containing private keys were intentionally excluded from the repository. Test keys should be rotated after use.
