# Gamified Learning – Enterprise Version: Backend Analysis & Requirements

| | |
|---|---|
| Status | Draft for discussion |
| Date | 5 Oct 2026 |
| Scope | Backend (Express + MySQL), with the frontend and SaaSOps impact noted where unavoidable |

---

## 1. Goal

Today the platform is **partner-led**: a business partner registers (via SaaSOps), buys game tokens, adds end users and emails tokens to them. Each user plays one game for 3 days and then receives a certificate.

The **enterprise version** should let a company onboard **all of its employees**, who then **log in directly** and play the games in their company catalog without a partner emailing them a token.

The design principle in this document is **reuse, don't fork**: the `license` row stays the unit of "this person may play this game", so the existing play pipeline (launch → start → complete → history → stats → certificate) keeps working for both models.

---

## 2. Current Backend – How It Works Today

### 2.1 Stack

- Express server on port 5000 (`server/index.js`), MySQL via the `mysql2` pool (`server/config/database.js`).
- Route modules:

| Mount | File | Responsibility |
|---|---|---|
| `/api/auth` | `server/routes/auth.js` | SaaSOps partner register, partner login, password change/reset, unsubscribe, upgrade plan, Corent session |
| `/api/games` | `server/routes/games.js` | Games CRUD, categories, game lists (catalogs), company ↔ list mapping, public catalog, partner catalog |
| `/api/licenses` | `server/routes/licenses.js` | Token purchase (license generation), partner license list, bulk assign |
| `/api/users` | `server/routes/users.js` | Partner's end users (list/create/edit) |
| `/api/sendmail` | `server/routes/sendmail.js` | Emails tokens to users |
| `/api/play` | `server/routes/play.js` | Token validation, registration, play start/complete/history, game launch redirect, partner reports |
| `/api/partners` | `server/routes/partners.js` | Internal partner summary |
| `/api/safety-qna` | `server/routes/safetyQna.js` | Safety Q&A |

- Background job: `server/job/tokenCompletionJob.js` (generates certificate PDF, emails it, marks license `used`).
- Services: `certificateService.js` (PDF), `mailService.js` (completion mail), `monitoringService.js` (SaaSOps usage/metering event).

### 2.2 End-to-end flow (partner model)

```
SaaSOps ──POST /api/auth/register──► company + business_partner (+ company_game_lists = list 15)
Partner ──POST /api/auth/login──────► partner profile returned (no session/JWT)
Partner ──GET /api/games/partner/:id/games──► catalog from company_game_lists
Partner ──POST /api/licenses/purchase──► N license rows (status=unassigned, token_code, token_price)
Partner ──POST /api/users──────────► user rows (scoped by business_partner_id)
Partner ──POST /api/licenses/assign-bulk──► license.user_id set
Partner ──POST /api/sendmail────────► email with  /play?token=XXXX
User    ──/play?token=XXXX (Play.jsx)
          POST /api/play/validate-token
          POST /api/play/complete-registration  → status=assigned, registered_at=NOW()
                                                → SaaSOps monitoring event (metering)
          GET  /api/play/history
          (external) antiz-digital.com/api/play/progress  → resume vs new play
          POST /api/play/start      → play_tracker row, play_no = MAX+1
          GET  /api/play/launch     → cookies + 302 to game_url?token=&play_no=
Game    ──POST /api/play/complete   → score, play_result
Cron    ──tokenCompletionJob        → registered_at + 3 days → certificate PDF + email → status=used
```

### 2.3 Data model in use

| Table | Role today |
|---|---|
| `company` | Partner's company (name, address, country, `bolactive`) |
| `business_partner` | Partner login account (`login_id`, bcrypt `password`, `tenet_id`, `company_id`, `subscription_plan_id`, `active`, reset-token columns) |
| `user` | Partner's end user: `email_id`, `name`, `organization`, `business_partner_id`. **No password. Unique on (email, partner).** |
| `license` | One token = one user + one game. `business_partner_id` NOT NULL, `status` unassigned/assigned/used, `registered_at`, `certificate_status`, `token_price`, `token_price_currency` |
| `play_tracker` | One row per play attempt (`license_id`, `play_no`, `score`, `play_result`) |
| `game`, `game_category`, `game_x_category` | Game catalogue and categories |
| `game_lists`, `game_list_games`, `company_game_lists` | Catalogs and which company sees which catalog |
| `login_tracker` | Exists in schema, not currently written to by partner login |
| `monitoring_event_log` | Log of SaaSOps metering calls |

