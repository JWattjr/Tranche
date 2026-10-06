# Tranche verification

This record separates live StudioNet execution, deterministic tests and browser observations. StudioNet GEN is simulated. Browser proposal, specification acceptance, funding, recipient claims, held resubmission, payout and expiry refund have finalized against the deployed contract. The complete 73-receipt recheck passed, and the project is marked submission-ready for the owner.

## Live network evidence

The deployed escrow is [0xC592951bd17f7c36CC196E4AE36E45df412dbA2a](https://explorer-studio.genlayer.com/address/0xC592951bd17f7c36CC196E4AE36E45df412dbA2a), on chain 61999. The runner is pinned in the first source line. Release calls are prepared by genlayer-py 0.18.0 and signed by the existing unlocked CLI account; signing keys are never exported or checked in.

The grant `prettier-release-grant` has a 0.003 GEN budget and three fixed 0.001 GEN allocations. Each specification check, funding call, claim, judgment and self callback finalized successfully. Finalized state reads returned:

| Milestone | Observed result | Judgment transaction |
|---|---|---|
| Prettier 3.6.2 missing-blank-line fix | MET; 0.001 GEN released | [0x86ffcad8…](https://explorer-studio.genlayer.com/transactions/0x86ffcad82c630107428c0b51f49bf973879cb945d8ae81833e8f855d2a40199e) |
| Same release announcing native PDF export | NOT_MET; 0.001 GEN held | [0x5aeeeedf…](https://explorer-studio.genlayer.com/transactions/0x5aeeeedf05cbdaa67cf4e764d329d4cdfcb68a88e186e0ebeae0d1b0215c323d) |
| Nonexistent Prettier release | INSUFFICIENT_EVIDENCE; 0.001 GEN held | [0x7e9f965c…](https://explorer-studio.genlayer.com/transactions/0x7e9f965c48c5d8bd06a1d5a43ee9944f737b63efcffda739f773f0ac0ba3295b) |

The separate [native transfer receipt](https://explorer-studio.genlayer.com/transactions/0xa86f2853a164dca36f132e0b017730147589b7994d3f6012769799b7caf4a92c) reports FINALIZED, `value_credited=true`, the exact contract sender, recipient wallet and 1,000,000,000,000,000 wei. A native credit can have no consensus receipt; the verifier checks the transfer fields instead of pretending it is an intelligent-contract execution.

The separate `expiry-and-resubmission` grant finalized two insufficient-evidence claims and retains the first claim's history. After its actual deadline, [refund 0x3d719e87…](https://explorer-studio.genlayer.com/transactions/0x3d719e87dd618f24f94cc1227ddb6dc77c79292de92fb1bf79ccc163f4a72280) finalized successfully. Its state is CLOSED, refunded 0.001 GEN, held zero. The native refund credit is retained separately in the proof manifest.

The access-probe contract finalized real validator fetches of GitHub API, raw.githubusercontent.com, registry.npmjs.org and archive.org CDX, each returning HTTP 200. Those receipts are retained in `deploy/receipts` and indexed in `deploy/proof.json`.

The first specification prompt falsely rejected the observable PDF-announcement criterion. Its rejected attempt is retained separately in `deploy/attempts/spec-rejected-proof.json`. The prompt was corrected, the contract redeployed, and the MET case rerun live on the new address. No recorded verdict was overridden. The initial failed payable call exposed a simulator limitation: a native balance may be credited despite execution rollback. Only successful finalization plus grant accounting authorizes funding in the app.

## Local checks

- Twelve direct-mode contract tests passed. They cover allocation mismatch, rejection, finalized-only settlement, all three outcomes, double release, missing evidence, fabricated quotation, prompt injection, independently rerun validator comparisons, source/SHA/timestamps, recipient/funder authorization, one resubmission and permissionless deadline refund with stale callbacks.
- Six TypeScript tests passed for exact bigint amounts, specification validation, evidence references, timestamp validation, receipt rollback handling and exact native-credit verification.
- GenVM linter passed: 13 public methods, 3 views and 10 writes. Its newer-runner warning is expected because the brief pins the verified runner.
- TypeScript strict typecheck, ESLint and a production Next.js build passed.
- Production dependency audit returned zero vulnerabilities.

## Browser observations

The actual Next.js app was checked in the Codex in-app browser at 1440×1000 and 390×844. The home page shows the three real outcomes, quotations, allocations, artifact links, frozen hash, transaction links and recorded-proof label. A manual live refresh switches to a timestamped finalized chain read. No horizontal page overflow was observed at either width.

Create form checks exercised exact allocation imbalance/balance, allowlist selection, adding/removing milestones and criteria, and required input validation. The claim/resubmission form fetched real GitHub evidence, displayed matching SHA, release `created_at` and notes, and identified the preview as non-authoritative. Public browsing and evidence previews require no wallet. Missing MetaMask produces an actionable message. The execution-proof page exposes actual receipt links and a proof download.

The in-app browser has no MetaMask extension. A further Chrome test submitted a real proposal [0x0c8b0c64…](https://explorer-studio.genlayer.com/transactions/0x0c8b0c6412b22029fe6e40133a8c9961e00bf76207168c51f6735eaafa0c7888) and criterion check [0x603d06f9…](https://explorer-studio.genlayer.com/transactions/0x603d06f9194be03ef89b1e5b56be81b88296c29d4bfc95017f86803747e89fab). It displayed the accepted/native-appeal state, resumed tracking the retained hashes after a reload, and completed as SPEC_ACCEPTED. This local browser grant remains unfunded.

The first production wallet connection request was declined. On 6 October, the owner connected the public account `0x1ee3b827907429e5df3db7282446b6e065ff6199`. A new production browser grant, `grant-e33fff42-4404-4fd7`, finalized its [proposal](https://explorer-studio.genlayer.com/transactions/0xb76ad09137bbe5ca0adfcd24fe0dc95cc49381985a54c2947a38e13249a3c8a8) and two criterion checks. The first criterion signature was declined, then the owner requested reopening it and signed successfully. The hosted page resumed the sequence after reload and read back SPEC_ACCEPTED at desktop and mobile widths. The frozen agreement splits 0.001 simulated GEN into two equal allocations, with a final deadline of 6 October 11:50 UTC.

The owner signed [funding](https://explorer-studio.genlayer.com/transactions/0x6db038efbf85303779e1ef4bf41a9296f613250fdcb9f17a96ea6ee78a4a6393), and the hosted page read OPEN with 0.001 simulated GEN held. The recipient's missing-release claim and judgment finalized as INSUFFICIENT_EVIDENCE. Its single resubmission and judgment also finalized as INSUFFICIENT_EVIDENCE, and the page displayed that the retry had been used. Actual receipts and callbacks are retained in the proof manifest.

The genuine-release claim arrived at 11:50:10 UTC, ten seconds after its immutable deadline, and [finalized with an execution error](https://explorer-studio.genlayer.com/transactions/0xd0d239053ee6efea9cd80a1d309df32be286e71d0cf2c0e3dd29228493526921). Its actual failed receipt is retained in `deploy/attempts/browser-expired-claim.json`; it is not counted as a successful execution. The browser correctly stopped the two-step sequence before judgment and enabled the expired-allocation refund. The owner signed [refund 0x52b56dfe…](https://explorer-studio.genlayer.com/transactions/0x52b56dfe544bcd1546da59e51e0f69f5070b004ea94563d62b2dabff58c64cc2). It finalized with an exact 0.001 simulated GEN native credit, and the hosted page read CLOSED, refunded 0.001, held zero. The refunded state was checked at desktop and mobile widths, with no horizontal overflow.

The owner approved a separate 0.0005 simulated GEN payout-verification agreement, `grant-96c9c646-5b12-407c`, with a one-week deadline. Its proposal and criterion check finalized, and the hosted page read SPEC_ACCEPTED. The owner then signed the separate exact-budget deposit; funding and its callback finalized, and the hosted page read OPEN with 0.0005 simulated GEN held. The genuine Prettier release preview matched its pinned SHA and release notes. After specific owner approval, the recipient [claim](https://explorer-studio.genlayer.com/transactions/0x95f9a27c77515daefae8076767ccfe6957fdb135c77d9d23713439dd94a37fd8) and [judgment](https://explorer-studio.genlayer.com/transactions/0x16c9eed197240f0a50c8fe3c7d4084d6f86943c1ae00979763248e65c9ec79a9) finalized as MET. The [native payout credit](https://explorer-studio.genlayer.com/transactions/0x4bd88d6507630d4397270d74162e6bc2c45422f329c1825debd010c51cd8013c) finalized with the exact escrow sender, recipient and 500,000,000,000,000 wei. All five browser operations and descendants are retained separately under `production-browser-payout-*`.

The owner completed signing in Chrome. On continuation, Chrome browser controls timed out; the final public hosted-page readback used the existing in-app proof browser. It displayed the finalized quoted passage, MET, released 0.0005 simulated GEN and held zero at 1440×1000 and 390×844, with no horizontal overflow. Desktop and mobile captures are retained in `.impeccable/review/browser-payout-complete-*.png`. The fully paid grant remains OPEN because this contract reserves CLOSED for expiry refunds. The expired agreement's history and full refund remain separately retained; the payout recovery is a different immutable agreement.

The wallet extension approval page is outside the browser controls, so the owner handled each signature directly. Live CLI execution and actual browser execution have separate retained records. No test wallet or fake receipt was injected. `scripts/record-browser-flow.ts` records only actual finalized browser hashes, checks their contract, sender, method and grant arguments, follows callbacks, and checks exact native credits.

## Recheck

On 6 October 2026, `npm run verify:proof` passed against the public StudioNet RPC: 46 finalized transactions, all three expected verdicts, frozen specification hash `301879cf6fc8c223268e9307945736a3ad3b9c63b78a4ec7aa9f63d343497cd8`, and deployed source SHA-256 `9044fabe3e856ecfb98d8ab4ec168153f56e30cec29df84d7112bc2e870a0f01`. The grant held 2,000,000,000,000,000 wei and released 1,000,000,000,000,000 wei. The verifier also confirmed the separate refund and browser proposal/specification records.

Typecheck and ESLint passed again on that date. Vercel completed a remote production build for deployment `dpl_DysXvDDxCgL23un2qsiYjJEmZtVv`, aliased to https://tranche-genlayer.vercel.app. The hosted ledger's finalized live read and layout were checked again at 1440×1000 and 390×844, with no horizontal overflow; captures are retained in `.impeccable/review/hosted-desktop.png` and `hosted-mobile.png`.

A subsequent remote production build, `dpl_GJi3iogtTo6axXB7uqGkoX3Cgpdk`, published the five new browser proposal/specification receipts to the same alias. The hosted execution-proof page was inspected and displayed all five links. Typecheck and ESLint also passed for the browser receipt collector and expanded verifier.

The expanded recheck initially stopped on a transient RPC response containing HTML instead of JSON. The verifier now retries failed RPC reads at most three times, with 15- and 30-second delays. Finalized execution errors, mismatched verdicts, source changes and incorrect native credits still fail verification; a failed read is never substituted with cached or mocked success.

The subsequent complete recheck passed for all **51 finalized transactions**, including the production browser proposal, both criterion checks and their callbacks. It reconfirmed the three original verdicts, frozen specification hash, exact deployed source hash, original payout/refund credits and the production browser agreement hash. This recheck preceded browser funding and the subsequent claims; it does not claim that the remaining browser settlement flow is complete.

The next complete recheck passed for all **63 successful finalized transactions**, including production browser funding, the held claim, single retry, both judgments and the full refund. It also independently checked that the late claim finalized with an execution error, confirmed the refunded browser grant's CLOSED state and retry history, and reconfirmed exact native credits and deployed source. Typecheck, ESLint and `git diff --check` passed after the receipt collector gained separate payout-flow capture and full-refund amount verification. This recheck preceded the payout recovery; `submissionReady` was still false at that stage.

Vercel remote production build `dpl_BK4LxmUNpTdykPEyjhgj5fzWu1W5` passed and published the 63-receipt manifest to the production alias. The hosted proof page was reloaded and inspected; all new funding, claim, retry, judgment and refund links were present. Its full-page capture is `.impeccable/review/hosted-proof-63-receipts.png`.

The final recheck on 6 October passed for all **73 successful finalized transactions**, plus the expected late-claim execution error. It reconfirmed the original three verdicts, fixed original payout, frozen agreement hashes, exact deployed source, the closed browser refund/retry record, and the fully paid browser recovery record with its exact native credit. One transient RPC service-unavailable response recovered through the bounded read retry; no error or state mismatch was replaced with cached success. `remainingBrowserChecks` is empty and `submissionReady` is true. The owner performs the final Portal submission.

Run `npm run verify:proof` with public RPC access. It is read-only, spaces requests below the published per-minute limit, checks finalized execution and descendants, reads the three verdicts and frozen hash, and compares deployed source with the retained source hash. It also checks the live expiry/resubmission grant once its refund is recorded. Do not replace an RPC error or divergent outcome with a mocked success.
