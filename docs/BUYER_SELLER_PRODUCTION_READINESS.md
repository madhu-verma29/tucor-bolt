# Buyer and seller release assessment

Assessment date: 2026-10-01 (India). Base: `buyer-profile-production-hardening`, commit `9559d29aeb644444f6ea62678aaef99df411f43f`.
Fix branch: `buyer-seller-production-hardening`.

**Release decision: NO-GO for real production transactions.** Core profile APIs are connected, but a working dashboard is not evidence of completed payments, payouts, compliance or production infrastructure. This branch repairs concrete code defects and adds release checks. It does not deploy or merge the application.

## Buyer coverage

| UI surface | Backend connection | Remaining gap |
|---|---|---|
| Buyer Account / Business Profile | `/api/buyer/profile`, PATCH persists legal/address details | Legal changes need audit/re-verification policy and conflict handling |
| Contacts / account settings | `/api/buyer/settings/account`, `/contacts` | Contact email/phone changes do not prove ownership via email/OTP |
| Bank accounts | `/api/buyer/bank-accounts`, primary/delete | Masked responses; plaintext database values; no bank-provider verification |
| Verification / Documents | `/api/buyer/documents`, upload/download/delete | Private durable storage, malware scanning, immutable review history |
| Procurement / notification preferences | `/api/buyer/settings/preferences`, `/notifications` | Saved preferences do not implement SMS/WhatsApp, auto-reorder, price alerts, weekly reports, currency/language or compact-view behavior |
| Marketplace / saved listings | `/api/buyer/listings`, `/saved-listings` | Pagination and request idempotency still needed |
| Orders / tracking | `/api/buyer/orders`, `/pickups` | Admin-driven state changes; live logistics provider and end-to-end workflow validation pending |
| Payment / confirmation | `/api/buyer/payments` | Creates a pending database record only; no gateway checkout, authenticated webhook, reconciliation or refund integration |
| Invoices / reports / sustainability | Payments/orders/dashboard read APIs and browser CSV exports | No legal PDF invoice generation; sustainability uses fixed estimates, not verified measurements |
| Earnings / refunds | Reads payments with `Refunded` status | No operational refund or credit-note API/provider workflow |
| Password / security | `/api/buyer/settings/password`, auth APIs | 2FA provider, distributed rate limiting and hardened browser token storage pending |
| Deactivation / deletion | No completed workflow | Requires retention-aware request/review/deletion processing |

## Seller coverage

| UI surface | Backend connection | Remaining gap |
|---|---|---|
| Seller Account / Business Profile | `/api/seller/profile`, PATCH | Legal changes need re-verification/audit policy and stale-edit detection |
| Account / contacts / operations | Profile PATCH and `/api/seller/settings/account` | Email and phone change verification |
| Bank Details | `/api/seller/bank-account`, PUT | Real bank verification and database encryption; responses now masked |
| Verification / Documents | `/api/seller/documents` and authenticated downloads | Durable private storage, malware scanning, immutable versions |
| Listings / create / supporting files | `/api/seller/listings`, `/listings/{id}/documents` | Admin review remains required; draft requires valid minimum listing fields; transactional listing-plus-file submission is not implemented |
| Request Management | `/api/seller/requests`, PATCH approve/reject | Buyer notification delivery and admin/seller state-transition consistency |
| Orders / pickups | `/api/seller/orders`, `/pickups` | Real logistics assignment/tracking and complete state-machine tests |
| Payments / Earnings / Withdraw | `/api/seller/payments`, `/withdrawals` | Withdrawal request is stored only; no disbursement worker, webhook, retry, reconciliation or refund ledger |
| Notifications | `/api/seller/notifications`, read/dismiss | Only locally generated events; full admin/event delivery and email/SMS workers pending |
| Invoices / Reports | Read APIs and browser CSV | PDF/legal invoices and automated report delivery pending |
| Security / Preferences | Password and notification settings APIs | Unsupported 2FA, login alerts, auto-invoice and weekly-report toggles are disabled; server rejects enabling them |
| Deactivation / deletion | No processing API | Controls disabled with support guidance until retention-aware workflow exists |

## Fixed in this branch

