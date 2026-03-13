#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');

const VERSION = require('../package.json').version;
const SKILL_NAME = 'topstepx-api';
const REPO_ROOT = path.join(__dirname, '..');

// ── Platform definitions ──────────────────────────────────────────────

const PLATFORMS = {
  claude: {
    name: 'Claude Code',
    baseDir: (scope, cwd) => scope === 'global'
      ? path.join(os.homedir(), '.claude')
      : path.join(cwd, '.claude'),
    pathPrefix: '$HOME/.claude/topstepx/',
    commandFormat: 'md-nested',   // commands/tsx/*.md
    agentFormat: 'claude',
  },
  opencode: {
    name: 'OpenCode',
    baseDir: (scope, cwd) => scope === 'global'
      ? path.join(os.homedir(), '.config', 'opencode')
      : path.join(cwd, '.opencode'),
    pathPrefix: '$HOME/.config/opencode/topstepx/',
    commandFormat: 'md-flat',     // commands/tsx-*.md
    agentFormat: 'opencode',
  },
  gemini: {
    name: 'Gemini CLI',
    baseDir: (scope, cwd) => scope === 'global'
      ? path.join(os.homedir(), '.gemini')
      : path.join(cwd, '.gemini'),
    pathPrefix: '$HOME/.gemini/topstepx/',
    commandFormat: 'toml',        // commands/tsx/*.toml
    agentFormat: 'gemini',
  },
  codex: {
    name: 'Codex CLI',
    baseDir: (scope, cwd) => scope === 'global'
      ? path.join(os.homedir(), '.codex')
      : path.join(cwd, '.codex'),
    pathPrefix: '$HOME/.codex/topstepx/',
    commandFormat: 'skill',       // skills/tsx-*/SKILL.md
    agentFormat: 'codex',
  },
};

const PLATFORM_KEYS = Object.keys(PLATFORMS);

// ── Tool name mappings ────────────────────────────────────────────────

const CLAUDE_TO_OPENCODE_TOOLS = {
  Read: 'read', Write: 'write', Edit: 'edit', Bash: 'bash',
  Glob: 'glob', Grep: 'grep', Task: 'task', TodoWrite: 'todo_write',
  WebFetch: 'web_fetch', WebSearch: 'web_search', SlashCommand: 'slash_command',
  AskUserQuestion: 'question',
};

const CLAUDE_TO_GEMINI_TOOLS = {
  Read: 'read_file', Write: 'write_file', Edit: 'replace',
  Bash: 'execute_command', Glob: 'glob', Grep: 'grep',
};

// ── Path rewriting ────────────────────────────────────────────────────

function rewritePaths(content, platform) {
  if (platform === 'claude') return content;

  const targetPrefix = PLATFORMS[platform].pathPrefix;
  // Replace @$HOME/.claude/topstepx/ (@ file references) first, then bare paths
  return content
    .replace(/@\$HOME\/\.claude\/topstepx\//g, '@' + targetPrefix)
    .replace(/\$HOME\/\.claude\/topstepx\//g, targetPrefix);
}

// ── Frontmatter parsing ───────────────────────────────────────────────

function parseFrontmatter(content) {
  // Normalize line endings to LF for consistent parsing
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');
  if (lines[0].trim() !== '---') {
    return { frontmatter: {}, body: content };
  }

  let endIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      endIdx = i;
      break;
    }
  }

  if (endIdx === -1) {
    return { frontmatter: {}, body: content };
  }

  const fmLines = lines.slice(1, endIdx);
  const fm = {};
  let currentKey = null;
  let inArray = false;

  for (const line of fmLines) {
    // Skip comments
    if (line.trim().startsWith('#')) continue;

    // Array item (starts with "  - ")
    const arrayMatch = line.match(/^\s+-\s+(.+)$/);
    if (arrayMatch && currentKey && inArray) {
      if (!Array.isArray(fm[currentKey])) fm[currentKey] = [];
      fm[currentKey].push(arrayMatch[1].trim());
      continue;
    }

    // Key-value pair
    const kvMatch = line.match(/^([a-zA-Z_-]+):\s*(.*)$/);
    if (kvMatch) {
      const key = kvMatch[1].trim();
      const value = kvMatch[2].trim();

      if (value === '') {
        // Could be start of array or multiline
        currentKey = key;
        inArray = true;
        fm[key] = [];
      } else {
        // Inline value - could be comma-separated list
        fm[key] = value;
        currentKey = key;
        inArray = false;
      }
    }
  }

  const body = lines.slice(endIdx + 1).join('\n');
  return { frontmatter: fm, body };
}

