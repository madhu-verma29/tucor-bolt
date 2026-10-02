# Admin production readiness — 2026-10-02

**Verdict: NO-GO for a live marketplace handling real funds.** This branch closes concrete admin API and workflow gaps; it is not a deployment certification. It builds on `buyer-seller-production-hardening` (`68af62b`). Existing buyer/seller blockers still apply.

## Admin review

| Area | Backend and integration status | Remaining production work |
|---|---|---|
| Session/profile/navigation | Admin role guard, shared token refresh, authenticated downloads, real logout, settings navigation | Admin MFA, step-up authentication and session/device controls |
| Overview | Existing summary/metrics/activity APIs | Financial numbers are estimates; replace hardcoded fee calculations with ledger-derived reports |
| Users/businesses/verification | Existing actions hardened; approval requires mailbox verification and verified, unexpired required documents; suspension/rejection revoke sessions | Compliance review policy and fine-grained reviewer roles; approval transitions need fuller policy coverage |
| Documents | Review/download APIs hardened; persistent document requests and closure APIs added, admin Request Document wired | Object storage, malware scanning, retention and delivery workers; buyer document requests have an API but no inbox UI |
| Listings | Approval requires active verified seller, live inventory; business approval no longer publishes listings automatically | Independent quality inspection evidence and moderation permissions |
| Orders | Detail and confirm/cancel/reject APIs added; UI controls for confirm/cancel/pickup/dispute; locked cancellation restores inventory once | Carrier cancellation, rescheduling and evidence for delivery; rejected/cancelled disputes cannot be reopened |
| Pickups | Create API, assignment with real agent/vehicle and date, guarded completion; duplicates blocked under order lock | Logistics provider integration and proof of pickup/delivery; no automatic dispatch is claimed |
| Payments | Pending/processing/failure transitions guarded; previous order state recorded for retry; settlement/resolve rejected without provider evidence | Payment provider, signed webhooks, reconciliation, refunds, payouts and accounting ledger |
| Disputes | Open API; investigate/escalate/resolve/close guarded; resolution requires details and restores recorded order state | Evidence attachments, arbitration permissions and provider-backed refunds. Legacy disputed orders without a recorded previous state remain disputed pending manual reconciliation |
| Reports | Existing download APIs; audit CSV formula injection protection | Financial/fee correctness, settlement-based revenue, reporting pagination |
| Audit | Mutations recorded in transaction; direct peer IP recorded instead of trusting arbitrary forwarded headers | Append-only external audit retention, reviewed reverse-proxy IP configuration and monitoring |
| Settings | Password changes revoke old tokens; unsupported operational pricing/approval changes rejected and controls disabled | Global pricing policy and immutable quote snapshots. Existing settings are per-admin display/preferences, not platform transaction controls |
| Invitations/access | Hashed, expiring, single-use email invitation with password setup, no temporary password exposure; access API prevents self/last-admin suspension | Invitation resend/revocation, durable mail outbox, rate limits, granular permissions; all current admins still have full ADMIN access |
| Alerts/search | Private read receipts persisted; bounded parameterized search API and UI | Durable alert delivery; current alerts derive from counters and recent audit records; search opens the matching section, not a record-specific deep link |

## Added API contracts

All `/api/admin/**` routes require an authenticated ADMIN. Buyer and seller routes are role- and owner-scoped.

| Method | Route | Body / behavior |
|---|---|---|
| GET | `/api/admin/search?q=...` | 2–80 characters, at most 30 user/order/dispute results |
| GET | `/api/admin/orders/{publicId}` | Existing order details |
| PATCH | `/api/admin/orders/{publicId}` | `{action: confirm|cancel|reject, reason?}` |
| POST | `/api/admin/orders/{publicId}/pickup` | `{scheduledDate: YYYY-MM-DD, agentName?, vehicleNumber?}`; confirmed orders only |
| POST | `/api/admin/orders/{publicId}/disputes` | `{reason, description}`; one dispute per order |
| POST | `/api/admin/businesses/{userId}/document-requests` | `{message}` |
| GET | `/api/admin/businesses/{userId}/document-requests` | Business request history |
| PATCH | `/api/admin/document-requests/{id}` | `{action: complete|cancel}`; open requests only |
| GET | `/api/buyer/document-requests`, `/api/seller/document-requests` | Current account's requests |
| PUT | `/api/admin/notifications/{id}/read` | Private read receipt; changed counter messages become unread again |
| PATCH | `/api/admin/admins/{id}` | `{action: suspend|activate}`; pending invite cannot be activated |
| POST | `/api/auth/admin-invitations/accept` | Public, `{token,password}`; invitation token proves mailbox possession |

Existing invitation endpoint now returns `{email,message,expiresAt}`. Existing pickup assignment requires `agentName` and `vehicleNumber`; dispute resolution requires `reason`. Payment settlement is deliberately unavailable without verifiable provider evidence.

## Database and validation

Flyway V19 adds invitation display names, payment/dispute previous-state fields, document requests, notification receipts and one-time legacy-dispute backfill. No read endpoint creates dispute rows. Test migrations on a restored production snapshot before rollout, and take a backup; schema rollback is not automatic.

Checks: TypeScript, session-refresh/sign-out tests, Next production build and Java unit tests. Six workflow tests cover one-time inventory release, preservation of moderation flags, pickup transitions, future-date completion, settlement rejection and dispute restoration. Six PostgreSQL integration tests cover admin authorization/search bounds, approval mailbox safeguards, request ownership, single-use invitations self-suspension, pickup persistence and private alert receipts. CI runs these together with the existing buyer/seller PostgreSQL tests and Hibernate schema validation.

Production deployment still requires configured TLS/CORS/JWT secrets/SMTP, tested database restore and monitoring, validated storage, provider credentials and webhooks, load/pagination testing (many existing admin reads load entire tables), security review and browser end-to-end verification. Email/SMS notification preferences do not schedule delivery; invitation mail is synchronous and needs a durable outbox. No live provider, production data, external notification recipient or deployment was exercised in this review.
