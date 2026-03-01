# AGENTS.md — MultiCortex
*Deploy to: project root of MultiCortex repo*
*Last updated: S76 | 2026-02-28*

---

## What This Is

MultiCortex is Warren's local-first tactical second brain — a mobile app built with Expo/React Native. Designed for autonomous reasoning with multiple specialized AI modes (Mode A, Mode B, Mode C) routed through the APEX Router, with a Neural Construct reasoning interface.

This is an offline-first system. No cloud dependencies unless explicitly added. All state lives on-device.

---

## System Architecture

```
User (mobile)
    ↓
React Native UI (Expo)
    ↓
APEX Router — intent classification, mode dispatch
    ↓
Mode A: [base reasoning]
Mode B: [extended reasoning]
Mode C: [deep reasoning / Neural Construct]
    ↓
Adapter layer — AI provider abstraction
    ↓
Local state (on-device)
```

---

## Stack

- **Framework:** Expo (React Native)
- **Language:** TypeScript
- **State:** Local-first, on-device
- **Testing:** Jest / Expo test runner

---

## Rules

**Before declaring done:**
1. Run `npx expo export` or `npm run build` — zero errors
2. Run `npx jest` or `npm test` — all tests pass
3. Verify TypeScript: `npx tsc --noEmit`

**Never:**
- Add cloud state dependencies without explicit instruction (offline-first is an invariant)
- Modify the APEX Router dispatch table without explicit instruction
- Break the Mode A/B/C separation — each mode has defined scope
- Add native modules that require ejecting from Expo managed workflow

**Always:**
- Create rollback tag before major changes: `git tag pre-codex-$(date +%s)`
- Test on both iOS and Android mental model (Expo abstraction handles platform specifics)
- Keep adapter layer thin — AI provider logic lives in adapters, not components
- No `any` types in adapter layer or APEX Router

---

## Commit Message Format

```
fix: <description>
feat: <description>
refactor: <description>
```

---

## Test Command

```bash
npx jest           # unit tests
npx tsc --noEmit   # type check
npx expo export    # build check
```

---

## Coding Standards

- TypeScript strict — no implicit `any`
- React Native: functional components + hooks only
- Navigation: follow existing Expo Router pattern (do not introduce new navigation lib)
- State: follow existing state management pattern (do not introduce Redux/Zustand without approval)
- Async: `async/await` throughout
- Errors: always handle, always log before throw

---

## Protected Files

- `app.json` / `app.config.ts` — Expo config (do not modify without explicit instruction)
- APEX Router core dispatch logic — high-impact, test thoroughly before modifying
- `.env` / API keys — never touch, never log

---

*This file is read by Codex before every task. Keep it current.*