// Parse tools from frontmatter value (handles both array and inline comma-separated)
function parseToolsList(fm) {
  // Check allowed-tools (commands) or tools (agents)
  const toolsValue = fm['allowed-tools'] || fm['tools'];
  if (!toolsValue) return [];

  if (Array.isArray(toolsValue)) {
    return toolsValue.map(t => t.trim());
  }

  // Inline comma-separated: "Read, Write, Bash"
  if (typeof toolsValue === 'string') {
    return toolsValue.split(',').map(t => t.trim()).filter(Boolean);
  }

  return [];
}

// ── Command transformations ───────────────────────────────────────────

function transformCommandForPlatform(filename, content, platform) {
  switch (platform) {
    case 'claude':
      return { name: filename, content: rewritePaths(content, platform) };

    case 'opencode':
      return transformCommandOpenCode(filename, content);

    case 'gemini':
      return transformCommandGemini(filename, content);

    case 'codex':
      return transformCommandCodex(filename, content);

    default:
      return { name: filename, content };
  }
}

function transformCommandOpenCode(filename, content) {
  // Flatten name: help.md -> tsx-help.md
  const flatName = 'tsx-' + filename;

  const { frontmatter: fm, body } = parseFrontmatter(content);
  const tools = parseToolsList(fm);

  // Build OpenCode frontmatter
  const lines = ['---'];
  if (fm.name) lines.push(`name: ${fm.name}`);
  if (fm.description) lines.push(`description: ${fm.description}`);
  if (fm['argument-hint']) lines.push(`argument-hint: ${fm['argument-hint']}`);
  if (fm['argument-instructions']) lines.push(`argument-instructions: ${fm['argument-instructions']}`);

  // Convert tools to object format
  if (tools.length > 0) {
    lines.push('tools:');
    for (const tool of tools) {
      const mapped = CLAUDE_TO_OPENCODE_TOOLS[tool] || tool.toLowerCase();
      // Skip mcp__ prefixed tools (not applicable to OpenCode)
      if (mapped.startsWith('mcp__')) continue;
      lines.push(`  ${mapped}: true`);
    }
  }

  lines.push('---');

  const rewritten = rewritePaths(body, 'opencode');
  return { name: flatName, content: lines.join('\n') + '\n' + rewritten };
}

