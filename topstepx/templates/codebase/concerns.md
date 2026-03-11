# Codebase Concerns Template

Template for `.planning/codebase/CONCERNS.md` - captures known issues and areas requiring care.

**Purpose:** Surface actionable warnings about the codebase. Focused on "what to watch out for when making changes."

---

## File Template

```markdown
# Codebase Concerns

**Analysis Date:** [YYYY-MM-DD]

## Tech Debt

**[Area/Component]:**
- Issue: [What's the shortcut/workaround]
- Why: [Why it was done this way]
- Impact: [What breaks or degrades because of it]
- Fix approach: [How to properly address it]

**[Area/Component]:**
- Issue: [What's the shortcut/workaround]
- Why: [Why it was done this way]
- Impact: [What breaks or degrades because of it]
- Fix approach: [How to properly address it]

## Known Bugs

**[Bug description]:**
- Symptoms: [What happens]
- Trigger: [How to reproduce]
- Workaround: [Temporary mitigation if any]
- Root cause: [If known]
- Blocked by: [If waiting on something]

**[Bug description]:**
- Symptoms: [What happens]
- Trigger: [How to reproduce]
- Workaround: [Temporary mitigation if any]
- Root cause: [If known]

## Security Considerations

**[Area requiring security care]:**
- Risk: [What could go wrong]
- Current mitigation: [What's in place now]
- Recommendations: [What should be added]

**[Area requiring security care]:**
- Risk: [What could go wrong]
- Current mitigation: [What's in place now]
- Recommendations: [What should be added]

## Performance Bottlenecks

**[Slow operation/endpoint]:**
- Problem: [What's slow]
- Measurement: [Actual numbers: "500ms p95", "2s load time"]
- Cause: [Why it's slow]
- Improvement path: [How to speed it up]

**[Slow operation/endpoint]:**
- Problem: [What's slow]
- Measurement: [Actual numbers]
- Cause: [Why it's slow]
- Improvement path: [How to speed it up]

## Fragile Areas

**[Component/Module]:**
- Why fragile: [What makes it break easily]
- Common failures: [What typically goes wrong]
- Safe modification: [How to change it without breaking]
- Test coverage: [Is it tested? Gaps?]

**[Component/Module]:**
- Why fragile: [What makes it break easily]
- Common failures: [What typically goes wrong]
- Safe modification: [How to change it without breaking]
- Test coverage: [Is it tested? Gaps?]

## Scaling Limits

**[Resource/System]:**
- Current capacity: [Numbers: "100 req/sec", "10k users"]
- Limit: [Where it breaks]
- Symptoms at limit: [What happens]
- Scaling path: [How to increase capacity]

## Dependencies at Risk

**[Package/Service]:**
- Risk: [e.g., "deprecated", "unmaintained", "breaking changes coming"]
- Impact: [What breaks if it fails]
- Migration plan: [Alternative or upgrade path]

## Missing Critical Features

**[Feature gap]:**
- Problem: [What's missing]
- Current workaround: [How users cope]
- Blocks: [What can't be done without it]
- Implementation complexity: [Rough effort estimate]

## Test Coverage Gaps

**[Untested area]:**
- What's not tested: [Specific functionality]
- Risk: [What could break unnoticed]
- Priority: [High/Medium/Low]
- Difficulty to test: [Why it's not tested yet]

---

*Concerns audit: [date]*
*Update as issues are fixed or new ones discovered*
```

