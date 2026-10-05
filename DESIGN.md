---
name: Tranche
description: A cold-paper escrow register tying fixed allocations to inspectable evidence.
colors:
  paper: "#f4f5f0"
  surface: "#fff"
  ink: "#223129"
  muted: "#5f6b63"
  line: "#d8ddd5"
  green: "#355645"
  green-wash: "#e8eee5"
  ochre: "#75551e"
  ochre-wash: "#f3ecd9"
  red: "#903c34"
  red-wash: "#f8eee9"
typography:
  display:
    fontFamily: "'Libre Baskerville', serif"
    fontSize: "clamp(34px, 3.5vw, 52px)"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "'Manrope', sans-serif"
    fontSize: "19px"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "-0.025em"
  body:
    fontFamily: "'Manrope', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.65
  evidence:
    fontFamily: "'Manrope', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.8
  operational:
    fontFamily: "'Manrope', sans-serif"
    fontSize: "12px"
    fontWeight: 400
  button:
    fontFamily: "'Manrope', sans-serif"
    fontSize: "12px"
    fontWeight: 600
  status:
    fontFamily: "'Manrope', sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.4
rounded:
  control: "3px"
  status: "2px"
spacing:
  compact: "8px"
  action-gap: "9px"
  field-horizontal: "13px"
  button-horizontal: "16px"
  clause-horizontal: "23px"
  section: "24px"
  workspace-horizontal: "36px"
  agreement-gap: "44px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.surface}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-text:
    textColor: "{colors.green}"
    typography: "{typography.button}"
    padding: "5px 0"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 13px"
  status-met:
    backgroundColor: "{colors.green-wash}"
    textColor: "{colors.green}"
    typography: "{typography.status}"
    rounded: "{rounded.status}"
    padding: "3px 8px"
  status-held:
    backgroundColor: "{colors.ochre-wash}"
    textColor: "{colors.ochre}"
    typography: "{typography.status}"
    rounded: "{rounded.status}"
    padding: "3px 8px"
  clause:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
---

# Design System: Tranche

## Overview

**Creative North Star: "The Escrow Instruction Register"**

Cold paper, charcoal ink and ruled agreements give Tranche the character of a working grant register. Libre Baskerville supplies the document title and clause numerals; Manrope carries the operational reading. Forest green marks authorization and released outcomes, while muted ochre distinguishes held allocations.

The interface earns trust through fixed amounts, dated state provenance, inspectable criteria, verbatim passages and transaction links. Its signature is an inline clause disclosure: evidence opens within the agreement instead of moving into an unrelated overlay. The implemented surface uses CSS and inline vector icons; no shipping raster assets are required.

**Key Characteristics:**

- Cold paper surrounding white, ruled agreements.
- Serif document titles with precise sans-serif working text.
- Fixed amounts, numbered clauses and local evidence disclosure.
- Explicit released, held and error states.
- Recorded proof distinguished from a fresh finalized-state read.

This is a scan of the implemented register, not an approved-comp reproduction. Sources: app/globals.css, app/page.tsx, components/grant-view.tsx, components/create-grant.tsx, components/session.tsx, components/shell.tsx and app/layout.tsx. The finish verdict clears the three scored corrections; its scope does not establish browser signing success.

## Colors

The palette is restrained and cool, with colored washes reserved for meaningful states. Frontmatter preserves the actual CSS custom-property values.

### Primary

- **Forest authorization** (`green`): primary actions, live-read links, released amounts and successful verdicts.
- **Authorization wash** (`green-wash`): secondary-button hover, remaining allocations and met verdict backgrounds.

### Secondary

- **Muted ochre** (`ochre`): held allocations and insufficient evidence.
- **Hold wash** (`ochre-wash`): held status and missing-evidence backgrounds.

### Tertiary

- **Rejection red** (`red`) and **rejection wash** (`red-wash`): visible request errors and rejected specifications.

### Neutral

- **Cold paper** (`paper`): page field.
- **Agreement white** (`surface`): agreement summary, clause and form panels.
- **Charcoal ink** (`ink`): primary reading and amounts.
- **Muted ink** (`muted`): supporting detail and final clause-number color.
- **Register rule** (`line`): panel strokes and section dividers.

**The Outcome Rule.** Pair every verdict color with its written outcome; color alone must not carry the settlement meaning.

## Typography

**Display Font:** Libre Baskerville, serif fallback. The app imports its regular weight locally.

**Body Font:** Manrope, sans-serif fallback. The app imports weights 400, 500, 600 and 700 locally.

**Label/Mono Font:** ui-monospace, SFMono-Regular, Consolas, monospace for agreement hashes, transaction identifiers and fetched-body previews.

Display is measured and documentary; working text is compact but readable. Body paragraphs have a maximum width of 72 characters. Amounts and allocation segments use tabular numerals.

The frontmatter records common roles. Main document titles use the display clamp; the home grant title becomes 36 px at the mobile breakpoint. Create-page titles use a separate clamp from 30 to 43 px and become 32 px on mobile. Section titles use 19 px; clause titles use 16 px after the mobile fix. Clause numerals use 21 px on desktop and 19 px on mobile.

Final overrides set statuses, deadlines, criterion labels, receipt text, reasons and artifact links to 12 px, with criterion text and quoted evidence at 14 px. Quotations use 1.8 line height and criteria 1.75. Mobile proof provenance, navigation, allocation labels and selected supporting metadata also use 12 px.

**The Evidence Reading Rule.** Preserve the final operational scale and allow metadata to wrap; do not shrink criteria or source passages to fit a row.

Some supporting desktop styles still use 9–11 px, including summary labels, provenance, sidebar details and receipt-page metadata. Form hints and preview URLs can remain 10 px. These are existing values, not a new target scale or evidence of a complete typography audit.

