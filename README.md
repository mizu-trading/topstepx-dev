# TopStepX API Plugin for Claude Code

A Claude Code plugin that teaches Claude how to build integrations with the [TopStepX](https://topstepx.com) (ProjectX Gateway) trading API in any programming language.

## Installation

```bash
git clone https://github.com/mizu-trading/topstepx-skill.git
claude mcp add-plugin topstepx-api -- /path/to/topstepx-skill
```

See [full installation options](#installation-options) below.

## What It Does

When you mention TopStepX in a conversation, Claude automatically gains full knowledge of the API — authentication, REST endpoints, real-time WebSocket streaming, enums, and best practices. It can then generate correct integration code in Python, JavaScript, C#, Go, Rust, or any other language.

**Covers the full API surface:**

- Authentication (API key + application login, token refresh)
- Account management
- Contract and market data lookup
- Historical OHLCV bar retrieval
- Order placement, modification, and cancellation (with bracket orders)
- Position management (open, close, partial close)
- Trade history
- Real-time streaming via SignalR WebSockets (User Hub + Market Hub)

## Installation Options

### Option 1: Add to your project (recommended)

Add the plugin to a specific project so it activates whenever you work in that directory:

```bash
claude mcp add-plugin topstepx-api -- https://github.com/mizu-trading/topstepx-skill
```

Or clone it locally and point to the directory:

```bash
git clone https://github.com/mizu-trading/topstepx-skill.git
claude mcp add-plugin topstepx-api -- /path/to/topstepx-skill
```

### Option 2: Install globally

Install for all projects on your machine. Add the following to your global Claude Code settings at `~/.claude/plugins.json`:

```json
{
  "plugins": [
    {
      "name": "topstepx-api",
      "path": "/path/to/topstepx-skill"
    }
  ]
}
```

### Option 3: Test locally (one-off session)

Run Claude Code with the plugin for a single session:

```bash
claude --plugin-dir /path/to/topstepx-skill
```

## Usage

Just mention TopStepX naturally in your conversation:

- "Build me a Python trading bot that connects to TopStepX"
- "Create a C# app that streams real-time quotes from TopStepX"
- "Help me place a bracket order on TopStepX using JavaScript"
- "How do I authenticate with the ProjectX Gateway API?"

The skill activates automatically — no slash commands needed.

## Plugin Structure

```
topstepx-skill/
├── .claude-plugin/
│   └── plugin.json                     # Plugin manifest
├── skills/
│   └── topstepx-api/
│       ├── SKILL.md                    # Core API reference (auto-loaded)
│       └── references/
│           ├── rest-api.md             # Full REST endpoint documentation
│           ├── realtime.md             # SignalR WebSocket reference
│           └── enums.md               # Enum definitions
├── LICENSE
└── README.md
```

## License

MIT