function transformCommandGemini(filename, content) {
  // Convert .md to .toml
  const tomlName = filename.replace(/\.md$/, '.toml');

  const { frontmatter: fm, body } = parseFrontmatter(content);

  // Escape ${VAR} in prompt body to prevent Gemini template engine conflicts
  const escapedBody = body.replace(/\$\{/g, '\\${');
  const rewrittenBody = rewritePaths(escapedBody, 'gemini');

  const description = (fm.description || '').replace(/"/g, '\\"');

  const tomlContent = `description = "${description}"\nprompt = """\n${rewrittenBody.trim()}\n"""\n`;
  return { name: tomlName, content: tomlContent };
}

function transformCommandCodex(filename, content) {
  // Convert to skill directory format: tsx-{name}/SKILL.md
  const baseName = filename.replace(/\.md$/, '');
  const skillDirName = 'tsx-' + baseName;

  const { frontmatter: fm, body } = parseFrontmatter(content);

  // Convert /tsx:command-name references to $tsx-command-name
  let transformed = body.replace(/\/tsx:([a-zA-Z0-9_-]+)/g, '\\$tsx-$1');

  // Replace $ARGUMENTS with {{TSX_ARGS}}
  transformed = transformed.replace(/\$ARGUMENTS/g, '{{TSX_ARGS}}');

  // Rewrite paths
  transformed = rewritePaths(transformed, 'codex');

  // Build adapter header
  const adapterHeader = [
    '> **Codex Adapter:** This command was converted from Claude Code format.',
    '> Tool translations: Read=read_file, Write=write_file, Edit=replace, Bash=execute_command',
    '',
  ].join('\n');

  // Build SKILL.md content with minimal frontmatter
  const skillContent = [
    '---',
    `name: ${fm.name || 'tsx-' + baseName}`,
    `description: ${fm.description || ''}`,
    '---',
    '',
    adapterHeader,
    transformed,
  ].join('\n');

  return { name: skillDirName, content: skillContent, isSkillDir: true };
}

// ── Agent transformations ─────────────────────────────────────────────

function transformAgentForPlatform(filename, content, platform) {
  switch (platform) {
    case 'claude':
      return { name: filename, content: rewritePaths(content, platform) };

    case 'opencode':
      return transformAgentOpenCode(filename, content);

    case 'gemini':
      return transformAgentGemini(filename, content);

    case 'codex':
      return transformAgentCodex(filename, content);

    default:
      return { name: filename, content };
  }
}

function transformAgentOpenCode(filename, content) {
  const { frontmatter: fm, body } = parseFrontmatter(content);
  const tools = parseToolsList(fm);

  const lines = ['---'];
  if (fm.name) lines.push(`name: ${fm.name}`);
  if (fm.description) lines.push(`description: ${fm.description}`);

  // Convert tools to object format
  if (tools.length > 0) {
    lines.push('tools:');
    for (const tool of tools) {
      // Skip mcp__ prefixed tools
      if (tool.startsWith('mcp__')) continue;
      const mapped = CLAUDE_TO_OPENCODE_TOOLS[tool] || tool.toLowerCase();
      lines.push(`  ${mapped}: true`);
    }
  }

  if (fm.skills) {
    const skillsArr = Array.isArray(fm.skills) ? fm.skills : [fm.skills];
    lines.push('skills:');
    for (const s of skillsArr) {
      lines.push(`  - ${s}`);
    }
  }

  lines.push('---');

  const rewritten = rewritePaths(body, 'opencode');
  return { name: filename, content: lines.join('\n') + '\n' + rewritten };
}

function transformAgentGemini(filename, content) {
  const { frontmatter: fm, body } = parseFrontmatter(content);
  const tools = parseToolsList(fm);
  const agentName = filename.replace(/\.md$/, '');

  const lines = ['---'];
  lines.push(`name: ${agentName}`);
  if (fm.description) lines.push(`description: ${fm.description}`);

  // Convert tools to snake_case names
  if (tools.length > 0) {
    lines.push('tools:');
    for (const tool of tools) {
      // Skip mcp__ prefixed tools
      if (tool.startsWith('mcp__')) continue;
      const mapped = CLAUDE_TO_GEMINI_TOOLS[tool];
      if (mapped) {
        lines.push(`  - ${mapped}`);
      }
    }
  }

  if (fm.skills) {
    const skillsArr = Array.isArray(fm.skills) ? fm.skills : [fm.skills];
    lines.push('skills:');
    for (const s of skillsArr) {
      lines.push(`  - ${s}`);
    }
  }

  // Omit 'color' field per plan
  lines.push('---');

  const rewritten = rewritePaths(body, 'gemini');
  return { name: filename, content: lines.join('\n') + '\n' + rewritten };
}

function transformAgentCodex(filename, content) {
  const baseName = filename.replace(/\.md$/, '');
  const skillDirName = baseName; // already tsx-prefixed

  const { frontmatter: fm, body } = parseFrontmatter(content);

  // Convert /tsx:command-name references to $tsx-command-name
  let transformed = body.replace(/\/tsx:([a-zA-Z0-9_-]+)/g, '\\$tsx-$1');

  // Rewrite paths
  transformed = rewritePaths(transformed, 'codex');

  const skillContent = [
    '---',
    `name: ${fm.name || baseName}`,
    `description: ${fm.description || ''}`,
    '---',
    '',
    transformed,
  ].join('\n');

  return { name: skillDirName, content: skillContent, isSkillDir: true };
}

// ── File copying helpers ──────────────────────────────────────────────

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

function copyWithTransform(srcDir, destDir, transformFn) {
  if (!fs.existsSync(srcDir)) return 0;
  fs.mkdirSync(destDir, { recursive: true });
  let count = 0;

  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);

    if (entry.isDirectory()) {
      count += copyWithTransform(srcPath, path.join(destDir, entry.name), transformFn);
    } else {
      const content = fs.readFileSync(srcPath, 'utf8');
      const transformed = transformFn ? transformFn(content) : content;
      const destPath = path.join(destDir, entry.name);
      fs.writeFileSync(destPath, transformed, 'utf8');
      count++;
    }
  }

  return count;
}

