# v0.2.19
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

import json
import typing


class GrantoraProtocol(gl.Contract):
    """
    GrantoraProtocol

    A GenLayer-native decentralized grant review and impact consensus
    contract.

    Product purpose:
    Grantora lets funding programs publish funding calls and lets applicants
    register proposals against them using only public evidence links (no file
    uploads). GenLayer validators run a consensus review over each proposal
    against its funding call and return an authoritative, explainable
    recommendation with scores, strengths, risks, and follow-up questions.

    What belongs on-chain:
    - funding call registry
    - proposal registry (summaries and public evidence links only)
    - GenLayer consensus review verdicts and scores
    - immutable audit trail

    What should stay off-chain:
    - full proposal documents, private applicant data, uploaded files.
      Only public URLs and structured summaries are stored here.
    """

    owner: str
    paused: bool

    funding_call_counter: u256
    proposal_counter: u256
    audit_counter: u256

    funding_calls: TreeMap[str, str]

    proposals: TreeMap[str, str]
    funding_call_proposal_index: TreeMap[str, str]
    owner_proposal_index: TreeMap[str, str]

    assessments: TreeMap[str, str]

    audit_logs: TreeMap[str, str]
    proposal_audit_index: TreeMap[str, str]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address.as_hex
        self.paused = False

        self.funding_call_counter = u256(0)
        self.proposal_counter = u256(0)
        self.audit_counter = u256(0)

        self.funding_calls = TreeMap()

        self.proposals = TreeMap()
        self.funding_call_proposal_index = TreeMap()
        self.owner_proposal_index = TreeMap()

        self.assessments = TreeMap()

        self.audit_logs = TreeMap()
        self.proposal_audit_index = TreeMap()

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _sender(self) -> str:
        return gl.message.sender_address.as_hex.lower()

    def _json(self, value: typing.Any) -> str:
        return json.dumps(value, sort_keys=True)

    def _load(self, raw: str) -> typing.Any:
        if raw is None or raw == "":
            return {}
        return json.loads(raw)

    def _require_owner(self) -> None:
        if self._sender() != self.owner.lower():
            raise gl.vm.UserError("Only contract owner")

    def _require_not_paused(self) -> None:
        if self.paused:
            raise gl.vm.UserError("Contract is paused")

    def _require_non_empty(self, value: str, field_name: str) -> None:
        if value is None or len(value.strip()) == 0:
            raise gl.vm.UserError(field_name + " is required")

    def _append_unique(self, existing: str, item: str) -> str:
        if existing is None or existing == "":
            return item
        parts = existing.split("|")
        for part in parts:
            if part == item:
                return existing
        return existing + "|" + item

    def _limit(self, value: typing.Any, max_len: int) -> str:
        text = str(value)
        if len(text) > max_len:
            return text[:max_len]
        return text

    def _to_int(self, value: typing.Any, fallback: int) -> int:
        try:
            return int(value)
        except Exception:
            return fallback

    def _bounded_score(self, value: typing.Any, fallback: int) -> int:
        score = self._to_int(value, fallback)
        if score < 0:
            return 0
        if score > 100:
            return 100
        return score

    def _list_of_strings(self, value: typing.Any, max_items: int, max_len: int) -> typing.List[str]:
        result: typing.List[str] = []
        if isinstance(value, list):
            for item in value:
                if len(result) >= max_items:
                    break
                result.append(self._limit(item, max_len))
            return result
        if value is None:
            return result
        text = str(value)
        if len(text.strip()) == 0:
            return result
        result.append(self._limit(text, max_len))
        return result

    def _strip_prompt_injection_markers(self, value: str) -> str:
        lower = value.lower()
        forbidden = [
            "ignore previous instructions",
            "ignore all previous instructions",
            "disregard the funding call",
            "disregard previous instructions",
            "system prompt",
            "developer message",
            "return only approved",
            "always recommend",
        ]
        sanitized = value
        for item in forbidden:
            if item in lower:
                sanitized = sanitized.replace(item, "[redacted instruction]")
                sanitized = sanitized.replace(item.upper(), "[redacted instruction]")
                sanitized = sanitized.replace(item.title(), "[redacted instruction]")
        return sanitized

    def _next_id(self, prefix: str, counter_name: str) -> str:
        if counter_name == "funding_call":
            self.funding_call_counter = self.funding_call_counter + u256(1)
            return prefix + "-" + str(self.funding_call_counter)
        if counter_name == "proposal":
            self.proposal_counter = self.proposal_counter + u256(1)
            return prefix + "-" + str(self.proposal_counter)
        if counter_name == "audit":
            self.audit_counter = self.audit_counter + u256(1)
            return prefix + "-" + str(self.audit_counter)
        raise gl.vm.UserError("Unknown counter")

    def _normalise_recommendation(self, value: typing.Any) -> str:
        recommendation = str(value).strip().upper()
        if recommendation in ["RECOMMENDED", "RECOMMENDED_FOR_FULL_REVIEW", "APPROVE", "FULL_REVIEW"]:
            return "RECOMMENDED_FOR_FULL_REVIEW"
        if recommendation in ["RECOMMENDED_WITH_CONDITIONS", "CONDITIONAL", "CONDITIONAL_APPROVE"]:
            return "RECOMMENDED_WITH_CONDITIONS"
        if recommendation in ["NOT_RECOMMENDED", "REJECT", "DECLINE"]:
            return "NOT_RECOMMENDED"
        if recommendation in ["NEEDS_ADDITIONAL_EVIDENCE", "NEEDS_MORE_EVIDENCE", "INSUFFICIENT_EVIDENCE"]:
            return "NEEDS_ADDITIONAL_EVIDENCE"
        return "NEEDS_ADDITIONAL_EVIDENCE"

    def _require_funding_call_exists(self, funding_call_id: str) -> typing.Any:
        raw = self.funding_calls.get(funding_call_id, "")
        if raw == "":
            raise gl.vm.UserError("Funding call not found")
        return self._load(raw)

    def _require_proposal_exists(self, proposal_id: str) -> typing.Any:
        raw = self.proposals.get(proposal_id, "")
        if raw == "":
            raise gl.vm.UserError("Proposal not found")
        return self._load(raw)

    def _is_funding_call_creator(self, funding_call: typing.Any, wallet: str) -> bool:
        return funding_call.get("creator", "").lower() == wallet.lower()

    def _is_proposal_owner(self, proposal: typing.Any, wallet: str) -> bool:
        return proposal.get("owner_address", "").lower() == wallet.lower()

    def _assert_no_predecided_verdict(self, text: str) -> None:
        lower = text.lower()
        forbidden = [
            '"funding_recommendation"',
            "'funding_recommendation'",
            "funding_recommendation:",
            '"recommended_for_full_review"',
            '"not_recommended"',
            '"scientific_merit_score"',
            "'scientific_merit_score'",
            "scientific_merit_score:",
            '"confidence_score"',
            "'confidence_score'",
            "confidence_score:",
            'ignore previous instructions',
            'ignore all previous instructions',
            'disregard the funding call',
        ]
        for item in forbidden:
            if item in lower:
                raise gl.vm.UserError("Input contains pre-decided review language: " + item)

    def _record_audit(
        self,
        proposal_id: str,
        event_type: str,
        actor: str,
        summary: str,
        data_ref: str,
    ) -> str:
        audit_id = self._next_id("AUDIT", "audit")
        entry = {
            "audit_id": audit_id,
            "proposal_id": proposal_id,
            "event_type": event_type,
            "actor": actor.lower(),
            "summary": self._limit(summary, 600),
            "data_ref": data_ref,
        }
        self.audit_logs[audit_id] = self._json(entry)
        if proposal_id != "":
            self.proposal_audit_index[proposal_id] = self._append_unique(
                self.proposal_audit_index.get(proposal_id, ""),
                audit_id,
            )
        return audit_id

    def _normalise_ai_review(self, raw: typing.Any) -> typing.Any:
        if isinstance(raw, str):
            parsed = json.loads(raw)
        else:
            parsed = raw

        recommendation = self._normalise_recommendation(parsed.get("funding_recommendation", "NEEDS_ADDITIONAL_EVIDENCE"))

        return {
            "funding_recommendation": recommendation,
            "scientific_merit_score": self._bounded_score(parsed.get("scientific_merit_score", 0), 0),
            "novelty_score": self._bounded_score(parsed.get("novelty_score", 0), 0),
            "societal_impact_score": self._bounded_score(parsed.get("societal_impact_score", 0), 0),
            "feasibility_score": self._bounded_score(parsed.get("feasibility_score", 0), 0),
            "budget_credibility_score": self._bounded_score(parsed.get("budget_credibility_score", 0), 0),
            "funding_call_alignment_score": self._bounded_score(parsed.get("funding_call_alignment_score", 0), 0),
            "confidence_score": self._bounded_score(parsed.get("confidence_score", 50), 50),
            "key_strengths": self._list_of_strings(parsed.get("key_strengths", []), 6, 320),
            "key_risks": self._list_of_strings(parsed.get("key_risks", []), 6, 320),
            "follow_up_questions": self._list_of_strings(parsed.get("follow_up_questions", []), 6, 320),
            "verified_claims": self._list_of_strings(parsed.get("verified_claims", []), 6, 320),
            "unsupported_claims": self._list_of_strings(parsed.get("unsupported_claims", []), 6, 320),
            "contradictions": self._list_of_strings(parsed.get("contradictions", []), 6, 320),
            "evidence_urls_used": self._list_of_strings(parsed.get("evidence_urls_used", []), 10, 400),
            "evidence_quality_score": self._bounded_score(parsed.get("evidence_quality_score", 0), 0),
            "recommendation_summary": self._limit(parsed.get("recommendation_summary", ""), 1200),
        }

    def _apply_recommendation_thresholds(self, review: typing.Any) -> typing.Any:
        recommendation = review["funding_recommendation"]

        min_scores = [
            review["scientific_merit_score"],
            review["feasibility_score"],
            review["funding_call_alignment_score"],
        ]
        lowest_core_score = min(min_scores)

        if recommendation == "RECOMMENDED_FOR_FULL_REVIEW" and lowest_core_score < 55:
            recommendation = "NEEDS_ADDITIONAL_EVIDENCE"

        if recommendation == "RECOMMENDED_FOR_FULL_REVIEW" and review["confidence_score"] < 60:
            recommendation = "RECOMMENDED_WITH_CONDITIONS"

        if lowest_core_score < 30:
            recommendation = "NOT_RECOMMENDED"

        review["funding_recommendation"] = recommendation
        return review

    def _run_consensus_review(self, funding_call: typing.Any, proposal: typing.Any, evidence_urls: typing.List[str]) -> typing.Any:
        funding_call_json = self._json(
            {
                "title": funding_call.get("title", ""),
                "organization": funding_call.get("organization", ""),
                "funding_objectives": funding_call.get("funding_objectives", ""),
                "eligibility_requirements": funding_call.get("eligibility_requirements", ""),
                "evaluation_criteria": funding_call.get("evaluation_criteria", ""),
                "max_funding_amount": funding_call.get("max_funding_amount", ""),
                "strategic_priorities": funding_call.get("strategic_priorities", ""),
            }
        )
        proposal_json = self._json(
            {
                "title": proposal.get("title", ""),
                "principal_investigator": proposal.get("principal_investigator", ""),
                "research_summary": proposal.get("research_summary", ""),
                "problem_statement": proposal.get("problem_statement", ""),
                "objectives": proposal.get("objectives", ""),
                "methodology": proposal.get("methodology", ""),
                "budget_summary": proposal.get("budget_summary", ""),
                "impact_statement": proposal.get("impact_statement", ""),
            }
        )

        def build_context() -> str:
            # gl.nondet.web.get is only callable from within a non-deterministic
            # block passed to gl.eq_principle_*, so evidence must be fetched
            # here rather than before this function is invoked.
            evidence_payload = []
            for url in evidence_urls:
                try:
                    response = gl.nondet.web.get(url)
                    content = response.body.decode("utf-8", errors="ignore")[:14000]
                    content = self._strip_prompt_injection_markers(content)
                except Exception as fetch_error:
                    content = "Could not fetch this URL: " + str(fetch_error)
                evidence_payload.append(
                    {
                        "url": url,
                        "content": content,
                    }
                )
            evidence_json = self._json(evidence_payload)
            return (
                f"FUNDING CALL: {funding_call_json}\n"
                f"PROPOSAL: {proposal_json}\n"
                f"PUBLIC EVIDENCE: {evidence_json}"
            )

        consensus_json = gl.eq_principle.prompt_non_comparative(
            build_context,
            task=(
                "You are an expert grant reviewer for Grantora, a decentralized research and impact "
                "funding intelligence protocol. Evaluate the proposal in the input against the funding "
                "call it targets and the public evidence provided. Return ONLY valid JSON - no markdown, "
                "no explanation outside the JSON.\n\n"
                "Return exactly this structure:\n"
                '{"funding_recommendation":"RECOMMENDED_FOR_FULL_REVIEW",'
                '"scientific_merit_score":80,"novelty_score":75,"societal_impact_score":80,'
                '"feasibility_score":75,"budget_credibility_score":75,'
                '"funding_call_alignment_score":80,"confidence_score":75,'
                '"key_strengths":["...","...","..."],"key_risks":["...","..."],'
                '"follow_up_questions":["...","..."],"verified_claims":["..."],'
                '"unsupported_claims":["..."],"contradictions":["..."],'
                '"evidence_urls_used":["https://..."],"evidence_quality_score":75,'
                '"recommendation_summary":"One or two sentences."}\n\n'
                "funding_recommendation options: RECOMMENDED_FOR_FULL_REVIEW, RECOMMENDED_WITH_CONDITIONS, "
                "NOT_RECOMMENDED, NEEDS_ADDITIONAL_EVIDENCE\n"
                "All scores are integers 0-100."
            ),
            criteria=(
                "The funding_recommendation must be exactly one of: RECOMMENDED_FOR_FULL_REVIEW, "
                "RECOMMENDED_WITH_CONDITIONS, NOT_RECOMMENDED, NEEDS_ADDITIONAL_EVIDENCE.\n"
                "RECOMMENDED_FOR_FULL_REVIEW is only reasonable if the proposal is well aligned with the "
                "funding call's objectives and evaluation criteria and the public evidence plausibly "
                "supports the claims made.\n"
                "NOT_RECOMMENDED is only reasonable if the proposal is clearly misaligned with the funding "
                "call or the evidence contradicts the proposal's claims.\n"
                "The review must identify which claims are supported by fetched public evidence, which "
                "claims are unsupported, and whether any fetched evidence contradicts the proposal.\n"
                "The recommendation must be a reasonable assessment given the funding call and proposal "
                "content provided, not an arbitrary guess.\n"
                "The response must be valid JSON matching the requested structure."
            ),
        )

        review = self._normalise_ai_review(consensus_json)
        return self._apply_recommendation_thresholds(review)

    # ------------------------------------------------------------------
    # Owner and contract status
    # ------------------------------------------------------------------

    @gl.public.view
    def get_owner(self) -> str:
        return self.owner

    @gl.public.view
    def is_paused(self) -> bool:
        return self.paused

    @gl.public.view
    def get_contract_summary(self) -> str:
        return self._json(
            {
                "owner": self.owner,
                "paused": self.paused,
                "funding_call_counter": str(self.funding_call_counter),
                "proposal_counter": str(self.proposal_counter),
                "audit_counter": str(self.audit_counter),
            }
        )

    @gl.public.write
    def transfer_ownership(self, new_owner: str) -> None:
        self._require_owner()
        self._require_non_empty(new_owner, "new_owner")
        self.owner = new_owner

    @gl.public.write
    def pause(self) -> None:
        self._require_owner()
        self.paused = True

    @gl.public.write
    def unpause(self) -> None:
        self._require_owner()
        self.paused = False

    # ------------------------------------------------------------------
    # Funding calls
    # ------------------------------------------------------------------

    @gl.public.write
    def create_funding_call(
        self,
        title: str,
        organization: str,
        funding_objectives: str,
        eligibility_requirements: str,
        evaluation_criteria: str,
        max_funding_amount: str,
        submission_deadline: str,
        strategic_priorities: str,
    ) -> str:
        self._require_not_paused()
        self._require_non_empty(title, "title")
        self._require_non_empty(organization, "organization")
        self._require_non_empty(funding_objectives, "funding_objectives")
        self._require_non_empty(evaluation_criteria, "evaluation_criteria")

        funding_call_id = self._next_id("call", "funding_call")

        record = {
            "id": funding_call_id,
            "title": self._limit(title, 220),
            "organization": self._limit(organization, 220),
            "funding_objectives": self._limit(funding_objectives, 1600),
            "eligibility_requirements": self._limit(eligibility_requirements, 1600),
            "evaluation_criteria": self._limit(evaluation_criteria, 1200),
            "max_funding_amount": self._limit(max_funding_amount, 120),
            "submission_deadline": self._limit(submission_deadline, 40),
            "strategic_priorities": self._limit(strategic_priorities, 800),
            "creator": self._sender(),
            "status": "OPEN",
        }

        self.funding_calls[funding_call_id] = self._json(record)

        self._record_audit(
            "",
            "FUNDING_CALL_CREATED",
            self._sender(),
            "Funding call created: " + record["title"],
            funding_call_id,
        )

        return funding_call_id

    @gl.public.write
    def set_funding_call_status(self, funding_call_id: str, status: str) -> None:
        self._require_not_paused()
        record = self._require_funding_call_exists(funding_call_id)

        if not self._is_funding_call_creator(record, self._sender()) and self._sender() != self.owner.lower():
            raise gl.vm.UserError("Only the funding call creator or contract owner can update status")

        final_status = status.strip().upper()
        if final_status not in ["OPEN", "CLOSED", "ARCHIVED"]:
            raise gl.vm.UserError("Invalid funding call status")

        record["status"] = final_status
        self.funding_calls[funding_call_id] = self._json(record)

        self._record_audit(
            "",
            "FUNDING_CALL_STATUS_UPDATED",
            self._sender(),
            "Funding call " + funding_call_id + " status set to " + final_status,
            funding_call_id,
        )

    @gl.public.view
    def get_funding_calls(self) -> dict:
        result = {}
        for funding_call_id in self.funding_calls.keys():
            result[funding_call_id] = self._load(self.funding_calls[funding_call_id])
        return result

    @gl.public.view
    def get_funding_call(self, funding_call_id: str) -> dict:
        return self._require_funding_call_exists(funding_call_id)

    # ------------------------------------------------------------------
    # Proposals
    # ------------------------------------------------------------------

    @gl.public.write
    def submit_proposal(
        self,
        funding_call_id: str,
        title: str,
        principal_investigator: str,
        research_summary: str,
        problem_statement: str,
        objectives: str,
        methodology: str,
        budget_summary: str,
        impact_statement: str,
        evidence_urls_json: str,
    ) -> str:
        self._require_not_paused()
        self._require_non_empty(title, "title")
        self._require_non_empty(research_summary, "research_summary")
        self._require_non_empty(objectives, "objectives")

        funding_call = self._require_funding_call_exists(funding_call_id)
        if funding_call.get("status", "") != "OPEN":
            raise gl.vm.UserError("Funding call is not open for submissions")

        self._assert_no_predecided_verdict(
            title
            + " "
            + research_summary
            + " "
            + problem_statement
            + " "
            + objectives
            + " "
            + methodology
            + " "
            + budget_summary
            + " "
            + impact_statement
        )

        try:
            evidence_urls = json.loads(evidence_urls_json)
        except Exception:
            raise gl.vm.UserError("evidence_urls_json must be a JSON array of strings")

        if not isinstance(evidence_urls, list):
            raise gl.vm.UserError("evidence_urls_json must be a JSON array of strings")

        proposal_id = self._next_id("prop", "proposal")

        record = {
            "id": proposal_id,
            "funding_call_id": funding_call_id,
            "title": self._limit(title, 220),
            "principal_investigator": self._limit(principal_investigator, 180),
            "research_summary": self._limit(research_summary, 1800),
            "problem_statement": self._limit(problem_statement, 1600),
            "objectives": self._limit(objectives, 1200),
            "methodology": self._limit(methodology, 1600),
            "budget_summary": self._limit(budget_summary, 800),
            "impact_statement": self._limit(impact_statement, 1200),
            "evidence_urls": self._list_of_strings(evidence_urls, 10, 400),
            "owner_address": self._sender(),
            "status": "SUBMITTED",
        }

        self.proposals[proposal_id] = self._json(record)
        self.funding_call_proposal_index[funding_call_id] = self._append_unique(
            self.funding_call_proposal_index.get(funding_call_id, ""),
            proposal_id,
        )
        self.owner_proposal_index[self._sender()] = self._append_unique(
            self.owner_proposal_index.get(self._sender(), ""),
            proposal_id,
        )

        self._record_audit(
            proposal_id,
            "PROPOSAL_SUBMITTED",
            self._sender(),
            "Proposal submitted: " + record["title"],
            funding_call_id,
        )

        return proposal_id

    @gl.public.write
    def request_review(self, proposal_id: str) -> str:
        self._require_not_paused()

        proposal = self._require_proposal_exists(proposal_id)

        if not self._is_proposal_owner(proposal, self._sender()) and self._sender() != self.owner.lower():
            raise gl.vm.UserError("Only the proposal owner or contract owner can request review")

        if proposal.get("status", "") == "CONSENSUS_READY":
            raise gl.vm.UserError("Proposal already has a consensus assessment")

        funding_call = self._require_funding_call_exists(proposal.get("funding_call_id", ""))

        review = self._run_consensus_review(funding_call, proposal, proposal.get("evidence_urls", []))

        # `review` is the consensus-agreed result returned from the nondeterministic
        # block above. All state changes happen here, in deterministic contract
        # execution, so every validator persists the same canonical assessment.
        assessment = {
            "proposal_id": proposal_id,
            "funding_recommendation": review["funding_recommendation"],
            "scientific_merit_score": review["scientific_merit_score"],
            "novelty_score": review["novelty_score"],
            "societal_impact_score": review["societal_impact_score"],
            "feasibility_score": review["feasibility_score"],
            "budget_credibility_score": review["budget_credibility_score"],
            "funding_call_alignment_score": review["funding_call_alignment_score"],
            "confidence_score": review["confidence_score"],
            "key_strengths": review["key_strengths"],
            "key_risks": review["key_risks"],
            "follow_up_questions": review["follow_up_questions"],
            "verified_claims": review["verified_claims"],
            "unsupported_claims": review["unsupported_claims"],
            "contradictions": review["contradictions"],
            "evidence_urls_used": review["evidence_urls_used"],
            "evidence_quality_score": review["evidence_quality_score"],
            "recommendation_summary": review["recommendation_summary"],
        }

        self.assessments[proposal_id] = self._json(assessment)
        proposal["status"] = "CONSENSUS_READY"
        self.proposals[proposal_id] = self._json(proposal)
        self._record_audit(
            proposal_id,
            "CONSENSUS_REVIEW_RECORDED",
            self._sender(),
            "Consensus review recorded: " + assessment["funding_recommendation"],
            proposal_id,
        )

        return self._json(assessment)

    @gl.public.view
    def get_proposals(self) -> dict:
        result = {}
        for proposal_id in self.proposals.keys():
            result[proposal_id] = self._load(self.proposals[proposal_id])
        return result

    @gl.public.view
    def get_proposal(self, proposal_id: str) -> dict:
        return self._require_proposal_exists(proposal_id)

    @gl.public.view
    def get_proposals_for_funding_call(self, funding_call_id: str) -> dict:
        result = {}
        proposal_ids_csv = self.funding_call_proposal_index.get(funding_call_id, "")
        if proposal_ids_csv == "":
            return result
        for proposal_id in proposal_ids_csv.split("|"):
            raw = self.proposals.get(proposal_id, "")
            if raw != "":
                result[proposal_id] = self._load(raw)
        return result

    @gl.public.view
    def get_proposals_for_owner(self, owner_address: str) -> dict:
        result = {}
        proposal_ids_csv = self.owner_proposal_index.get(owner_address.lower(), "")
        if proposal_ids_csv == "":
            return result
        for proposal_id in proposal_ids_csv.split("|"):
            raw = self.proposals.get(proposal_id, "")
            if raw != "":
                result[proposal_id] = self._load(raw)
        return result

    @gl.public.view
    def get_consensus_assessment(self, proposal_id: str) -> dict:
        raw = self.assessments.get(proposal_id, "")
        if raw == "":
            raise gl.vm.UserError("No consensus assessment found for this proposal")
        return self._load(raw)

    @gl.public.view
    def get_audit_trail(self, proposal_id: str) -> typing.List[dict]:
        audit_ids_csv = self.proposal_audit_index.get(proposal_id, "")
        if audit_ids_csv == "":
            return []
        entries = []
        for audit_id in audit_ids_csv.split("|"):
            raw = self.audit_logs.get(audit_id, "")
            if raw != "":
                entries.append(self._load(raw))
        return entries
