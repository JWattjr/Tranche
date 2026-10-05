# Tranche verification

This record separates live StudioNet execution, deterministic tests and browser observations. StudioNet GEN is simulated. The project is not marked submission-ready while the browser wallet-signing/reload pass remains unverified.

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

The production browser test was prepared with a 0.001 GEN budget, but its wallet connection request was declined. The browser safety policy prohibits accessing `chrome-extension:` wallet approval pages, so the owner must handle connection/signature approval directly. Browser funding, recipient claims, payout tracking and refund signing are therefore **not verified end to end**. The live CLI execution proves the contract flow and does not substitute for those remaining browser checks. No test wallet or fake receipt was injected.

## Recheck

Run `npm run verify:proof` with public RPC access. It is read-only, spaces requests below the published per-minute limit, checks finalized execution and descendants, reads the three verdicts and frozen hash, and compares deployed source with the retained source hash. It also checks the live expiry/resubmission grant once its refund is recorded. Do not replace an RPC error or divergent outcome with a mocked success.