function countFilesRecursive(dir) {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      count += countFilesRecursive(path.join(dir, entry.name));
    } else {
      count++;
    }
  }
  return count;
}

// ── Core install operations ───────────────────────────────────────────

function installCommands(baseDir, platformKey) {
  const cmdSrc = path.join(REPO_ROOT, 'commands', 'tsx');
  if (!fs.existsSync(cmdSrc)) return 0;

  const platform = PLATFORMS[platformKey];
  let count = 0;

  const files = fs.readdirSync(cmdSrc).filter(f => f.endsWith('.md'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(cmdSrc, file), 'utf8');
    const result = transformCommandForPlatform(file, content, platformKey);

    if (result.isSkillDir) {
      // Codex: write to skills/tsx-{name}/SKILL.md
      const skillDir = path.join(baseDir, 'skills', result.name);
      fs.mkdirSync(skillDir, { recursive: true });
      fs.writeFileSync(path.join(skillDir, 'SKILL.md'), result.content, 'utf8');
    } else if (platform.commandFormat === 'md-flat') {
      // OpenCode: write to commands/tsx-*.md (flat in commands/)
      const cmdDir = path.join(baseDir, 'commands');
      fs.mkdirSync(cmdDir, { recursive: true });
      fs.writeFileSync(path.join(cmdDir, result.name), result.content, 'utf8');
    } else {
      // Claude & Gemini: write to commands/tsx/*.{md,toml}
      const cmdDir = path.join(baseDir, 'commands', 'tsx');
      fs.mkdirSync(cmdDir, { recursive: true });
      fs.writeFileSync(path.join(cmdDir, result.name), result.content, 'utf8');
    }

    count++;
  }

  return count;
}

function installAgents(baseDir, platformKey) {
  const agentSrc = path.join(REPO_ROOT, 'topstepx', 'agents');
  if (!fs.existsSync(agentSrc)) return 0;

  let count = 0;
  const files = fs.readdirSync(agentSrc).filter(f => f.endsWith('.md'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(agentSrc, file), 'utf8');
    const result = transformAgentForPlatform(file, content, platformKey);

    if (result.isSkillDir) {
      // Codex: write to skills/tsx-{name}/SKILL.md
      const skillDir = path.join(baseDir, 'skills', result.name);
      fs.mkdirSync(skillDir, { recursive: true });
      fs.writeFileSync(path.join(skillDir, 'SKILL.md'), result.content, 'utf8');
    } else {
      // All others: write to agents/tsx-*.md
      const agentDir = path.join(baseDir, 'agents');
      fs.mkdirSync(agentDir, { recursive: true });
      fs.writeFileSync(path.join(agentDir, result.name), result.content, 'utf8');
    }

    count++;
  }

  return count;
}

function installCore(baseDir, platformKey) {
  const coreSrc = path.join(REPO_ROOT, 'topstepx');
  if (!fs.existsSync(coreSrc)) return 0;

  const coreDest = path.join(baseDir, 'topstepx');
  let count = 0;

  // Copy entire topstepx/ directory EXCEPT topstepx/agents/ (agents copied separately)
  const transformFn = (content) => rewritePaths(content, platformKey);

  function copyRecursive(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      // Skip agents directory (handled by installAgents)
      if (src === coreSrc && entry.name === 'agents') continue;

      if (entry.isDirectory()) {
        copyRecursive(srcPath, destPath);
      } else {
        // Only transform text files, copy binary files as-is
        if (isTextFile(entry.name)) {
          const content = fs.readFileSync(srcPath, 'utf8');
          fs.writeFileSync(destPath, transformFn(content), 'utf8');
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
        count++;
      }
    }
  }

  copyRecursive(coreSrc, coreDest);
  return count;
}