> **Note:** `SQL-setup/database-tables-setup.sql` is an older snapshot, so it doesn't list some columns and tables that exist in the live database and are used by the code (`company.bolactive`, `business_partner.company_id / active / reset_*`, `license.certificate_status`, `game.stream_name / stream_id`, `game_lists*`, `company_game_lists`, `game_category`, `monitoring_event_log`). This analysis is based on what the code actually uses. Write the enterprise migrations against the live schema.
---

## 3. Assumptions in Today's Code That Block Enterprise

| # | Assumption | Where | Why it matters for enterprise |
|---|---|---|---|
| A1 | **Identity = token.** The user never logs in; possessing `token_code` is the authorisation. | `play.js` (all routes), `Play.jsx` | Employees need an account and a session, and a token must only work for its owner. |
| A2 | **`user` has no password** and is owned by a partner (`business_partner_id`, unique on email + partner). | `user` table, `users.js` | Employees need credentials and must belong to a company, not to a partner. |
| A3 | **Licenses are bought up front, one per user per game**, by a partner. | `licenses.js /purchase` | For enterprise, access comes from the company catalog and seats; a license should be created automatically when the employee opens a game. |
| A4 | **Fixed 3-day validity** (and a 5-day window for unregistered tokens) is hard-coded in several places. | `play.js /launch` (3d), `Play.jsx` (3d and 5d), `tokenCompletionJob.js` (3d), `sendmail.js` email text, `play.js /partner/user-summary` (5d) | Enterprise access is normally for the length of the subscription, or until an admin-set deadline. |
| A5 | **Certificate is time-based**: issued 3 days after registration, whatever the result. | `tokenCompletionJob.js` | Enterprises usually want a certificate on **Pass**, optionally with a re-certification period. |
| A6 | **A `used` license can't be played again.** | `play.js /validate-token` | Employees may need to replay or retake for refresher training. |
| A7 | **Certificate sponsor = partner name + company.** | `tokenCompletionJob.js`, `certificateService.js` | Should show the enterprise name/logo. |
| A8 | **No server-side session or authorisation.** Partner endpoints trust `partnerId` / `businessPartnerId` sent by the client. | `users.js`, `licenses.js`, `play.js /partner/*`, `auth.js /change-password`, `/upgrade-plan`, `/unsubscribe` | With hundreds of employees per company, IDs taken from the client are a data-leak risk. Real auth middleware is a prerequisite. |
| A9 | **Metering = one event per token registration** (`numberoftokens: 1`). | `monitoringService.js`, called from `/complete-registration` and `/register-and-assign` | Enterprise billing is likely per seat (active employee), not per token. |
| A10 | **Email lookup is global.** `/verify-email` finds a user by email only; `/register-and-assign` inserts a user without a partner. | `play.js` | Once the same email can exist under several companies, every lookup must be scoped to a company. |
| A11 | **Credentials in source code** (SMTP app password, register API secret, Corent API key). | `sendmail.js`, `auth.js` | Must move to environment variables before onboarding enterprise customers (security reviews will flag this). |

---

## 4. Proposed Enterprise Model

### 4.1 Roles

| Role | Who | Stored in |
|---|---|---|
| Antiz internal admin | Antiz staff | existing internal pages |
| **Enterprise admin** | HR/L&D person at the customer | reuse `business_partner`, with `role = 'enterprise_admin'` |
| **Employee** | Any staff member of the enterprise | extend `user` (`user_type = 'employee'`, `company_id`, password) |
| Partner / partner's user | Unchanged | unchanged |

**Why reuse `business_partner` for the enterprise admin:** `license.business_partner_id` is NOT NULL with a foreign key. If the enterprise admin is a `business_partner` row, licenses created for employees can point to it with no schema change to `license`, and the existing reports, SaaSOps tenant (`tenet_id`), subscription plan, login and password reset all keep working.

### 4.2 Account type on company

`company.account_type = 'partner' | 'enterprise'` decides which flow applies. Everything that branches (expiry, certificate trigger, metering, portal) reads this one flag, either directly or through `license.license_type`.

### 4.3 Entitlement flow (enterprise)

