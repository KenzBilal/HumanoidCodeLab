# Contributing to Humanoid Code Lab

Thank you for your interest in contributing! This document explains how to get started.

## Development Setup

```bash
# 1. Clone the repo
git clone https://github.com/KenzBilal/HumanoidCodeLab.git
cd HumanoidCodeLab

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env
# Fill in your AI provider keys in .env

# 4. Start the development server
npm run dev
```

## Project Structure

```
HumanoidCodeLab/
├── electron/              # Electron main process (AI backend, keychain, serial)
├── src/
│   ├── components/        # React UI components
│   ├── engine/            # Core DSL interpreter, queue, humanoid model
│   └── store.ts           # Zustand + Zod state management
└── src/engine/Interpreter.test.ts  # Vitest unit tests
```

## Running Tests

```bash
npm test
```

All DSL grammar tests must pass before submitting a PR.

## TypeScript Checks

```bash
npm run lint
```

Zero type errors are required. No `any` escapes unless explicitly justified with a comment.

## Pull Request Guidelines

1. **Fork** the repo and create your branch from `main`.
2. **Describe** what the PR does in the body — include screenshots or test output for UI changes.
3. **Add tests** for any new DSL features or interpreter modifications.
4. **Run** `npm run lint && npm test` and confirm both pass before pushing.
5. Keep PRs focused — one feature or fix per PR.

## Reporting Bugs

Open a [GitHub Issue](https://github.com/KenzBilal/HumanoidCodeLab/issues) with:
- Steps to reproduce
- Expected vs actual behaviour
- OS and app version (`v{version}` shown in TopBar)

## Code Style

- TypeScript strict mode — no implicit `any`
- Component files use `.tsx`, engine files use `.ts`
- No default exports from engine files (use named exports)
- State mutations only via Zustand actions inside `store.ts`
