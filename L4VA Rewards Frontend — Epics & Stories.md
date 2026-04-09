# L4VA Rewards Frontend — Epics & Stories

## Goal

Build the frontend for the L4VA rewards system on top of the current rewards APIs, focusing on:

* rewards overview
* epoch transparency
* vault-level reward breakdown
* claims and vesting UX
* wallet-based reward history

---

# Epic 1 — Rewards Overview Dashboard

## Objective

Give the user a single entry point where they can understand their current rewards state immediately after connecting a wallet.

## Business Value

This becomes the main rewards landing page and reduces confusion around claimable rewards, locked rewards, and current epoch progress.

## Stories

### Story 1.1 — Build rewards overview page shell

**Description**
Create the main `/rewards` page layout with loading, empty, error, and connected-wallet states.

**Acceptance Criteria**

* Page exists at `/rewards`
* Handles wallet not connected state
* Handles loading skeletons
* Handles API error state
* Handles empty state when user has no rewards data

### Story 1.2 — Show rewards summary cards

**Description**
Display top-level summary cards for the connected wallet.

**Acceptance Criteria**

* Show `Claimable Now`
* Show `Locked / Vested`
* Show `Current Epoch Estimate`
* Show `Total Earned`
* Show `Next Unlock`
* Show `Cap Applied` status if available

### Story 1.3 — Integrate current epoch endpoint

**Description**
Fetch and display current epoch information.

**Endpoints**

* `GET /api/rewards/epochs/current`

**Acceptance Criteria**

* Current epoch range is displayed
* Current epoch status is displayed
* If data is unavailable, UI falls back gracefully

### Story 1.4 — Integrate claim summary endpoints

**Description**
Fetch and display high-level claim summary for the wallet.

**Endpoints**

* `GET /api/rewards/claims`
* `GET /api/rewards/claims/history`

**Acceptance Criteria**

* Claimable amount is shown
* Claimed history preview is shown
* Zero-state is shown when no claims exist

### Story 1.5 — Integrate vesting summary endpoints

**Description**
Fetch and display vesting summary for the wallet.

**Endpoints**

* `GET /api/rewards/vesting`

**Acceptance Criteria**

* Locked amount is shown
* Next unlock info is shown if available
* Vesting summary renders without blocking the page

---

# Epic 2 — Epoch Explorer

## Objective

Allow users to inspect rewards epoch-by-epoch and understand how their weekly rewards were generated.

## Business Value

Improves transparency and trust in the reward system.

## Stories

### Story 2.1 — Build epochs list page

**Description**
Create `/rewards/epochs` with a table or list of all epochs.

**Endpoints**

* `GET /api/rewards/epochs`

**Acceptance Criteria**

* Page lists epochs in descending order
* Each row shows epoch date range
* Each row shows epoch status
* Each row has a details action

### Story 2.2 — Show wallet reward history per epoch

**Description**
Display user reward results per epoch.

**Endpoints**

* `GET /api/rewards/history/:walletAddress`
* `GET /api/rewards/score/:walletAddress`

**Acceptance Criteria**

* Each epoch row shows user reward amount if available
* User score is shown if available
* Immediate vs vested amounts are shown if available
* Capped state is shown when applicable

### Story 2.3 — Build epoch details page

**Description**
Create `/rewards/epochs/:id` detail page.

**Endpoints**

* `GET /api/rewards/epochs/:id`

**Acceptance Criteria**

* Shows epoch metadata
* Shows total emission if available
* Shows wallet-specific reward details if available
* Shows finalized vs current state clearly

### Story 2.4 — Add epoch status badges

**Description**
Implement reusable badge component for epoch states.

**Acceptance Criteria**

* Supports active / processing / finalized states
* Used consistently in overview and epoch pages

---

# Epic 3 — Vault Rewards Breakdown

## Objective

Show how a user earned rewards across vaults, including creator and participant roles.

## Business Value

This aligns the frontend with the vault-centric reward model and makes the system easier to audit from a user perspective.

## Stories

