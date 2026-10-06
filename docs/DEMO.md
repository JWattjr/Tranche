# Two-minute Tranche demo

**0:00–0:20 — Open the grant ledger.** No wallet is needed. Explain: “Tranche releases grant allocations only when independently fetched public evidence satisfies frozen milestone criteria.” Point to the real grant budget, released amount and held balance. The label says whether this is recorded execution proof or a fresh finalized chain read.

**0:20–0:50 — Inspect the first clause.** Open the formatting-fix milestone. Read its frozen criterion and the verbatim passage from Prettier's real 3.6.2 release. Follow the public artifact and pinned commit links. Open the judgment receipt. Explain that code chooses the fixed allocation; validators judge only whether this criterion is met. Its native transfer has a separate credit receipt in the full execution ledger.

**0:50–1:10 — Compare the holds.** Expand the native-PDF-export milestone. Its artifact exists, but the notes do not announce that feature: `NOT_MET`. Expand the missing-release milestone: the reference cannot be verified, so `INSUFFICIENT_EVIDENCE`. Both allocations remain held. Neither a model error nor unavailable evidence can release money.

**1:10–1:35 — Write an agreement.** Select Create grant. Show the recipient, budget, allocation/deadline fields and allowlisted artifact types. Change an allocation to demonstrate the exact-sum check. Explain that each criterion is validated before funding; vague clauses are rejected with individual reasons. The criteria and their hash cannot be edited after proposal.

**1:35–1:50 — Show the browser retry.** Open the browser verification record in the downloaded proof and its public grant `grant-e33fff42-4404-4fd7`. It retains the insufficient-evidence claim, the single resubmission and the full expired-grant refund. Explain that only the recipient signs a claim and each narrow judgment has a separate transaction. Accepted remains appealable; finalized callbacks and a separately credited native transfer authorize settlement. The actual reload and appeal-state captures are retained in `.impeccable/review`.

**1:50–2:00 — Show settled browser proof.** Open the completed browser payout grant `grant-96c9c646-5b12-407c`: MET, 0.0005 simulated GEN released, zero held. Open Execution proof and its separate native credit receipt. End on `npm run verify:proof` and the README's source/limitations links. The refunded browser grant demonstrates permissionless expiry; on-time pending judgments have a one-hour grace period.

Live signatures and adjudication take longer than two minutes. Use the recorded finalized case during a short demo; do not pretend a new wallet grant completes instantly. StudioNet GEN is simulated.