<good_examples>
```markdown
# Codebase Concerns

**Analysis Date:** 2025-01-20

## Tech Debt

**Database queries in React components:**
- Issue: Direct Supabase queries in 15+ page components instead of server actions
- Files: `app/dashboard/page.tsx`, `app/profile/page.tsx`, `app/courses/[id]/page.tsx`, `app/settings/page.tsx` (and 11 more in `app/`)
- Why: Rapid prototyping during MVP phase
- Impact: Can't implement RLS properly, exposes DB structure to client
- Fix approach: Move all queries to server actions in `app/actions/`, add proper RLS policies

**Manual webhook signature validation:**
- Issue: Copy-pasted Stripe webhook verification code in 3 different endpoints
- Files: `app/api/webhooks/stripe/route.ts`, `app/api/webhooks/checkout/route.ts`, `app/api/webhooks/subscription/route.ts`
- Why: Each webhook added ad-hoc without abstraction
- Impact: Easy to miss verification in new webhooks (security risk)
- Fix approach: Create shared `lib/stripe/validate-webhook.ts` middleware

## Known Bugs

**Race condition in subscription updates:**
- Symptoms: User shows as "free" tier for 5-10 seconds after successful payment
- Trigger: Fast navigation after Stripe checkout redirect, before webhook processes
- Files: `app/checkout/success/page.tsx` (redirect handler), `app/api/webhooks/stripe/route.ts` (webhook)
- Workaround: Stripe webhook eventually updates status (self-heals)
- Root cause: Webhook processing slower than user navigation, no optimistic UI update
- Fix: Add polling in `app/checkout/success/page.tsx` after redirect

## Security Considerations

**Admin role check client-side only:**
- Risk: Admin dashboard pages check isAdmin from Supabase client, no server verification
- Files: `app/admin/page.tsx`, `app/admin/users/page.tsx`, `components/AdminGuard.tsx`
- Current mitigation: None (relying on UI hiding)
- Recommendations: Add middleware to admin routes in `middleware.ts`, verify role server-side

## Performance Bottlenecks

**/api/courses endpoint:**
- Problem: Fetching all courses with nested lessons and authors
- File: `app/api/courses/route.ts`
- Measurement: 1.2s p95 response time with 50+ courses
- Cause: N+1 query pattern (separate query per course for lessons)
- Improvement path: Use Prisma include to eager-load lessons in `lib/db/courses.ts`, add Redis caching

## Fragile Areas

**Authentication middleware chain:**
- File: `middleware.ts`
- Why fragile: 4 different middleware functions run in specific order (auth -> role -> subscription -> logging)
- Common failures: Middleware order change breaks everything, hard to debug
- Safe modification: Add tests before changing order, document dependencies in comments
- Test coverage: No integration tests for middleware chain (only unit tests)

## Scaling Limits

**Supabase Free Tier:**
- Current capacity: 500MB database, 1GB file storage, 2GB bandwidth/month
- Limit: ~5000 users estimated before hitting limits
- Symptoms at limit: 429 rate limit errors, DB writes fail
- Scaling path: Upgrade to Pro ($25/mo) extends to 8GB DB, 100GB storage

## Dependencies at Risk

**react-hot-toast:**
- Risk: Unmaintained (last update 18 months ago), React 19 compatibility unknown
- Impact: Toast notifications break, no graceful degradation
- Migration plan: Switch to sonner (actively maintained, similar API)

## Missing Critical Features

**Payment failure handling:**
- Problem: No retry mechanism or user notification when subscription payment fails
- Current workaround: Users manually re-enter payment info (if they notice)
- Blocks: Can't retain users with expired cards, no dunning process
- Implementation complexity: Medium (Stripe webhooks + email flow + UI)

## Test Coverage Gaps

**Payment flow end-to-end:**
- What's not tested: Full Stripe checkout -> webhook -> subscription activation flow
- Risk: Payment processing could break silently (has happened twice)
- Priority: High
- Difficulty to test: Need Stripe test fixtures and webhook simulation setup

---

*Concerns audit: 2025-01-20*
*Update as issues are fixed or new ones discovered*
```
</good_examples>

<guidelines>
**What belongs in CONCERNS.md:**
- Tech debt with clear impact and fix approach
- Known bugs with reproduction steps
- Security gaps and mitigation recommendations
- Performance bottlenecks with measurements
- Fragile code that breaks easily
- Scaling limits with numbers
- Dependencies that need attention
- Missing features that block workflows
- Test coverage gaps

**What does NOT belong here:**
- Opinions without evidence ("code is messy")
- Complaints without solutions ("auth sucks")
- Future feature ideas (that's for product planning)
- Normal TODOs (those live in code comments)
- Architectural decisions that are working fine
- Minor code style issues

**When filling this template:**
- **Always include file paths** - Concerns without locations are not actionable. Use backticks: `src/file.ts`
- Be specific with measurements ("500ms p95" not "slow")
- Include reproduction steps for bugs
- Suggest fix approaches, not just problems
- Focus on actionable items
- Prioritize by risk/impact
- Update as issues get resolved
- Add new concerns as discovered

**Tone guidelines:**
- Professional, not emotional ("N+1 query pattern" not "terrible queries")
- Solution-oriented ("Fix: add index" not "needs fixing")
- Risk-focused ("Could expose user data" not "security is bad")
- Factual ("3.5s load time" not "really slow")

**Useful for phase planning when:**
- Deciding what to work on next
- Estimating risk of changes
- Understanding where to be careful
- Prioritizing improvements
- Onboarding new Claude contexts
- Planning refactoring work

**How this gets populated:**
Explore agents detect these during codebase mapping. Manual additions welcome for human-discovered issues. This is living documentation, not a complaint list.
</guidelines>