### Story 3.1 — Build wallet vaults page

**Description**
Create `/rewards/vaults` that lists all vaults tied to the wallet’s rewards.

**Endpoints**

* `GET /api/rewards/wallet/:walletAddress/vaults`

**Acceptance Criteria**

* Page lists all relevant vaults
* Each row shows vault id or display name
* Each row shows role: creator / participant / both if available
* Each row shows reward totals if available

### Story 3.2 — Build wallet-vault details page

**Description**
Create `/rewards/vaults/:vaultId` page showing the wallet’s detailed reward breakdown inside one vault.

**Endpoints**

* `GET /api/rewards/wallet/:walletAddress/vault/:vaultId`

**Acceptance Criteria**

* Shows vault-level user reward
* Shows creator reward if applicable
* Shows participant reward if applicable
* Shows immediate / vested split if available

### Story 3.3 — Show vault leaderboard or score context

**Description**
Display vault-level score data so the user can understand how they compare inside a vault.

**Endpoints**

* `GET /api/rewards/vault/:vaultId/scores`

**Acceptance Criteria**

* Vault score list is displayed if API returns it
* Current wallet is highlighted if present
* Empty state is handled gracefully

### Story 3.4 — Add reward source labels

**Description**
Create UI labels for reward source categories.

**Acceptance Criteria**

* Supports creator reward
* Supports participant reward
* Supports LP reward
* Supports governance reward
* Supports acquire / contribution / expansion source tags where available

---

# Epic 4 — Claims Experience

## Objective

Enable users to claim rewards safely and understand claim status and claim history.

## Business Value

The claim flow is one of the most important actions in the rewards product.

## Stories

### Story 4.1 — Build claims page

**Description**
Create `/rewards/claims` page.

**Endpoints**

* `GET /api/rewards/claims`
* `GET /api/rewards/claims/history`
* `GET /api/rewards/claims/transactions`

**Acceptance Criteria**

* Claimable amount is shown
* Historical claims are shown
* Claim transactions are shown if available
* Empty state is handled

### Story 4.2 — Implement claim CTA flow

**Description**
Add claim button and integrate claim request.

**Endpoints**

* `POST /api/rewards/claim`

**Acceptance Criteria**

* User can click claim
* Button has loading state
* Success toast or success state is shown
* Error toast or error state is shown
* Double-submit is prevented

### Story 4.3 — Refresh claim state after claim

**Description**
Invalidate and refetch claim-related queries after successful claim.

**Acceptance Criteria**

* Claimable amount refreshes after success
* Claim history refreshes after success
* Vesting or rewards summary refreshes if affected

### Story 4.4 — Add claim transaction status display

**Description**
Display pending, confirmed, and failed transaction states if backend supports them.

**Acceptance Criteria**

* Claim history distinguishes status clearly
* Failed state is visible
* Pending state is visible

---

# Epic 5 — Vesting Experience

## Objective

Make the vesting model easy to understand and inspect.

## Business Value

Users need confidence around what is available now versus what unlocks later.

## Stories

### Story 5.1 — Build vesting page

**Description**
Create `/rewards/vesting` page.

**Endpoints**

* `GET /api/rewards/vesting`
* `GET /api/rewards/vesting/active`

**Acceptance Criteria**

* Page shows total vested amount
* Page shows active vesting positions
* Page shows unlocked vs locked values if available

### Story 5.2 — Add vesting timeline / progress UI

**Description**
Represent vesting progress visually.

**Acceptance Criteria**

* Each vesting position has a progress representation
* Unlock date or remaining duration is shown
* Expired / completed vesting states are shown

### Story 5.3 — Group vesting positions by epoch or vault

**Description**
Improve readability of vesting data.

**Acceptance Criteria**

* Positions can be grouped by epoch, vault, or source if enough data exists
* Group headers are readable and collapsible if necessary

---

# Epic 6 — Shared Rewards Data Layer

## Objective

Create a clean frontend module for all rewards API communication.

## Business Value