- Anonymous API calls now return 401, allowing the clients to refresh expired sessions correctly.
- Buyer and seller clients share refresh requests and do not recreate a session after logout; authenticated document downloads also refresh.
- Buyer and seller dashboard guards validate the server-side role/session before rendering operational data.
- Login failures now persist the failed-attempt counter instead of rolling it back when an error is returned. Login counters and refresh rotation use row locks.
- Password changes/reset increment a credential version and revoke refresh tokens. Existing access tokens become invalid immediately.
- Seller registration FSSAI uploads now use the dashboard's `FSSAI` type; migration converts compatible existing rows.
- Seller uploads validate file signatures, normalize paths/names, use owner-scoped queries, reset old review metadata and expose expiry consistently.
- Buyer, seller, registration and listing uploads share file handling that removes new files on database rollback and cleans old files after commit. Crash/orphan reconciliation still needs an operations process.
- Seller listing mutations cannot self-approve by sending `Active`; only `Draft` or `Pending Verification` is accepted. Trading requires an ACTIVE verified business. Buyer orders validate availability dates.
- Seller listing edits/deletes lock inventory and reject changes to listings with order history, preserving historical references and reservations.
- Seller request decisions lock listing and order rows, cannot restore stock twice, and cannot reopen a flagged/expired listing on rejection.
- Buyer payment creation is atomic and locks the order before duplicate/status checks.
- Withdrawal balance checks lock the seller row; verified business/bank are required. Buyer bank mutations serialize primary-selection/deletion operations; seller bank changes reset verification.
- Seller profile/bank/settings/listing inputs have format and length limits; API conflict and oversized-upload failures return controlled errors.
- Seller load errors are visible. Unsupported seller features no longer show enabled toggles. Invoice download tooltip now says CSV.
- Seller Earnings no longer fabricates a 5% fee; monthly totals filter by the actual settlement month. **Payout amount semantics remain a blocker:** seller APIs still inherit buyer payment totals, which include transport, platform fee and tax. Implement an approved, server-authoritative seller settlement ledger before using these amounts for real payouts.
- Listing retry reuses an already-created listing instead of creating another after a file upload failure.
- CSV exports neutralize spreadsheet formula prefixes in text fields.
- Production start runs `next start`; build enforces TypeScript errors; source maps are disabled. A committed lockfile enables repeatable `npm ci`.
- `.env` is removed from this branch's tracked files and environment/upload/build outputs are ignored. Existing Git history is unchanged; review historical values and rotate any actual secrets separately.
- `prod` startup checks require explicit secrets, database/mail settings, persistent upload path and HTTPS web origins. This guard is configuration validation, not proof of infrastructure readiness.
- GitHub Actions runs frontend checks and Java 21 tests against PostgreSQL, all Flyway migrations and Hibernate schema validation. Required-check branch protection must be configured by the repository owner.

## Required before release

1. Connect the chosen payment/payout/bank verification provider. Add signed idempotent webhooks, a settlement/refund ledger, provider reconciliation and withdrawal processing. Define payout fees, transport, tax and invoice ownership. Current pending/settled database labels do not prove money moved.
2. Configure private durable encrypted storage, malware scanning/quarantine and retention/version history. `UPLOAD_DIR` must be a persistent restricted volume until the object-storage adapter exists; a setting alone does not solve durability.
3. Encrypt/tokenize stored bank details with managed keys and add verified contact-change and business re-verification workflows.
4. Configure distributed rate limits at the gateway, TLS, CSP/security headers, trusted CORS origins, secure session storage/cookies, monitoring/audit alerts, backups and a restore test. Activate `SPRING_PROFILES_ACTIVE=prod` explicitly.
5. Implement notification/OTP/report workers and complete provider-backed UI features, or keep them explicitly unavailable. Define retention/deletion and legal invoice policies.
6. Harden admin order/payment/pickup state transitions and inventory releases under concurrency. This branch serializes buyer/seller mutations, but the admin controller still permits broad manual status changes without the same complete transition/locking policy.
7. Complete the PostgreSQL CI checks, browser E2E for both roles and a staging round trip: register → verify → review → listing → buyer order → seller decision → admin pickup → verified payment webhook → payout → invoice. Include retries, revoked accounts, concurrent requests and provider failures.

## Validation and reproduction

- Java 21 Maven compile and 12 backend tests: passed locally; PostgreSQL integration tests are gated by `TUCOR_INTEGRATION=true` and run in CI.
- TypeScript check, three session regression tests, production Next.js build and `git diff --check`: passed locally before final push (see CI for the pushed commit).
- Local PostgreSQL cannot run under this workspace's non-root restrictions, so migration and database concurrency results must come from the PostgreSQL CI job; no local database/E2E pass is claimed.
- Repository-wide lint still has the existing formatting backlog and is not included as a passing gate.

```bash
npm ci
npm run type-check
node --test scripts/auth-session.test.cjs
npm run build
mvn -B test -f backend/pom.xml
# Against an isolated PostgreSQL database, with DATABASE_URL/USERNAME/PASSWORD set:
TUCOR_INTEGRATION=true mvn -B verify -f backend/pom.xml
```

Deployment notes: apply Flyway V18 through the backend, configure the `prod` profile and required environment variables, rebuild the frontend with the actual HTTPS `NEXT_PUBLIC_API_BASE_URL`, and review disabled-feature behavior. Never point integration tests at a production database. V18 resets unsupported seller settings to false and adds token-version/FSSAI normalization support. ACTIVE business verification is now enforced for trading; pending demo accounts need admin approval before testing purchases/submissions.
