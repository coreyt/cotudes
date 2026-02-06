# ASE-000: Environment Setup

> **This is the setup etude for the Associate Software Engineer path.**
> There is no trap in this etude -- it is infrastructure.

## Overview

Before you can practice agent collaboration, you need a working environment.
This etude walks you through setting up an AI coding agent, configuring your
first project for agent interaction, and verifying that the feedback loops
(tests, linters, type checker) work correctly.

By the end of this setup, you will have:
- A working AI coding agent (Claude Code, Codex, or equivalent)
- A TypeScript project with tests, linting, and type checking
- A basic CLAUDE.md / AGENTS.md file
- Verified that the agent can run your build, tests, and lint commands

## Prerequisites

- Node.js 20+ installed
- npm or pnpm installed
- Git configured
- A terminal you're comfortable in
- Access to an AI coding agent (Claude Code recommended; Codex, Cursor, or
  similar will work for most etudes)

## Step 1: Install Your Agent

### Claude Code (recommended)
```bash
npm install -g @anthropic-ai/claude-code
```

Verify:
```bash
claude --version
```

### Alternative Agents

If using Codex, Jules, Cursor, or another agent, follow their installation
instructions. The etudes are designed to be agent-agnostic -- the principles
transfer.

## Step 2: Create Your Practice Project

Create a new TypeScript project that will serve as the codebase for the
Associate SE path:

```bash
mkdir cotude-practice && cd cotude-practice
npm init -y
npm install typescript @types/node vitest eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser --save-dev
```

Initialize TypeScript:
```bash
npx tsc --init --target ES2022 --module NodeNext --moduleResolution NodeNext --strict --outDir dist
```

Create the initial project structure:
```
cotude-practice/
├── src/
│   └── index.ts
├── tests/
│   └── index.test.ts
├── package.json
├── tsconfig.json
└── eslint.config.js
```

### src/index.ts
```typescript
export function add(a: number, b: number): number {
  return a + b;
}
```

### tests/index.test.ts
```typescript
import { describe, it, expect } from 'vitest';
import { add } from '../src/index';

describe('add', () => {
  it('adds two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('handles negative numbers', () => {
    expect(add(-1, 1)).toBe(0);
  });
});
```

### package.json scripts
Add these scripts to your package.json:
```json
{
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src/ tests/",
    "check": "tsc --noEmit && eslint src/ tests/ && vitest run"
  }
}
```

## Step 3: Verify Your Feedback Loops

Run each command and confirm it works:

```bash
npm run build     # Should compile without errors
npm test          # Should pass 2 tests
npm run lint      # Should report no issues
npm run check     # Should pass all three checks
```

These commands are your **feedback loops**. When you work with an agent, the
agent will use these commands to verify its own output. If these don't work, the
agent is working blind.

## Step 4: Create Your First CLAUDE.md

Create a file called `CLAUDE.md` in the project root:

```markdown
# Project: cotude-practice

## Commands
- Build: `npm run build`
- Test: `npm test`
- Lint: `npm run lint`
- Full check: `npm run check`

## Stack
- TypeScript (strict mode)
- Vitest for testing
- ESLint for linting

## Conventions
- All source code in `src/`
- All tests in `tests/`, named `*.test.ts`
- Use explicit return types on exported functions
- Prefer `const` over `let`
- No `any` types
```

This file will be read by your agent at the start of every session. It provides
the persistent context that prevents the agent from guessing about your project's
conventions.

## Step 5: Verify Agent Integration

Start your agent in the project directory:

```bash
cd cotude-practice
claude   # or your agent's start command
```

Ask the agent to:
1. Read the CLAUDE.md
2. Run the tests
3. Add a `multiply` function to `src/index.ts` with tests

Verify that:
- [ ] The agent found and read CLAUDE.md
- [ ] The agent ran `npm test` (not a different test command)
- [ ] The new function has an explicit return type
- [ ] The tests are in the correct directory
- [ ] `npm run check` passes after the agent's changes

If all checkboxes pass, your environment is ready.

## Step 6: Create Your Interaction Log

Create a file called `interaction-log.md` in the project root. You'll use this
throughout the Associate SE path to record your reflections on each etude.

```markdown
# Interaction Log

## ASE-000: Setup
- Date:
- Agent used:
- Notes:
  - [What was your first impression of the agent?]
  - [Did anything surprise you about how it interacted with the project?]
  - [What questions do you have going into ASE-001?]
```

## What's Next

You're ready for **ASE-001: The Vague Request**, where you'll learn why
"build me a TODO app" is the most expensive sentence in agent-assisted
development.
