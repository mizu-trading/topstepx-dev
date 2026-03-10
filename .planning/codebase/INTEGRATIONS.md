# External Integrations

**Analysis Date:** 2026-03-10

## Important Context

This package itself has NO runtime integrations. It is a CLI installer that copies Markdown files. However, the skill content it installs documents the TopStepX (ProjectX Gateway) trading API extensively. The integrations below describe what the **skill teaches AI assistants to build**, not what this package itself connects to.

## APIs & External Services

**TopStepX REST API:**
- Base URL: `https://api.topstepx.com`
- All endpoints use POST with JSON bodies
- Auth: JWT Bearer token (24h validity)
- Rate limits: 200 req/60s general, 50 req/30s for historical bars
- Documented in: `skills/topstepx-api/SKILL.md`, `skills/topstepx-api/references/rest-api.md`

**TopStepX SignalR WebSocket Hubs:**
- User Hub: `https://rtc.topstepx.com/hubs/user` - account, order, position, trade events
- Market Hub: `https://rtc.topstepx.com/hubs/market` - quotes, trades, depth of market
- Auth: JWT token via query parameter (`?access_token=<token>`) and `accessTokenFactory`
- Transport: WebSocket only, skip negotiation, auto-reconnect
- Documented in: `skills/topstepx-api/references/realtime.md`

**SignalR Client Libraries (referenced for consumers):**
- JavaScript: `@microsoft/signalr` (npm)
- Python: `signalrcore` or `pysignalr` (pip)
- C# / .NET: `Microsoft.AspNetCore.SignalR.Client` (NuGet)
- Java: `com.microsoft.signalr` (Maven/Gradle)
- Go: `github.com/philippseith/signalr`
- Rust: Manual WebSocket implementation
- Documented in: `skills/topstepx-api/references/realtime.md`

## Data Storage

**Databases:**
- None. This package does not use any database.

**File Storage:**
- Local filesystem only. The installer copies files from the npm package to platform-specific skill directories.

**Caching:**
- None

## Authentication & Identity

**TopStepX API Authentication (documented in skill content):**
- API Key Login: `POST /api/Auth/loginKey` with `userName` + `apiKey`
- Application Login: `POST /api/Auth/loginApp` with `userName`, `password`, `deviceId`, `appId`, `verifyKey`
- Token Refresh: `POST /api/Auth/validate` with existing Bearer token
- Tokens valid for 24 hours
- Documented in: `skills/topstepx-api/SKILL.md`, `skills/topstepx-api/references/rest-api.md`

**Package Authentication:**
- None. The installer requires no authentication.

## Monitoring & Observability

**Error Tracking:**
- None

**Logs:**
- Console output only (`console.log`, `console.error`) in `bin/install.js`

## CI/CD & Deployment

**Hosting:**
- npm registry (package distribution)
- GitHub repository: `https://github.com/mizu-trading/topstepx-skill`

**CI Pipeline:**
- None detected. No CI/CD configuration files present.

## Environment Configuration

**Required env vars:**
- None for the installer itself

**Consumer env vars (documented in skill content):**
- TopStepX username
- TopStepX API key (for bot authentication)
- TopStepX application credentials (for app authentication): password, deviceId, appId, verifyKey

**Secrets location:**
- No secrets stored in the repository. The skill documentation instructs consumers to manage their own credentials.

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## AI Platform Integrations

The installer copies skill files to these platform-specific directories:

| Platform | Local Path | Global Path |
|----------|-----------|-------------|
| Claude Code | `<cwd>/.claude/skills/topstepx-api/` | `~/.claude/skills/topstepx-api/` |
| OpenCode | `<cwd>/.opencode/skills/topstepx-api/` | `~/.config/opencode/skills/topstepx-api/` |
| Codex CLI | `<cwd>/.agents/skills/topstepx-api/` | `~/.agents/skills/topstepx-api/` |
| Gemini CLI | `<cwd>/.gemini/skills/topstepx-api/` | `~/.gemini/skills/topstepx-api/` |

Platform definitions are in `bin/install.js` (lines 13-34, the `PLATFORMS` object).

---

*Integration audit: 2026-03-10*