```
Employee logs in (JWT) ─► GET /api/enterprise/me/games
   catalog = company_game_lists → game_list_games → game   (same as partner catalog)
   + per game: license status, best score, pass/fail, certificate link
Employee clicks Play ─► POST /api/enterprise/me/games/:gameId/open
   find license WHERE user_id=? AND game_id=? AND license_type='enterprise'
   if none → INSERT license (business_partner_id = enterprise admin,
              user_id, game_id, token_code, status='assigned',
              registered_at=NOW(), license_type='enterprise', expires_at per policy)
              + seat check + metering event
   return { token }
Frontend ─► existing /play?token=… flow (start → launch → game → complete)
```

Because the employee ends up holding a normal license token, `play_tracker`, the progress API, `playStats.js` (including the Game 43 rules), `/play/launch`, `/play/complete` and `/play/history` all work **without changes to their core logic**.

---

## 5. Requirements

### 5.1 Database changes

```sql
-- Company: account type, login slug, policy
ALTER TABLE company
  ADD COLUMN account_type ENUM('partner','enterprise') NOT NULL DEFAULT 'partner',
  ADD COLUMN company_slug VARCHAR(64) NULL,               -- used in enterprise login URL
  ADD COLUMN seat_limit INT NULL,                         -- NULL = unlimited
  ADD COLUMN license_validity_days INT NULL,              -- NULL = no expiry
  ADD COLUMN certificate_rule ENUM('time_based','on_pass') NOT NULL DEFAULT 'time_based',
  ADD COLUMN allow_replay_after_cert TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN sso_provider VARCHAR(32) NULL,               -- phase 2 (azure_ad / google / okta)
  ADD COLUMN sso_config JSON NULL,                        -- phase 2
  ADD UNIQUE KEY uk_company_slug (company_slug);

-- Enterprise admin = business_partner with a role
ALTER TABLE business_partner
  ADD COLUMN role ENUM('partner','enterprise_admin') NOT NULL DEFAULT 'partner';

-- Employees = user rows with credentials and company ownership
ALTER TABLE `user`
  ADD COLUMN user_type ENUM('partner_customer','employee') NOT NULL DEFAULT 'partner_customer',
  ADD COLUMN company_id INT NULL,
  ADD COLUMN password_hash VARCHAR(255) NULL,
  ADD COLUMN employee_code VARCHAR(64) NULL,
  ADD COLUMN department VARCHAR(255) NULL,
  ADD COLUMN active TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN invite_token VARCHAR(64) NULL,
  ADD COLUMN invite_expires DATETIME NULL,
  ADD COLUMN reset_token VARCHAR(64) NULL,
  ADD COLUMN reset_token_expires DATETIME NULL,
  ADD COLUMN last_login_at DATETIME NULL,
  ADD UNIQUE KEY uk_user_email_company (email_id, company_id),
  ADD KEY idx_user_company (company_id),
  ADD CONSTRAINT fk_user_company FOREIGN KEY (company_id) REFERENCES company(id);

-- License: type + explicit expiry
ALTER TABLE license
  ADD COLUMN license_type ENUM('partner_token','enterprise') NOT NULL DEFAULT 'partner_token',
  ADD COLUMN expires_at DATETIME NULL,
  ADD KEY idx_license_user_game_type (user_id, game_id, license_type);

-- Optional (phase 2): admin-assigned games with deadlines
CREATE TABLE enterprise_assignment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  game_id INT NOT NULL,
  target_type ENUM('all','department','user') NOT NULL,
  target_value VARCHAR(255) NULL,
  due_date DATE NULL,
  created_by INT NOT NULL,                     -- business_partner.id
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_ea_company (company_id)
);
```

Notes:

- `uk_user_email_company` allows the same email under several companies, and MySQL treats NULL `company_id` values as distinct, so existing partner users are not affected. Keep the existing `uk_user_email_partner`.
- **Backfill:** existing licenses get `expires_at = registered_at + 3 days` where `registered_at` is set, so one expiry rule can serve both models.
- "One enterprise license per (user, game)" is enforced in code with `SELECT … FOR UPDATE` inside a transaction (a plain unique index would conflict with partner tokens, where duplicates are allowed).

### 5.2 Authentication & authorisation (prerequisite)