## Layout

The page and masthead use a centered maximum width of 1220 px. Desktop workspace padding is 35 px vertically at the top, 36 px horizontally and 80 px at the bottom. At 1350 px and above, top padding becomes 45 px.

The grant opens with a title and compact frozen-agreement seal. A full-width amounts panel contains total, released and held balances above a proportional allocation strip. The release/hold rule appears immediately below this panel and above state provenance on both desktop and mobile. The agreement body uses a flexible clause column and a 276 px terms column, separated by 44 px.

At 980 px and below, horizontal workspace padding becomes 25 px; the terms column becomes 235 px and the agreement gap 27 px. At 740 px and below, the workspace uses 20 px horizontal padding and the agreement becomes one column with a 23 px gap. Terms follow the clauses, but the essential settlement rule remains beside the amounts. The masthead wraps navigation onto its own row. Two-column form fields stack. Footer content stacks.

Mobile amount groups, clause headers, status rows, criterion metadata and receipt rows wrap. The seal stays a fixed 108 px wide. Allocation segments remain proportional and place their two labels vertically. Sidebar term pairs still form two columns. Long hashes, sources, quoted passages and transaction identifiers use wrapping where declared.

The reviewed complete desktop and mobile captures show the home composition and first expanded clause without lateral clipping. Those captures do not establish layout for every create, claim or transient operation state.

## Elevation & Depth

The system is flat. White panels sit on cold paper through one-pixel rules and tonal differences; no box-shadow vocabulary exists. Evidence quotations use a light gray-green inset field. Operation tracking uses an authorization wash with its own border. Do not reinterpret these ruled documents as floating cards.

**The Register Rule.** Use rules and tone to separate working regions; retain the flat document hierarchy.

## Shapes

Agreements, amount panels and form sections are rectangular without panel corner rounding. Inputs and buttons use a restrained control radius; status chips have a smaller radius. The network marker is a small circle. The frozen seal is a ruled rectangle, not an illustrated badge.

Focus is visible: buttons, links, controls and summaries receive a three-pixel muted-green outline with a four-pixel offset. Inputs also have a two-pixel focus outline with a one-pixel offset. Disabled buttons use 0.48 opacity and a disallowed cursor. These treatments describe source behavior; keyboard interaction has not been demonstrated in the review captures.

## Components

**Actions.** Primary buttons use forest authorization on white type; hover darkens to #294334. Secondary buttons use white with a gray-green stroke and authorization-wash hover. Both have a 43 px minimum height on desktop. Text actions use green type without a filled background, underlining on hover. Header buttons use a 39 px minimum height on mobile; other controls vary with their context.

**Fields.** White inputs, selects and textareas have a gray-green stroke, control radius and clear labels. Hover darkens the stroke. Field notes explain public-source expectations, recipient identity and simulated GEN. Create grant supports up to three milestones and five criteria per milestone, shows an allocation balance check, reports validation errors and validates the specification before escrow funding. Input text becomes 14 px on mobile.

**Navigation.** The wordmark, Grant ledger and Execution proof links occupy the masthead. The current route uses green bold text with a two-pixel underline. Connect wallet and Create grant sit at the right. On mobile, navigation wraps below the wordmark and actions.

**Status.** Met outcomes combine a check icon, authorization wash and “MET · Released.” Not-met and insufficient-evidence outcomes combine a lock icon, hold wash and written held status. Neutral/refunded outcomes use muted text and a neutral wash. Mobile chips have additional vertical padding and can wrap.

**Clause.** A two-digit serif number, title, UTC deadline and fixed allocation lead each ruled agreement. Status and finalized-criterion count follow. Native details/summary exposes evidence in place; the first clause starts open. The disclosure chevron rotates over 0.2 seconds using cubic-bezier(.16,1,.3,1). Reduced-motion preferences remove transitions and animations.

**Evidence.** Criterion/source labels precede the acceptance text, quoted source passage, judgment reason and public artifact links. The recorded demonstration includes a linked finalized judgment receipt. Missing passages receive an ochre message. Previous claim history is a separate disclosure. Evidence previews list the fetch targets and fetched body, explicitly identifying the preview as a convenience rather than the validator result.

**Claim.** Attach evidence and Resubmit evidence expose a local form when the grant, deadline and attempt conditions permit it. Editing references clears the prior preview. A preview must exist before signing; the named recipient wallet is required. The signing sequence claims the milestone and requests each criterion judgment. One resubmission is exposed for held milestones.

**Session and operations.** Wallet connection, signature readiness, submitted/pending state, finality errors and completion are visible through the operation region. Tracking persists in localStorage and resumes reads after reload; future signatures require an explicit action. An accepted transaction explains the native appeal window. Completion dispatches a grant refresh; the page distinguishes recorded proof from a subsequent live read. Errors use alert semantics and operation updates use a polite live region.

Browser signing remains unverified. The scored verdict did not audit the create route, expanded claim form, keyboard interaction, disclosure motion or live-state refresh. Source-supported interactions above are documentation of implementation, not proof that those paths succeeded in a browser.

## Do's and Don'ts

### Do:

- Do keep fixed amounts adjacent to their clauses and the release/hold rule adjacent to the summary.
- Do preserve written provenance when switching between recorded proof and fresh finalized-state reads.
- Do use the final 12 px operational and 14 px evidence scales with wrapping.
- Do use inline source passages and separate artifact and transaction links.
- Do retain ruled, flat document panels and visible focus treatments.

### Don't:

- Don't represent held money or submitted transactions as completed releases.
- Don't replace written verdicts with color-only indicators.
- Don't compress evidence into miniature text to keep rows on one line.
- Don't add decorative raster artwork or floating shadows to the existing register.
- Don't describe source-supported wallet behavior as browser-verified execution.

