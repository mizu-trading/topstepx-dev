# User Setup Template

Template for `.planning/phases/XX-name/{phase}-USER-SETUP.md` - human-required configuration that Claude cannot automate.

**Purpose:** Document setup tasks that literally require human action - account creation, dashboard configuration, secret retrieval. Claude automates everything possible; this file captures only what remains.

---

## File Template

```markdown
# Phase {X}: User Setup Required

**Generated:** [YYYY-MM-DD]
**Phase:** {phase-name}
**Status:** Incomplete

Complete these items for the integration to function. Claude automated everything possible; these items require human access to external dashboards/accounts.

## Environment Variables

| Status | Variable | Source | Add to |
|--------|----------|--------|--------|
| [ ] | `ENV_VAR_NAME` | [Service Dashboard -> Path -> To -> Value] | `.env.local` |
| [ ] | `ANOTHER_VAR` | [Service Dashboard -> Path -> To -> Value] | `.env.local` |

## Account Setup

[Only if new account creation is required]

- [ ] **Create [Service] account**
  - URL: [signup URL]
  - Skip if: Already have account

## Dashboard Configuration

[Only if dashboard configuration is required]

- [ ] **[Configuration task]**
  - Location: [Service Dashboard -> Path -> To -> Setting]
  - Set to: [Required value or configuration]
  - Notes: [Any important details]

## Verification

After completing setup, verify with:

```bash
# [Verification commands]
```

Expected results:
- [What success looks like]

---

**Once all items complete:** Mark status as "Complete" at top of file.
```

---

## When to Generate

Generate `{phase}-USER-SETUP.md` when plan frontmatter contains `user_setup` field.

**Trigger:** `user_setup` exists in PLAN.md frontmatter and has items.

**Location:** Same directory as PLAN.md and SUMMARY.md.

**Timing:** Generated during execute-plan.md after tasks complete, before SUMMARY.md creation.

---

## Frontmatter Schema

In PLAN.md, `user_setup` declares human-required configuration:

```yaml
user_setup:
  - service: stripe
    why: "Payment processing requires API keys"
    env_vars:
      - name: STRIPE_SECRET_KEY
        source: "Stripe Dashboard -> Developers -> API keys -> Secret key"
      - name: STRIPE_WEBHOOK_SECRET
        source: "Stripe Dashboard -> Developers -> Webhooks -> Signing secret"
    dashboard_config:
      - task: "Create webhook endpoint"
        location: "Stripe Dashboard -> Developers -> Webhooks -> Add endpoint"
        details: "URL: https://[your-domain]/api/webhooks/stripe, Events: checkout.session.completed, customer.subscription.*"
    local_dev:
      - "Run: stripe listen --forward-to localhost:3000/api/webhooks/stripe"
      - "Use the webhook secret from CLI output for local testing"
```

---

## The Automation-First Rule

**USER-SETUP.md contains ONLY what Claude literally cannot do.**

| Claude CAN Do (not in USER-SETUP) | Claude CANNOT Do (-> USER-SETUP) |
|-----------------------------------|--------------------------------|
| `npm install stripe` | Create Stripe account |
| Write webhook handler code | Get API keys from dashboard |
| Create `.env.local` file structure | Copy actual secret values |
| Run `stripe listen` | Authenticate Stripe CLI (browser OAuth) |
| Configure package.json | Access external service dashboards |
| Write any code | Retrieve secrets from third-party systems |

**The test:** "Does this require a human in a browser, accessing an account Claude doesn't have credentials for?"
- Yes -> USER-SETUP.md
- No -> Claude does it automatically

---

## Service-Specific Examples

<stripe_example>
```markdown
# Phase 10: User Setup Required

**Generated:** 2025-01-14
**Phase:** 10-monetization
**Status:** Incomplete

Complete these items for Stripe integration to function.

## Environment Variables

| Status | Variable | Source | Add to |
|--------|----------|--------|--------|
| [ ] | `STRIPE_SECRET_KEY` | Stripe Dashboard -> Developers -> API keys -> Secret key | `.env.local` |
| [ ] | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard -> Developers -> API keys -> Publishable key | `.env.local` |
| [ ] | `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard -> Developers -> Webhooks -> [endpoint] -> Signing secret | `.env.local` |

## Account Setup

- [ ] **Create Stripe account** (if needed)
  - URL: https://dashboard.stripe.com/register
  - Skip if: Already have Stripe account

## Dashboard Configuration