1. Add JWT sessions (e.g. `jsonwebtoken`, secret in an environment variable). Login returns `{ token, profile }`. The token carries `sub`, `role` (`partner` | `enterprise_admin` | `employee` | `internal`), `company_id` and `business_partner_id`.
2. Middleware `requireAuth(roles[])` in `server/middleware/auth.js`. Enterprise routes **always take `company_id` from the token, never from the request body or query.**
3. Employee login: `POST /api/enterprise/:slug/login` (email + password), so the company is known up front. The same email in two companies stays unambiguous.
4. Employee invite and activation: admin invites → email with a one-time `invite_token` → employee sets a password.
5. Employee forgot/reset password (mirror the existing partner flow, using `user.reset_*`).
6. Record logins in the existing `login_tracker` table.
7. Phase 2: SSO (Azure AD / Google Workspace / Okta through OIDC), with just-in-time employee creation for allowed email domains.
8. Recommended: put existing partner routes behind the same middleware too. It isn't strictly required for enterprise, but A8 is a real risk today.

### 5.3 New backend APIs

**Enterprise admin** (`role = enterprise_admin`, scoped to the company in the token)

| Method & path | Purpose |
|---|---|
| `GET /api/enterprise/admin/employees` | List/search employees with status and progress counts |
| `POST /api/enterprise/admin/employees` | Add one employee (sends invite) |
| `POST /api/enterprise/admin/employees/import` | CSV/XLSX bulk import (validate, dedupe, seat-limit check, send invites) |
| `PUT /api/enterprise/admin/employees/:id` | Edit name/department/employee code |
| `PATCH /api/enterprise/admin/employees/:id/status` | Activate or deactivate (frees a seat; blocks login and launch) |
| `POST /api/enterprise/admin/employees/:id/resend-invite` | Resend invite |
| `GET /api/enterprise/admin/catalog` | Games available to the company (reuse the partner catalog query, by `company_id`) |
| `GET /api/enterprise/admin/reports/summary` | Seats used, employees started/passed/certified per game |
| `GET /api/enterprise/admin/reports/employees.csv` | Compliance export |
| `POST /api/enterprise/admin/assignments` *(phase 2)* | Assign games to all/department/user with a due date |

**Employee** (`role = employee`)

| Method & path | Purpose |
|---|---|
| `POST /api/enterprise/:slug/login` | Login |
| `POST /api/enterprise/:slug/activate` | Set password from invite token |
| `POST /api/enterprise/:slug/forgot-password`, `/reset-password` | Password reset |
| `GET /api/enterprise/me` | Profile + company branding |
| `GET /api/enterprise/me/games` | Catalog plus per-game progress (best score, pass, certificate, expiry) |
| `POST /api/enterprise/me/games/:gameId/open` | Find or create the enterprise license and return the token (seat check, metering) |
| `GET /api/enterprise/me/certificates` | List and download own certificates |

**Internal (Antiz)**

| Method & path | Purpose |
|---|---|
| `POST /api/games/companies` / `PUT /api/games/companies/:id` | Add `account_type`, `company_slug`, `seat_limit`, validity and certificate policy |
| `POST /api/internal/enterprises/:companyId/admins` | Create an enterprise admin login (when not created through SaaSOps) |

### 5.4 Changes to existing backend code

