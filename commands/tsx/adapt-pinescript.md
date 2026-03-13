---
name: tsx:adapt-pinescript
description: Convert TradingView PineScript strategy to a live-tradeable TopStepX trading bot
argument-hint: "<pinescript-source>"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - Task
  - AskUserQuestion
---

<objective>
Convert a TradingView PineScript strategy into a working, live-tradeable TopStepX bot with all safety guardrails.

Routes to the adapt-pinescript workflow which handles PineScript parsing, repainting audit, MTF audit, conversion mapping, code generation, and SAF-01 through SAF-05 safety verification.
</objective>

<execution_context>
@$HOME/.claude/topstepx/workflows/adapt-pinescript.md
</execution_context>

<context>
Arguments: $ARGUMENTS (path to PineScript source file)
</context>

<process>
Execute the adapt-pinescript workflow end-to-end. Preserve all workflow gates (PineScript analysis, repainting audit, MTF audit, signal confirmation, code generation, safety verification).
</process>