function installSkills(baseDir) {
  const skillSrc = path.join(REPO_ROOT, 'skills', SKILL_NAME);
  if (!fs.existsSync(skillSrc)) return 0;

  const dest = path.join(baseDir, 'skills', SKILL_NAME);
  copyDirSync(skillSrc, dest);
  return countFilesRecursive(dest);
}

function isTextFile(filename) {
  const textExts = ['.md', '.txt', '.js', '.cjs', '.mjs', '.json', '.yaml', '.yml',
                    '.toml', '.ts', '.sh', '.bash', '.py', '.html', '.css', '.xml'];
  const ext = path.extname(filename).toLowerCase();
  return textExts.includes(ext) || ext === '';
}

// ── Helpers ───────────────────────────────────────────────────────────

function ask(rl, question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

function printBanner() {
  console.log('');
  console.log('  topstepx-dev v' + VERSION);
  console.log('  TSX Framework installer for AI coding assistants');
  console.log('');
}

// ── CLI argument parsing ──────────────────────────────────────────────

function parseArgs(argv) {
  const args = argv.slice(2);
  const result = { platforms: [], scope: null, uninstall: false, dryRun: false };

  for (const arg of args) {
    if (arg === '--claude') result.platforms.push('claude');
    else if (arg === '--opencode') result.platforms.push('opencode');
    else if (arg === '--codex') result.platforms.push('codex');
    else if (arg === '--gemini') result.platforms.push('gemini');
    else if (arg === '--all') result.platforms = [...PLATFORM_KEYS];
    else if (arg === '--global') result.scope = 'global';
    else if (arg === '--local') result.scope = 'local';
    else if (arg === '--uninstall') result.uninstall = true;
    else if (arg === '--dry-run') result.dryRun = true;
    else if (arg === '--help' || arg === '-h') {
      console.log('  Usage: npx topstepx-dev [options]');
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
      console.log('  Actions:');
      console.log('    --uninstall   Remove TSX framework files from target platform');
      console.log('    --dry-run     Preview install/uninstall without modifying files');
      console.log('');
      console.log('  Examples:');
      console.log('    npx topstepx-dev                    # Interactive');
      console.log('    npx topstepx-dev --claude --global  # Claude Code, global');
      console.log('    npx topstepx-dev --all --local      # All platforms, local');
      console.log('    npx topstepx-dev --uninstall --claude --global  # Uninstall');
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
  console.log('  Where should the framework be installed?');
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

function install(platforms, scope, dryRun) {
  const cwd = process.cwd();
  const installed = [];
  const tmpDirs = [];

  for (const key of platforms) {
    const platform = PLATFORMS[key];
    let baseDir = platform.baseDir(scope, cwd);

    if (dryRun) {
      // Use temp directory for dry-run
      baseDir = path.join(os.tmpdir(), 'tsx-dryrun-' + key + '-' + Date.now());
      tmpDirs.push(baseDir);
    }

    try {
      const cmdCount = installCommands(baseDir, key);
      const agentCount = installAgents(baseDir, key);
      const coreCount = installCore(baseDir, key);
      const skillCount = installSkills(baseDir);

      installed.push({
        name: platform.name,
        path: baseDir,
        counts: { commands: cmdCount, agents: agentCount, core: coreCount, skills: skillCount },
        total: cmdCount + agentCount + coreCount + skillCount,
        dryRun,
      });
    } catch (err) {
      console.error(`  Error installing for ${platform.name}: ${err.message}`);
    }
  }

  // Clean up temp directories for dry-run
  if (dryRun) {
    for (const dir of tmpDirs) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
      } catch (_) { /* ignore cleanup errors */ }
    }
  }

  return installed;
}

// ── Uninstall logic ───────────────────────────────────────────────────

function isTsxPath(p) {
  const normalized = p.replace(/\\/g, '/');
  return normalized.includes('tsx') || normalized.includes('topstepx');
}

function uninstall(platforms, scope, dryRun) {
  const cwd = process.cwd();
  const results = [];

  for (const key of platforms) {
    const platform = PLATFORMS[key];
    const baseDir = platform.baseDir(scope, cwd);
    const removals = [];

    // 1. Commands
    if (key === 'opencode') {
      // OpenCode: remove flattened tsx-*.md from commands/
      const cmdDir = path.join(baseDir, 'commands');
      if (fs.existsSync(cmdDir)) {
        for (const file of fs.readdirSync(cmdDir)) {
          if (file.startsWith('tsx-') && file.endsWith('.md')) {
            const filePath = path.join(cmdDir, file);
            if (isTsxPath(filePath)) {
              if (!dryRun) fs.unlinkSync(filePath);
              removals.push(filePath);
            }
          }
        }
      }
    } else if (key === 'codex') {
      // Codex: remove skills/tsx-*/ directories (command skills)
      const skillsDir = path.join(baseDir, 'skills');
      if (fs.existsSync(skillsDir)) {
        for (const entry of fs.readdirSync(skillsDir)) {
          if (entry.startsWith('tsx-') && isTsxPath(entry)) {
            const dirPath = path.join(skillsDir, entry);
            if (fs.statSync(dirPath).isDirectory()) {
              if (!dryRun) fs.rmSync(dirPath, { recursive: true });
              removals.push(dirPath);
            }
          }
        }
      }
    } else {
      // Claude & Gemini: remove commands/tsx/ directory
      const tsxCmdDir = path.join(baseDir, 'commands', 'tsx');
      if (fs.existsSync(tsxCmdDir) && isTsxPath(tsxCmdDir)) {
        if (!dryRun) fs.rmSync(tsxCmdDir, { recursive: true });
        removals.push(tsxCmdDir);
      }
    }

    // 2. Agents: remove tsx-*.md files from agents/
    const agentsDir = path.join(baseDir, 'agents');
    if (fs.existsSync(agentsDir)) {
      for (const file of fs.readdirSync(agentsDir)) {
        if (file.startsWith('tsx-') && file.endsWith('.md')) {
          const filePath = path.join(agentsDir, file);
          if (isTsxPath(filePath)) {
            if (!dryRun) fs.unlinkSync(filePath);
            removals.push(filePath);
          }
        }
      }
    }

    // 3. Core: remove topstepx/ directory
    const topstepxDir = path.join(baseDir, 'topstepx');
    if (fs.existsSync(topstepxDir) && isTsxPath(topstepxDir)) {
      if (!dryRun) fs.rmSync(topstepxDir, { recursive: true });
      removals.push(topstepxDir);
    }

    // 4. Skills: remove skills/topstepx-api/ directory
    const skillDir = path.join(baseDir, 'skills', SKILL_NAME);
    if (fs.existsSync(skillDir) && isTsxPath(skillDir)) {
      if (!dryRun) fs.rmSync(skillDir, { recursive: true });
      removals.push(skillDir);
    }

    results.push({
      name: platform.name,
      path: baseDir,
      removals,
      dryRun,
    });
  }

  return results;
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

  if (parsed.uninstall) {
    // Uninstall mode
    const results = uninstall(platforms, scope, parsed.dryRun);
    const prefix = parsed.dryRun ? '  [DRY-RUN] ' : '  ';

    let anyRemoved = false;
    for (const result of results) {
      if (result.removals.length > 0) {
        anyRemoved = true;
        console.log(`${prefix}Uninstalled from ${result.name}:`);
        console.log(`${prefix}  Removed ${result.removals.length} items from ${result.path}`);
      } else {
        console.log(`${prefix}No TSX installation found for ${result.name} at ${result.path}`);
      }
    }

    if (!anyRemoved) {
      console.log(`${prefix}Nothing to uninstall.`);
    }
    console.log('');
  } else {
    // Install mode
    const installed = install(platforms, scope, parsed.dryRun);
    const prefix = parsed.dryRun ? '  [DRY-RUN] ' : '  ';

    if (installed.length > 0) {
      console.log(`${prefix}Installed successfully:`);
      console.log('');
      for (const item of installed) {
        console.log(`${prefix}  ${item.name} -> ${item.path}`);
        console.log(`${prefix}    ${item.counts.commands} commands, ${item.counts.agents} agents, ${item.counts.core} core files, ${item.counts.skills} skill files`);
      }
      console.log('');
      if (!parsed.dryRun) {
        console.log('  The TSX framework is now available. Use /tsx:help to see');
        console.log('  available commands, or /tsx:new-project to start a new project.');
      }
      console.log('');
    } else {
      console.log('  No platforms were installed.');
      console.log('');
    }
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