| File / route | Change |
|---|---|
| `server/utils/licensePolicy.js` *(new)* | Single source for `isLicenseExpired(license)`, `getExpiresAt(company, registeredAt)`, `canReplay(license, company)`. Replaces the hard-coded 3-day/5-day logic. |
| `play.js /launch` | Use `licensePolicy`. For `license_type = 'enterprise'`: require a valid employee JWT (cookie or header) whose `user_id` matches `license.user_id`, and the employee must be `active`. |
| `play.js /validate-token` | Also return `licenseType`, `expiresAt`, `companyName`. Allow `used` licenses when `allow_replay_after_cert = 1`. |
| `play.js /complete-registration` | Not used for enterprise (license is created as `assigned` with `registered_at`). No change for partners. |
| `play.js /start`, `/complete`, `/history` | Reject when the license is expired or the employee is inactive. Core logic unchanged. If `certificate_rule = 'on_pass'`, `/complete` can flag the license for immediate certificate processing. |
| `play.js /verify-email`, `/register-and-assign` | Scope email lookups by partner/company (A10). Not used by the enterprise flow. |
| `licenses.js /purchase` | Block for `account_type = 'enterprise'` (enterprise licenses are created automatically), or keep it for enterprises that also distribute tokens externally (decision). |
| `users.js` | Partner-only. Add `WHERE user_type = 'partner_customer'` so employees never show up in partner lists. |
| `tokenCompletionJob.js` | Split the eligibility query: **(a)** partner licenses, unchanged (`registered_at + 3 days`); **(b)** enterprise licenses with `certificate_rule = 'on_pass'` and at least one `Pass` in `play_tracker` (Game 43: `score IS NOT NULL AND play_result = 'Pass'`) and `certificate_status = 0`. Sponsor text = enterprise company name. For enterprise, set `certificate_status = 1` but keep `status = 'assigned'` if replay is allowed. Certificate file name stays `token_code.pdf`. |
| `certificateService.js` | Optional company logo and "Issued by <Company>" line. |
| `mailService.js` | Enterprise template: no partner CC, company name, link to the portal. New templates: employee invite, password reset, assignment due reminder (phase 2). |
| `monitoringService.js` | Add a metering mode for enterprise. Either send one event when an employee is activated (per seat), or one per first open of a (user, game) license (per game). Must match the SaaSOps product configuration. |
| `auth.js /register` | Accept an optional `account_type` (or derive it from `subscription_plan_id`) from SaaSOps. If enterprise: set `company.account_type`, `company_slug`, `seat_limit`, and create the business_partner with `role = 'enterprise_admin'`. Default catalog list (currently 15) may differ for enterprise. |
| `auth.js /login` | Return `role` and `account_type` so the frontend routes enterprise admins to the enterprise admin dashboard. |
| `auth.js /upgrade-plan`, `/unsubscribe` | On enterprise unsubscribe: deactivate the company and all its employees (block login and launch). Seat-count changes come from SaaSOps plan changes. |
| `games.js /partner/:partnerId/games` | Extract the catalog query into a helper `getCatalogForCompany(companyId)` reused by the partner and enterprise endpoints. |
| `sendmail.js` | No change for partners; it is not used by enterprise. Move the SMTP credentials to environment variables (A11). |
| `SQL-setup/database-tables-setup.sql` | Optional: append the enterprise columns from section 5.1 for reference (the file is an older snapshot). |

### 5.5 Business rules to implement

1. **Seat limit:** count active employees (`user_type = 'employee' AND active = 1 AND company_id = ?`). Block invite or import when `seat_limit` would be exceeded.
2. **Deactivated employee:** cannot log in. Existing licenses are blocked at `/open`, `/launch` and `/start`. History and certificates are kept.
3. **Expiry:** `license.expires_at` is NULL (no expiry) or `registered_at + license_validity_days`. A company subscription that is unsubscribed/inactive overrides everything.
4. **Replay after certificate:** controlled by `company.allow_replay_after_cert`.
5. **Re-certification (phase 2):** when a certificate is older than N months, issue a new enterprise license (new `token_code`) so the history stays separate per certification cycle.
6. **Company isolation:** every enterprise query filters on `company_id` taken from the JWT, and every license access checks `license.user_id = jwt.sub`.

### 5.6 Frontend impact (summary)

| Area | Work |
|---|---|
| `/e/:slug/login`, `/e/:slug/activate`, `/e/:slug/forgot-password` | New employee auth pages with company branding |
| `/e/:slug/my-games` | Employee portal: catalog cards (reuse `GameTitle`), progress, Play button → `/open` → `/play?token=` |
| `/e/:slug/certificates` | Download own certificates |
| `/enterprise/admin/*` | Admin dashboard: employees (add/import/deactivate), catalog view, reports and export |
| `Play.jsx` | Use `expiresAt` / `licenseType` from `/validate-token` instead of the hard-coded 3d/5d. Hide the "3 days" text and the registration step for enterprise licenses. Send the JWT on the launch call. |
| `PartnerLogin` | Route by `role` and `account_type` returned by login |
| Internal `CompanyManagement` | Account type, slug, seat limit, validity and certificate policy fields |
| Shared | An auth context that stores the JWT and attaches `Authorization: Bearer` to API calls |

### 5.7 SaaSOps / billing

- Define an **Enterprise product/plan** in SaaSOps with seat count (and possibly a game bundle).
- `/api/auth/register` must receive the account type and seat count from SaaSOps (new fields in the payload).
- Decide the metering unit (per seat activated vs per game opened) and update `monitoringService.js` to match.
- Upgrade/downgrade must update `company.seat_limit`.
- `token_price` / `token_price_currency` stay NULL for enterprise licenses (the price is in the subscription), unless finance wants an internal per-play value.

