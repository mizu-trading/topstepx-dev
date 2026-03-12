#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');

const VERSION = require('../package.json').version;
const SKILL_NAME = 'topstepx-api';

// ── Platform definitions ──────────────────────────────────────────────

const PLATFORMS = {
  claude: {
    name: 'Claude Code',
    local: (cwd) => path.join(cwd, '.claude', 'skills', SKILL_NAME),
    global: () => path.join(os.homedir(), '.claude', 'skills', SKILL_NAME),
  },
  opencode: {
    name: 'OpenCode',
    local: (cwd) => path.join(cwd, '.opencode', 'skills', SKILL_NAME),
    global: () => path.join(os.homedir(), '.config', 'opencode', 'skills', SKILL_NAME),
  },
  codex: {
    name: 'Codex CLI',
    local: (cwd) => path.join(cwd, '.agents', 'skills', SKILL_NAME),
    global: () => path.join(os.homedir(), '.agents', 'skills', SKILL_NAME),
  },
  gemini: {
    name: 'Gemini CLI',
    local: (cwd) => path.join(cwd, '.gemini', 'skills', SKILL_NAME),
    global: () => path.join(os.homedir(), '.gemini', 'skills', SKILL_NAME),
  },
};

const PLATFORM_KEYS = Object.keys(PLATFORMS);

// ── Helpers ───────────────────────────────────────────────────────────

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function ask(rl, question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

function printBanner() {
  console.log('');
  console.log('  topstepx-skill v' + VERSION);
  console.log('  TopStepX API skill installer for AI coding assistants');
  console.log('');
}

// ── CLI argument parsing ──────────────────────────────────────────────

function parseArgs(argv) {
  const args = argv.slice(2);
  const result = { platforms: [], scope: null };

  for (const arg of args) {
    if (arg === '--claude') result.platforms.push('claude');
    else if (arg === '--opencode') result.platforms.push('opencode');
    else if (arg === '--codex') result.platforms.push('codex');
    else if (arg === '--gemini') result.platforms.push('gemini');
    else if (arg === '--all') result.platforms = [...PLATFORM_KEYS];
    else if (arg === '--global') result.scope = 'global';
    else if (arg === '--local') result.scope = 'local';
    else if (arg === '--help' || arg === '-h') {
      console.log('  Usage: npx topstepx-skill [options]');
      console.log('');
      console.log('  Platform flags:');
      console.log('    --claude      Install for Claude Code');
      console.log('    --opencode    Install for OpenCode');
      console.log('    --codex       Install for Codex CLI');
      console.log('    --gemini      Install for Gemini CLI');
      console.log('    --all         Install for all platforms');
      console.log('');
      console.log('  Scope flags:');
      console.log('    --global      Install to user home (available everywhere)');
      console.log('    --local       Install to current project directory');
      console.log('');
      console.log('  Examples:');
      console.log('    npx topstepx-skill                    # Interactive');
      console.log('    npx topstepx-skill --claude --global  # Claude Code, global');
      console.log('    npx topstepx-skill --all --local      # All platforms, local');
      console.log('');
      process.exit(0);
    }
  }

  // Deduplicate
  result.platforms = [...new Set(result.platforms)];
  return result;
}

// ── Interactive prompts ───────────────────────────────────────────────

async function promptPlatform(rl) {
  console.log('  Which platform(s) do you want to install for?');
  console.log('');
  console.log('    1) Claude Code');
  console.log('    2) OpenCode');
  console.log('    3) Codex CLI');
  console.log('    4) Gemini CLI');
  console.log('    5) All of the above');
  console.log('');

  const answer = (await ask(rl, '  Enter choice (1-5): ')).trim();

  switch (answer) {
    case '1': return ['claude'];
    case '2': return ['opencode'];
    case '3': return ['codex'];
    case '4': return ['gemini'];
    case '5': return [...PLATFORM_KEYS];
    default:
      console.log('  Invalid choice. Please try again.');
      console.log('');
      return promptPlatform(rl);
  }
}

async function promptScope(rl) {
  console.log('');
  console.log('  Where should the skill be installed?');
  console.log('');
  console.log('    1) Global  (available in all projects)');
  console.log('    2) Local   (current project only)');
  console.log('');

  const answer = (await ask(rl, '  Enter choice (1-2): ')).trim();

  switch (answer) {
    case '1': return 'global';
    case '2': return 'local';
    default:
      console.log('  Invalid choice. Please try again.');
      return promptScope(rl);
  }
}

// ── Install logic ─────────────────────────────────────────────────────

function install(platforms, scope) {
  const skillSrc = path.join(__dirname, '..', 'skills', SKILL_NAME);
  const cwd = process.cwd();
  const installed = [];

  for (const key of platforms) {
    const platform = PLATFORMS[key];
    const dest = scope === 'global' ? platform.global() : platform.local(cwd);

    try {
      copyDirSync(skillSrc, dest);
      installed.push({ name: platform.name, path: dest });
    } catch (err) {
      console.error(`  Error installing for ${platform.name}: ${err.message}`);
    }
  }

  return installed;
}

// ── Main ──────────────────────────────────────────────────────────────

async function main() {
  printBanner();

  const parsed = parseArgs(process.argv);
  let platforms = parsed.platforms;
  let scope = parsed.scope;

  // Interactive mode if missing args
  if (platforms.length === 0 || scope === null) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    try {
      if (platforms.length === 0) {
        platforms = await promptPlatform(rl);
      }
      if (scope === null) {
        scope = await promptScope(rl);
      }
    } finally {
      rl.close();
    }
  }

  console.log('');
  const installed = install(platforms, scope);

  if (installed.length > 0) {
    console.log('  Installed successfully:');
    console.log('');
    for (const item of installed) {
      console.log(`    ${item.name} -> ${item.path}`);
    }
    console.log('');
    console.log('  The TopStepX API skill is now available. Mention "TopStepX"');
    console.log('  in your conversation and the skill will activate automatically.');
    console.log('');
  } else {
    console.log('  No platforms were installed.');
    console.log('');
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
