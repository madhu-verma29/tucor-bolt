# Buyer Profile Production Readiness

## Scope reviewed

- Buyer Account: company, KYC, payment methods, contacts, preferences
- Business Profile: company, verification, bank accounts, contacts, settings
- Verification and Documents pages
- Buyer Settings: account, notifications, password, payment summary
- Authentication/session handling used by Buyer profile APIs
- Flyway schema, JPA entities, authorization, validation, and document storage

## Fixed on `buyer-profile-production-hardening`

| Area | Gap found | Branch change |
|---|---|---|
| Preferences | Buyer Account preferences existed only in React state | Added `buyer_procurement_preferences`, expanded notification preferences, and connected the existing controls to `/api/buyer/settings/preferences` |
| Registration documents | A public caller could replace documents by supplying a known email address | Registration upload now requires the access token returned for that newly registered account and derives the owner from the JWT subject |
| Pending-account access | Registration returned an operational JWT before email verification | JWT authentication now checks the current database user, email verification, disabled status, and role; the pending token is accepted only for registration-document upload |
| Disabled sessions | Suspended/rejected users could continue using an existing access token | Every authenticated request checks current account status |
| Password change | Buyer password changes left refresh sessions active and allowed password reuse | Buyer password change rejects reuse and revokes active refresh tokens |
| Document contract | UI-required `POLLUTION_CONTROL`, `ISO`, and `TRADE_LICENSE` documents were rejected | API document types now match all Buyer UI document types |
| Document status | Rejection reason, expiration, and verification timestamp were not returned | Buyer document DTO now returns those fields and verification uses expiration/rejection data |
| Upload security | Upload trusted the browser MIME type and had weak file/path/header handling | Added file-signature validation, normalized paths, safe filenames, safer replacement ordering, authenticated retry support, and ownership checks |
| Document query | Buyer document list loaded every user's documents and filtered in memory | Added an owner-scoped repository query ordered by upload time |
| Bank accounts | Weak validation, duplicate accounts, race-prone primary selection, and deleting the primary left no replacement | Added server validation, duplicate prevention, transactions, owner-scoped lookup, deterministic replacement primary, timestamps, and a partial unique primary index |
| Profile validation | Legal/business fields lacked practical length and format limits | Added GST/PAN/year, length, PIN, phone, email, IFSC, and bank-account validation plus normalization |
| UI failures | Several Buyer Account requests swallowed errors; payment order reference was blank | Existing UI now reports failures and uses `orderId`; payment activity is limited to the advertised five rows |
| CORS | Production `CORS_ORIGINS` configuration was ignored | Security configuration now consumes the configured comma-separated origins |

## Remaining production blockers

### P0 — required before real financial or compliance data

1. **Durable document storage and malware scanning**
   - Files are still stored on the application server filesystem.
   - Move to private object storage, encrypt at rest, scan uploads, use quarantine states, and issue short-lived signed downloads.

2. **Bank account protection and verification**
   - Account numbers are masked in API responses but remain plaintext in PostgreSQL.
   - Use envelope encryption or a payment-provider token, key rotation, access auditing, and real penny-drop/account verification.

3. **Automated test coverage and CI gate**
   - Buyer profile, settings, bank, document ownership, upload security, migrations, and authorization lack adequate integration tests.
   - Require backend tests, migration tests against PostgreSQL, frontend component tests, and Buyer profile E2E tests before deployment.

4. **Production security controls**
   - Add rate limiting for login, refresh, uploads, password changes, and bank mutations.
   - Remove the development JWT default and fail startup when production secrets/configuration are missing.
   - Add TLS-only cookies/transport policy, security headers/CSP, centralized audit events, and alerting.

5. **Privacy, retention, and deletion workflow**
   - Deactivate/Delete controls do not yet implement an approved retention-aware workflow.
   - Define retention rules for orders, invoices, compliance documents, and audit evidence before enabling deletion.

### P1 — functional and data-integrity hardening

1. **Duplicate profile surfaces**
   - Buyer Account, Business Profile, Verification, Documents, and Settings repeat the same data with separate local state and mappings.
   - Consolidate them behind shared typed hooks/components to prevent future contract drift while preserving the current visual layouts.

2. **Legal-detail re-verification policy**
   - Changes to GST, PAN, legal name, CIN, or registration number persist immediately.
   - Product/compliance must decide which changes lock purchasing and return the account to admin review; record before/after audit events.

3. **Verified contact changes**
   - Primary contact email and phone update without email-link/OTP verification.
   - Add a pending-change workflow instead of immediately replacing verified contact points.

4. **Optimistic locking**
   - Profile/contact edits have no version field; two tabs can overwrite each other.
   - Add entity versions and return `409 Conflict` for stale updates.

5. **Document version history**
   - Re-upload replaces the single row/file for a document type.
   - Retain immutable versions, reviewer history, rejection evidence, expiry changes, and uploader metadata.

6. **Identity-provider features**
   - Two-factor authentication, login alerts, and inactivity timeout are visible but not backed by an identity/OTP provider.
   - The branch prevents these controls from pretending they are active; implement them before enabling the toggles.

7. **Payment-method scope**
   - UI language mentions cards, but the backend only supports bank accounts and payment initiation is not integrated with a gateway/webhook.
   - Decide supported methods, tokenize them with the provider, and make settlement changes webhook-driven and idempotent.

8. **UX behavior without layout redesign**
   - Add explicit loading/empty/retry states, disable repeated submissions, confirm destructive document/bank actions, and warn about unsaved profile edits.
   - The Buyer Account “Add Method” action currently directs users to Business Profile rather than owning a shared add-account flow.

### P2 — maintainability and scale

- Replace remaining `any` mappings with generated/shared API types.
- Split the large Buyer Account and Business Profile components into shared data hooks and focused tab components.
- Add pagination for document/audit histories and bounded queries everywhere.
- Add structured metrics for profile-save failures, verification time, document rejections, and bank-verification failures.
- Add API documentation and version the Buyer profile contract before external clients consume it.

## Release gate

Do not treat Buyer profile as production-ready until all P0 items are complete and the chosen P1 compliance policies are implemented and tested. The branch fixes current persistence/security defects, but it intentionally does not simulate infrastructure that requires a real storage, identity, banking, or notification provider.

## Validation performed on this branch

- `npx tsc --noEmit` — passed
- `npm run build` — passed, including static generation of the Buyer dashboard
- `git diff --check` — passed
- Changed Java sources — delimiter/syntax-balance sanity check passed
- Backend Maven tests — not executed in the review workspace because Maven and a Java 21 compiler are not installed; these remain a required CI/reviewer check
- Repository-wide `npm run lint` — currently fails on the existing Prettier backlog across Admin and other dashboard files, so it is not a usable release gate until that baseline is addressed