### 5.8 Non-functional requirements

- **Security:** JWT auth on all enterprise routes. Move all secrets to environment variables. Rate-limit the login, activate and forgot-password routes. Use bcrypt with the existing cost of 12. Invite and reset tokens expire and are single-use.
- **Privacy:** employee PII (name, email, department) stays company-isolated. Provide an admin export and an employee delete/anonymise option for GDPR/DPDP requests.
- **Scale:** bulk import of 1,000+ rows in batches inside a transaction. Send invite emails through a queue/job (not inside the HTTP request). The current Gmail SMTP sends one mail at a time and has daily sending limits, so consider a transactional mail provider for enterprise volumes.
- **Indexes:** `user(company_id)`, `license(user_id, game_id, license_type)`, plus the existing `play_tracker(license_id)`.
- **Backward compatibility:** every new column has a partner-safe default, so existing partner flows are unchanged until a company is marked `enterprise`.

---

## 6. Impact Summary

| Area | Partner flow | Enterprise flow |
|---|---|---|
| Onboarding | SaaSOps register → partner | SaaSOps register (`account_type = enterprise`) → enterprise admin |
| End-user identity | Token in email, no password | Employee account (password; SSO in phase 2) |
| Getting access | Partner buys and assigns tokens | Automatic license on first open, within the seat limit |
| Validity | 3 days from registration | Subscription length or configured days |
| Certificate | 3 days after registration | On Pass (configurable) |
| Play pipeline (`/start`, `/launch`, `/complete`, `/history`, stats, progress API) | Unchanged | **Reused as-is** |
| Billing | Per token (metering event on registration) | Per seat or per game opened (decision) |

---

## 7. Open Decisions

1. **Onboarding:** enterprise created by SaaSOps self-signup, or by Antiz internal only?
2. **Employee login:** email + password first, with SSO later? Or is SSO required from day one?
3. **Game access:** whole company catalog open to every employee, or admin-assigned games (with due dates)?
4. **Certificate trigger:** on first Pass, best score after the validity window, or both (configurable per company)?
5. **Replay after certificate:** allowed? Re-certification period?
6. **Metering/billing unit:** per active seat, or per (employee, game) opened?
7. **Can an enterprise also distribute tokens externally** (contractors/vendors) through the existing partner token flow?
8. **Login URL:** per-company slug (`/e/acme/login`), or one login page with a company picker?
9. **Default catalog** for new enterprises (list 15 like partners, or a separate enterprise list)?

---

## 8. Suggested Phases

**Phase 0 – Foundation (prerequisite)**
- Move secrets to environment variables.
- Add JWT auth + `requireAuth` middleware, and return `role` / `account_type` on login.
- `licensePolicy.js` to centralise expiry (no behaviour change for partners).

**Phase 1 – Enterprise MVP**
- DB migrations in section 5.1 (excluding `enterprise_assignment`).
- Enterprise company setup (internal page + SaaSOps register flag).
- Admin: add/import/deactivate employees, invite emails, seat limit.
- Employee: activate, login, forgot password, My Games, open game (auto license), certificates list.
- `tokenCompletionJob.js` on-pass certificate branch with enterprise branding.
- `/launch` and `/start` ownership + active checks for enterprise licenses.
- Admin summary report + CSV export.

**Phase 2 – Enterprise features**
- SSO (OIDC) + just-in-time provisioning.
- Assignments with due dates, reminder emails, overdue report.
- Re-certification cycles.
- Mail queue / transactional mail provider.

**Phase 3 – Commercial**
- Seat-based SaaSOps plans, upgrade/downgrade syncing `seat_limit`.
- Enterprise metering mode.
- Company branding (logo on portal and certificate).

---

## 9. Testing Checklist

- Partner regression: register → purchase → assign → email → play → 3-day certificate still works unchanged.
- Enterprise: invite → activate → login → open game creates exactly one license (concurrent clicks don't create duplicates).
- An employee cannot launch another employee's token (ownership check on `/launch`, `/start`, `/complete`, `/history`).
- An employee from company A cannot see or access company B data (all admin endpoints).
- Seat limit enforced on single add and bulk import.
- A deactivated employee is blocked from login and play; history is kept.
- On-pass certificate is generated once; Game 43 pass rule is respected.
- Expiry: NULL never expires; N days expires correctly; partner 3-day rule is unchanged.
- Unsubscribed enterprise blocks all employee access.