Keeps the implementation maintainable and easy to extend.

## Stories

### Story 6.1 — Create rewards API client module

**Description**
Add typed API helpers for rewards endpoints.

**Acceptance Criteria**

* All rewards endpoints are wrapped in a dedicated module
* Endpoint functions are reusable
* Request params and response types are centralized

### Story 6.2 — Create React Query hooks for rewards

**Description**
Build hooks for overview, epochs, vaults, claims, and vesting.

**Acceptance Criteria**

* Hooks exist for main pages
* Query keys are stable and reusable
* Hooks support wallet-based params

### Story 6.3 — Normalize DTOs for UI consumption

**Description**
Map backend responses into frontend-friendly view models.

**Acceptance Criteria**

* Formatting logic is not duplicated across components
* Missing optional fields are handled safely
* Numeric conversions are centralized

### Story 6.4 — Add polling or refresh strategy where needed

**Description**
Support refreshing for current epoch and claims state.

**Acceptance Criteria**

* Current epoch data can refresh periodically if needed
* Claim state can refresh after actions
* Polling is configurable and not excessive

---

# Epic 7 — UX, Formatting, and Trust Layer

## Objective

Make the rewards UI understandable, auditable, and user-friendly.

## Business Value

Reward systems fail if users cannot understand the numbers.

## Stories

### Story 7.1 — Add number and token formatting utilities

**Description**
Create shared formatters for L4VA amounts, dates, percentages, and statuses.

**Acceptance Criteria**

* Amounts are formatted consistently
* Dates are formatted consistently
* Large numbers are readable

### Story 7.2 — Add explanation tooltips / helper text

**Description**
Explain terms like claimable, vested, current epoch estimate, cap applied, creator reward.

**Acceptance Criteria**

* Key rewards terms have helper text
* Tooltips are concise and reusable

### Story 7.3 — Add badges and visual states

**Description**
Implement consistent visuals for status and role labels.

**Acceptance Criteria**

* Supports statuses like active, finalized, pending, claimed, failed
* Supports roles like creator, participant, both
* Supports state labels like estimated vs final

### Story 7.4 — Add wallet disconnected UX

**Description**
Provide a smooth disconnected state for all rewards pages.

**Acceptance Criteria**

* Users see connect-wallet prompt on protected rewards pages
* No page crashes without wallet address

---

# Epic 8 — Optional Charts & Analytics

## Objective

Add visual analytics to make reward trends easier to understand.

## Business Value

Improves engagement and helps users track performance.

## Stories

### Story 8.1 — Rewards by epoch chart

**Description**
Show earned rewards across epochs.

### Story 8.2 — Claimable vs vested chart

**Description**
Show current unlocked vs locked state visually.

### Story 8.3 — Rewards by vault chart

**Description**
Show which vaults contribute the most to total rewards.

---

# Suggested MVP Scope

## MVP Epics

* Epic 1 — Rewards Overview Dashboard
* Epic 2 — Epoch Explorer
* Epic 4 — Claims Experience
* Epic 5 — Vesting Experience
* Epic 6 — Shared Rewards Data Layer
* Epic 7 — UX, Formatting, and Trust Layer

## Phase 2

* Epic 3 — Vault Rewards Breakdown
* Epic 8 — Optional Charts & Analytics

---

# Updated Implementation Direction

## Context

We already copied the prototype rewards UI into the main codebase from the design/test branch.

This means the goal is **not** to recreate the UI from scratch.
The goal now is to:

* keep the useful visual shell and component structure
* adapt the UI to the real backend model
* place rewards inside the **user profile page as a tab**
* freely rename, reshape, or replace sections so they match production rewards behavior

## What should be reused from the copied UI

These parts can be kept and refactored instead of rebuilt from zero:

* overall visual style
* summary card section
* weekly / timeline-like section
* analytics card layout
* alignment / bonus block layout
* info modal shell
* buttons, status chips, section containers
* loading skeleton patterns if present

## What should NOT be treated as final

These parts are prototype-only and should be changed freely:

