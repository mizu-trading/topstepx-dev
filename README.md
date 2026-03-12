# TopStepX API Skill

An AI coding skill that teaches coding assistants how to build integrations with the [TopStepX](https://topstepx.com) (ProjectX Gateway) trading API in any programming language.

Works with **Claude Code**, **OpenCode**, **Codex CLI**, and **Gemini CLI**.

## Installation

```bash
npx topstepx-skill
```

The installer will ask which platform(s) and whether to install globally or locally.

### Non-interactive

```bash
npx topstepx-skill --claude --global     # Claude Code, all projects
npx topstepx-skill --codex --local       # Codex CLI, current project
npx topstepx-skill --all --global        # All platforms, all projects
```

### Flags

| Flag | Description |
|------|-------------|
| `--claude` | Install for Claude Code |
| `--opencode` | Install for OpenCode |
| `--codex` | Install for Codex CLI |
| `--gemini` | Install for Gemini CLI |
| `--all` | Install for all platforms |
| `--global` | Install to user home directory |
| `--local` | Install to current project |

## What It Does

When you mention TopStepX in a conversation, your AI assistant automatically gains full knowledge of the API and can generate correct integration code in Python, JavaScript, C#, Go, Rust, or any other language.

**Covers the full API surface:**

- Authentication (API key + application login, token refresh)
- Account management
- Contract and market data lookup
- Historical OHLCV bar retrieval
- Order placement, modification, and cancellation (with bracket orders)
- Position management (open, close, partial close)
- Trade history
- Real-time streaming via SignalR WebSockets (User Hub + Market Hub)

## Usage

Just mention TopStepX naturally in your conversation:

- "Build me a Python trading bot that connects to TopStepX"
- "Create a C# app that streams real-time quotes from TopStepX"
- "Help me place a bracket order on TopStepX using JavaScript"
- "How do I authenticate with the ProjectX Gateway API?"

The skill activates automatically.

## Skill Structure

```
skills/topstepx-api/
├── SKILL.md                # Core API reference (auto-loaded on activation)
└── references/
    ├── rest-api.md         # Full REST endpoint documentation
    ├── realtime.md         # SignalR WebSocket reference
    └── enums.md            # Enum definitions
```

## Supported Platforms

| Platform | Project Location | Global Location |
|----------|-----------------|-----------------|
| Claude Code | `.claude/skills/topstepx-api/` | `~/.claude/skills/topstepx-api/` |
| OpenCode | `.opencode/skills/topstepx-api/` | `~/.config/opencode/skills/topstepx-api/` |
| Codex CLI | `.agents/skills/topstepx-api/` | `~/.agents/skills/topstepx-api/` |
| Gemini CLI | `.gemini/skills/topstepx-api/` | `~/.gemini/skills/topstepx-api/` |

## License

MIT
