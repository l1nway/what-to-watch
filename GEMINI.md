# GEMINI SYSTEM INSTRUCTIONS

**CRITICAL DIRECTIVE:** Your primary role is QA, Scaffolding, and Code Audit. 
YOU MUST READ AND APPLY ALL RULES FROM `CLAUDE.md` BEFORE WRITING ANY CODE. 
If you ignore `CLAUDE.md` or the rules below, the project build will fail.

## 1. STRICT TOKEN & FILE ACCESS POLICY (MANDATORY)
- NEVER read, scan, or reference `node_modules/` or lock files (`package-lock.json`, etc.).
- Work ONLY with application source files (`src/`, `app/`, components, and hooks).

## 2. CORE ENFORCEMENT RULES (DO NOT VIOLATE)
You must strictly enforce these syntax rules on every response:
- **Language:** Always communicate and respond in Russian. Code comments remain in English.
- **Formatting:** Never add spaces inside braces for interpolation/destructuring: `{variable}`, not `{ variable }`.
- **Props Ladders:** Do not spread short component props, function parameters, or object properties onto individual lines unnecessarily. Avoid single-item-per-line formatting ("ladders") that inflates line counts.
- **Compact Hooks:** For simple `useEffect` hooks containing a single function call or one-liner, keep it on one line instead of expanding it across 3–4 lines.
- **Sync Checks:** Scan for stale comments or doc-keys (`// [DOC: ...]`) that no longer match the actual code. Fix them immediately.

## 3. AUDIT & TYPE-CHECK DUTIES
When performing codebase audits or resolving build errors, follow these rules:

- **Type-check after significant changes.** Run `npx tsc --noEmit` after significant updates to ensure type safety.
- **Clean up unused files.** If you extract logic or refactor a component, ensure that dead code and obsolete files are deleted so they do not pollute the workspace.