* mock data hook
* random values
* fake claim logic
* hardcoded APR / dates / totals
* wording that implies staking-only rewards
* any UI sections that do not map well to real endpoints

## Product / UX direction

The rewards UI now lives inside the **user profile page** as a dedicated tab.

Recommended tab name:

* `Rewards`

The tab should feel like a proper account/rewards center, not a promo landing page.

That means the UI should prioritize:

* what the wallet can claim now
* what is still vested / locked
* what was earned by epoch
* what vaults generated rewards
* what alignment bonus is active
* what claim / vesting history exists

---

# Updated Epics & Stories

## Epic 1 — Profile Rewards Tab Foundation

### Objective

Integrate the copied rewards UI into the user profile page as a dedicated tab and connect it to the real app structure.

### Stories

#### Story 1.1 — Add Rewards tab to profile page

**Description**
Add a new `Rewards` tab to the user profile page navigation.

**Acceptance Criteria**

* Rewards is accessible as a profile tab
* Tab routing matches existing profile tab patterns
* Active tab styling matches the rest of the profile page

#### Story 1.2 — Mount existing rewards UI inside profile tab

**Description**
Reuse the copied prototype UI as the starting shell inside the profile tab.

**Acceptance Criteria**

* Existing layout renders inside the profile tab container
* No duplicate standalone rewards page is required unless later needed
* Layout respects profile page spacing and responsiveness

#### Story 1.3 — Remove prototype-only assumptions from shell

**Description**
Refactor the copied UI so it no longer assumes mock data, fake claim behavior, or fixed rewards logic.

**Acceptance Criteria**

* No component depends on generated demo data
* No fake timeout-based claim flow remains
* No hardcoded reward totals remain in production components

---

## Epic 2 — Shared Rewards Data Layer

### Objective

Create a proper frontend data layer for rewards, replacing all prototype logic.

### Stories

#### Story 2.1 — Create rewards API client module

**Acceptance Criteria**

* All rewards endpoints are wrapped in a dedicated module
* Request and response typing is centralized
* Wallet-based params are handled consistently

#### Story 2.2 — Create React Query hooks for rewards tab

**Acceptance Criteria**

* Hooks exist for overview, epochs, vaults, claims, and vesting
* Query keys are stable and reusable
* Refetch strategy is defined for current/active data

#### Story 2.3 — Add response mappers / view models

**Acceptance Criteria**

* Backend DTOs are transformed into UI-friendly view models
* Formatting and fallback logic is centralized
* Optional or missing backend fields are handled safely

---

## Epic 3 — Rewards Overview in Profile Tab

### Objective

Turn the current top section of the copied UI into a real wallet rewards summary.

### Stories

#### Story 3.1 — Replace top summary cards with backend-driven metrics

**Description**
Refactor the current summary cards so they match actual rewards data instead of prototype metrics.

**Recommended cards**

* Claimable Now
* Locked / Vested
* Current Epoch Estimate or Current Epoch Status
* Total Earned
* Next Unlock
* Alignment Bonus

**Acceptance Criteria**

* Cards use real API data
* Card titles match product terminology
* Missing data is handled gracefully

#### Story 3.2 — Integrate current epoch state

**Endpoints**

* `GET /api/rewards/epochs/current`

**Acceptance Criteria**

* Current epoch range/status is shown
* Current epoch state is clearly marked as estimated or active if needed

#### Story 3.3 — Integrate claims + vesting summary

**Endpoints**

* `GET /api/rewards/claims`
* `GET /api/rewards/vesting`

**Acceptance Criteria**

* Claimable amount is shown
* Locked / vested amount is shown
* Next unlock is shown if backend supports it

---

## Epic 4 — Replace Prototype Weekly Progress With Real Epoch History

### Objective

Reuse the visual weekly progress area, but convert it into a real epoch-based rewards history component.

### Stories

#### Story 4.1 — Convert weekly cards into epoch cards

**Description**
The current weekly carousel/timeline can stay visually similar, but it should represent real epochs from backend data.