- [ ] **Create webhook endpoint**
  - Location: Stripe Dashboard -> Developers -> Webhooks -> Add endpoint
  - Endpoint URL: `https://[your-domain]/api/webhooks/stripe`
  - Events to send:
    - `checkout.session.completed`
    - `customer.subscription.created`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`

- [ ] **Create products and prices** (if using subscription tiers)
  - Location: Stripe Dashboard -> Products -> Add product
  - Create each subscription tier
  - Copy Price IDs to:
    - `STRIPE_STARTER_PRICE_ID`
    - `STRIPE_PRO_PRICE_ID`

## Local Development

For local webhook testing:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
Use the webhook signing secret from CLI output (starts with `whsec_`).

## Verification

After completing setup:

```bash
# Check env vars are set
grep STRIPE .env.local

# Verify build passes
npm run build

# Test webhook endpoint (should return 400 bad signature, not 500 crash)
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected: Build passes, webhook returns 400 (signature validation working).

---

**Once all items complete:** Mark status as "Complete" at top of file.
```
</stripe_example>

<topstepx_example>
```markdown
# Phase 1: User Setup Required

**Generated:** 2025-02-10
**Phase:** 01-api-connection
**Status:** Incomplete

Complete these items for TopStepX API integration to function.

## Environment Variables

| Status | Variable | Source | Add to |
|--------|----------|--------|--------|
| [ ] | `TOPSTEPX_USERNAME` | Your TopStepX account email address | `.env` |
| [ ] | `TOPSTEPX_API_KEY` | TopStepX account settings -> API Keys -> Generate Key | `.env` |

## Account Setup

- [ ] **Create TopStepX account** (if needed)
  - URL: https://www.topstepx.com/
  - Note: Requires funded trading account or evaluation account for API access
  - Skip if: Already have TopStepX account with API access

- [ ] **Enable API access**
  - Location: TopStepX account settings -> API section
  - Generate an API key for programmatic access
  - Copy the key immediately (may only be shown once)

## Dashboard Configuration

- [ ] **Note your account ID(s)**
  - Location: TopStepX dashboard -> Accounts section
  - Record your trading account ID(s) for API calls
  - Note: Bot will auto-discover accounts via GET /api/Account/search, but knowing your account ID helps verify

## Verification

After completing setup:

```bash
# Check env vars are set
grep TOPSTEPX .env

# Test authentication (bot will do this on startup)
# Expected: JWT token returned, account list retrieved
node -e "
  const username = process.env.TOPSTEPX_USERNAME;
  const apiKey = process.env.TOPSTEPX_API_KEY;
  console.log('Username:', username ? 'SET' : 'MISSING');
  console.log('API Key:', apiKey ? 'SET (' + apiKey.length + ' chars)' : 'MISSING');
"
```

Expected: Both variables set, API key is a non-empty string.

---

**Once all items complete:** Mark status as "Complete" at top of file.
```
</topstepx_example>

<supabase_example>
```markdown
# Phase 2: User Setup Required

**Generated:** 2025-01-14
**Phase:** 02-authentication
**Status:** Incomplete

Complete these items for Supabase Auth to function.

## Environment Variables

| Status | Variable | Source | Add to |
|--------|----------|--------|--------|
| [ ] | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard -> Settings -> API -> Project URL | `.env.local` |
| [ ] | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard -> Settings -> API -> anon public | `.env.local` |
| [ ] | `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard -> Settings -> API -> service_role | `.env.local` |

## Account Setup

- [ ] **Create Supabase project**
  - URL: https://supabase.com/dashboard/new
  - Skip if: Already have project for this app

## Dashboard Configuration

- [ ] **Enable Email Auth**
  - Location: Supabase Dashboard -> Authentication -> Providers
  - Enable: Email provider
  - Configure: Confirm email (on/off based on preference)

- [ ] **Configure OAuth providers** (if using social login)
  - Location: Supabase Dashboard -> Authentication -> Providers
  - For Google: Add Client ID and Secret from Google Cloud Console
  - For GitHub: Add Client ID and Secret from GitHub OAuth Apps

## Verification

After completing setup:

```bash
# Check env vars
grep SUPABASE .env.local

# Verify connection (run in project directory)
npx supabase status
```

---

**Once all items complete:** Mark status as "Complete" at top of file.
```
</supabase_example>

---

## Guidelines

**Never include:** Actual secret values. Steps Claude can automate (package installs, code changes).

**Naming:** `{phase}-USER-SETUP.md` matches the phase number pattern.
**Status tracking:** User marks checkboxes and updates status line when complete.
**Searchability:** `grep -r "USER-SETUP" .planning/` finds all phases with user requirements.
