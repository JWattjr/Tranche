# Two-minute Tranche demo

**0:00–0:20 — Open the grant ledger.** No wallet is needed. Explain: “Tranche releases grant allocations only when independently fetched public evidence satisfies frozen milestone criteria.” Point to the real grant budget, released amount and held balance. The label says whether this is recorded execution proof or a fresh finalized chain read.

**0:20–0:50 — Inspect the first clause.** Open the formatting-fix milestone. Read its frozen criterion and the verbatim passage from Prettier's real 3.6.2 release. Follow the public artifact and pinned commit links. Open the judgment receipt. Explain that code chooses the fixed allocation; validators judge only whether this criterion is met. Its native transfer has a separate credit receipt in the full execution ledger.

**0:50–1:10 — Compare the holds.** Expand the native-PDF-export milestone. Its artifact exists, but the notes do not announce that feature: `NOT_MET`. Expand the missing-release milestone: the reference cannot be verified, so `INSUFFICIENT_EVIDENCE`. Both allocations remain held. Neither a model error nor unavailable evidence can release money.

**1:10–1:35 — Write an agreement.** Select Create grant. Show the recipient, budget, allocation/deadline fields and allowlisted artifact types. Change an allocation to demonstrate the exact-sum check. Explain that each criterion is validated before funding; vague clauses are rejected with individual reasons. The criteria and their hash cannot be edited after proposal.

**1:35–1:50 — Explain claims and finality.** On a held milestone, choose Resubmit evidence and preview the validator fetch. Only the recipient signs a claim. Narrow judgments have separate transactions. Submitted, pending and accepted are visible process states; accepted does not mean paid. Native appeals occur before finalized callbacks. A reload retains the submitted hash and resumes tracking.

**1:50–2:00 — Show proof and expiry.** Open Execution proof and download proof.json. Explain the single resubmission limit and permissionless refund after the final deadline. Mention the one-hour grace for an on-time pending judgment. End on `npm run verify:proof` and the README's source/limitations links.

Live signatures and adjudication take longer than two minutes. Use the recorded finalized case during a short demo; do not pretend a new wallet grant completes instantly. StudioNet GEN is simulated.