**Endpoints**

* `GET /api/rewards/epochs`
* `GET /api/rewards/history/:walletAddress`

**Acceptance Criteria**

* Each card represents a real epoch
* Card shows date range
* Card shows status: finalized / processing / active
* Card shows reward amount if available
* Card shows claimable / claimed / locked state if available

#### Story 4.2 — Connect claim action to real claim flow

**Endpoints**

* `POST /api/rewards/claim`

**Acceptance Criteria**

* Claim button uses real backend action
* Loading, success, and error states are shown
* Query invalidation happens after success
* Double-submit is prevented

#### Story 4.3 — Support epoch detail expansion or navigation

**Description**
Users should be able to inspect an epoch beyond the card summary.

**Endpoints**

* `GET /api/rewards/epochs/:id`

**Acceptance Criteria**

* Epoch detail view exists as modal, drawer, or nested page
* User can see more context for one epoch

---

## Epic 5 — Analytics / Breakdown Refactor

### Objective

Keep the analytics area from the prototype, but change it so it reflects real reward sources.

### Stories

#### Story 5.1 — Replace generic activity chart with real reward source breakdown

**Description**
The current chart can stay visually similar, but the categories should come from real reward sources.

**Recommended categories**

* Asset Contribution
* Token Acquire
* Expansion
* LP
* Governance
* Creator Reward
* Participant Reward

**Acceptance Criteria**

* Chart labels match real backend concepts
* Values are not random
* Empty state is shown if no breakdown data exists

#### Story 5.2 — Add tooltip / legend explanations

**Acceptance Criteria**

* Users can understand what each segment means
* Colors and labels are consistent with app design system

---

## Epic 6 — Alignment Bonus Section

### Objective

Reuse the alignment block from the prototype where relevant, but align it to actual rewards mechanics.

### Stories

#### Story 6.1 — Keep alignment tracker only if backend/product supports it

**Description**
The UI block can stay, but it must reflect actual alignment bonus rules and available data.

**Acceptance Criteria**

* Requirements shown in UI match real mechanics
* Bonus percentages are not hardcoded incorrectly
* Hidden or disabled gracefully if data is unavailable

#### Story 6.2 — Rewrite alignment copy

**Acceptance Criteria**

* Copy reflects L4VA / VLRM / ORACLE rules accurately
* No misleading staking APR terminology remains if not backed by real product logic

---

## Epic 7 — Vault Rewards Breakdown

### Objective

Add the part the prototype is missing most: vault-based reward visibility.

### Stories

#### Story 7.1 — Add wallet vault rewards list

**Endpoints**

* `GET /api/rewards/wallet/:walletAddress/vaults`

**Acceptance Criteria**

* User can see which vaults generated rewards
* Each vault row shows role if available: creator / participant / both
* Each vault row shows reward totals if available

#### Story 7.2 — Add wallet-vault detail view

**Endpoints**

* `GET /api/rewards/wallet/:walletAddress/vault/:vaultId`

**Acceptance Criteria**

* User can inspect reward details inside one vault
* Immediate / vested split is shown if available
* Creator vs participant reward is shown if available

#### Story 7.3 — Show vault score context if helpful

**Endpoints**

* `GET /api/rewards/vault/:vaultId/scores`

**Acceptance Criteria**

* Score context is displayed only if useful and understandable
* Current wallet is highlighted where relevant

---

## Epic 8 — Claims & Vesting Detail Sections

### Objective

Add the detailed history sections that make the profile rewards tab audit-friendly.

### Stories

#### Story 8.1 — Add claims history section

**Endpoints**

* `GET /api/rewards/claims/history`
* `GET /api/rewards/claims/transactions`

**Acceptance Criteria**

* User can view past claims
* Transaction state is visible when available
* Empty state is supported

#### Story 8.2 — Add active vesting positions section

**Endpoints**

* `GET /api/rewards/vesting/active`

**Acceptance Criteria**

* User can see active vesting rows/cards
* Locked, unlocked, and remaining values are shown if available
* Vesting progress is understandable

