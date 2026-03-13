---
name: tsx:adapt-language
description: Convert TopStepX trading bot code between supported languages
argument-hint: "<source-path> --to <target-language>"
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
Convert an existing TopStepX trading bot from one supported language to another while preserving all trading logic, API integration patterns, and safety guardrails.

Routes to the adapt-language workflow which handles source code analysis, library mapping, code generation following trading build order, and safety verification gate.
</objective>

<execution_context>
@$HOME/.claude/topstepx/workflows/adapt-language.md
</execution_context>

<context>
Arguments: $ARGUMENTS (source path and target language)
</context>

<process>
Execute the adapt-language workflow end-to-end. Preserve all workflow gates (source analysis, library mapping, code generation, safety verification).
</process>