---

## Epic 9 — Copy, States, and Trust Layer

### Objective

Ensure the copied UI is rewritten into a production-ready rewards experience.

### Stories

#### Story 9.1 — Rewrite product terminology

**Description**
Update all labels and helper text so they match the real rewards backend and mechanics.

**Acceptance Criteria**

* No misleading prototype text remains
* Epoch, claimable, vested, creator reward, participant reward, and alignment bonus terms are used correctly

#### Story 9.2 — Add loading / empty / disconnected / error states

**Acceptance Criteria**

* All rewards blocks handle no-wallet state
* All rewards blocks handle loading state
* All rewards blocks handle empty data gracefully
* All rewards blocks handle API failures gracefully

#### Story 9.3 — Add consistent badges and formatters

**Acceptance Criteria**

* Status badges are reusable
* Token/date/percent formatting is centralized
* Estimated vs finalized states are visually distinct

---

# Updated Recommended UI Direction

Use the copied prototype as a **visual base**, but feel free to reshape sections to match the backend.

A good profile tab structure would be:

1. **Top Summary Cards**

   * Claimable Now
   * Locked / Vested
   * Total Earned
   * Next Unlock
   * Alignment Bonus

2. **Epoch Rewards Section**

   * horizontal cards, table, or timeline
   * current + previous epochs
   * claim action where relevant

3. **Reward Breakdown / Analytics**

   * reward source chart
   * helper modal or tooltip

4. **Vault Rewards**

   * per-vault reward list
   * creator / participant split

5. **Claims History**

6. **Active Vesting Positions**

This should feel like a profile/account tab, not a separate marketing dashboard.

---

# Updated Copilot-Friendly Dev Prompt

```md
We already copied the prototype L4VA rewards UI from the test/design branch into the main codebase.

Now refactor it into a production-ready rewards module inside the **user profile page as a Rewards tab**.

Important rules:
- reuse the existing UI shell and component structure where useful
- replace all mock/demo data with real backend integration
- feel free to change labels, cards, sections, and layout so they match the actual backend and product behavior
- treat the copied branch only as a visual starting point, not as the source of truth for logic

Implementation goals:
- mount rewards inside the profile page tab system
- create a shared rewards API client module
- use React Query for all rewards data fetching
- support wallet-based fetching
- add proper loading, error, empty, and disconnected states
- use real claim flow instead of fake claim actions
- convert the current weekly progress area into a real epoch-based rewards section
- keep or adapt analytics and alignment UI only if they match backend data
- add vault-based rewards visibility because backend is vault-centric
- add claims history and active vesting sections

Preferred UI structure inside the tab:
1. summary cards
2. epoch rewards section
3. analytics / reward breakdown
4. vault rewards list
5. claims history
6. active vesting positions

Relevant backend areas include:
- current epoch
- epochs list/details
- wallet score/history
- wallet vaults/details
- vault scores
- claims summary/history/transactions
- claim action
- vesting summary/active positions

Please refactor incrementally:
1. integrate the tab into profile
2. build shared rewards API layer
3. connect overview cards
4. replace weekly mock section with epoch data
5. connect claim flow
6. add vault / claims / vesting sections
```

---

# Updated Suggested File Structure

```txt
src/modules/profile/tabs/rewards/
  api/
    rewards.api.ts
    rewards.types.ts
    rewards.mappers.ts
  hooks/
    useRewardsOverview.ts
    useRewardEpochs.ts
    useRewardClaims.ts
    useRewardVesting.ts
    useRewardVaults.ts
  components/
    RewardsTab.tsx
    RewardSummaryCards.tsx
    RewardsEpochSection.tsx
    RewardsAnalyticsSection.tsx
    RewardsAlignmentSection.tsx
    RewardsVaultsSection.tsx
    RewardsClaimsSection.tsx
    RewardsVestingSection.tsx
    RewardStatusBadge.tsx
    RewardRoleBadge.tsx
    RewardsInfoModal.tsx
```
