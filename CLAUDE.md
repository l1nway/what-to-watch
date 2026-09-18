# Code Guidelines

## STRICT TOKEN & FILE ACCESS POLICY
- NEVER read, scan, or reference `node_modules/`, or lock files (`package-lock.json`, etc.).
- Work ONLY with application source files (`src/`, `app/`, components, and hooks).
- Keep context strictly minimal. Do not dump entire file contents unless explicitly requested.

## General Principles

- Use TypeScript.
- Write code as concisely and compactly as possible. Avoid boilerplate, unnecessary layers, and premature abstractions.
- Never add spaces inside braces for interpolation/destructuring: `{variable}`, not `{ variable }`; `{destructured}`, not `{ destructured }`.
- Comments in English only, and only for non-obvious groups of lines or functions. What the code does is visible in the code itself; comments explain *why*, not *what*.
- Avoid boilerplate: do not scatter `useState` calls or duplicate helper functions. If you have more than 3 state fields, use `useReducer`.
- Communication language: Always communicate and respond in Russian. Code comments remain in English.
- Prevent UI flickering: for synchronous updates before render, use `useLayoutEffect` instead of `useEffect`.

### Refactor Anti-Patterns

When you encounter code that violates any rule in this document, perform cautious refactoring:
- Remove the anti-pattern gradually, without large rewrites
- Verify tests and behavior after each step
- If refactoring requires significant changes, ask first whether it's worth doing
- Do not break functionality for the sake of style

Priority: functionality first, then style. If something clearly violates a rule and is easy to fix, fix it.

### On Every Edit: Context Check

**Before you finish any edit, even narrow ones:**
1. Ask yourself: "Does this change affect functionality, behavior, structure, or logic?" (Style tweaks, renames, imports alone = NO)
2. If YES → Check if a `README.md` exists in this folder. If it does, review it and update any stale sections.
3. Scan for stale comments or doc-keys (`// [DOC: ...]`) that no longer match the actual code. Fix them immediately.
4. If unsure whether README needs update, err on the side of updating — stale docs are worse than no docs.

This applies **on every single change**. Even narrow "change size X to Y" edits should trigger a quick context scan. Do not skip this.

---

## Code Formatting & Conciseness

### No Prop/Argument "Ladders"

Do not spread short component props, function parameters, or object properties onto individual lines unnecessarily. Avoid single-item-per-line formatting ("ladders") that inflates line counts. Keep compact attributes on the same line when readability is maintained.

**❌ Bad:**
```tsx
export function Members({
  visible,
  group,
  currentUserId,
  members,
  onClose,
}: MembersProps) {
```

**✅ Good:**
```tsx
export function Members({visible, group, currentUserId, members, onClose}: MembersProps) {
```

### Compact Single-Line useEffect

For simple `useEffect` hooks containing a single function call or one-liner, keep it on one line instead of expanding it across 3–4 lines.

**❌ Bad:**
```tsx
useEffect(() => {
  fetchUserData();
}, [userId]);
```

**✅ Good:**
```tsx
useEffect(() => {fetchUserData()}, [userId])
```

### Grouping Multiple Refs

Avoid copy-pasting multiple `useRef` declarations for related elements (e.g., form inputs). This creates unnecessary boilerplate. Combine them into a single ref object to keep the code compact.

**❌ Bad:**
```tsx
const loginRef = useRef<HTMLInputElement | null>(null)
const passwordRef = useRef<HTMLInputElement | null>(null)
const nameRef = useRef<HTMLInputElement | null>(null)
const confirmRef = useRef<HTMLInputElement | null>(null)
```

**✅ Good:**
```tsx
const refs = useRef({
  login: null as HTMLInputElement | null,
  password: null as HTMLInputElement | null,
  name: null as HTMLInputElement | null,
  confirm: null as HTMLInputElement | null,
})

// Usage:
// <input ref={(el) => { refs.current.login = el }} />
```

---

## State Management: Compact Reducer Pattern

Use the **Compact Reducer** pattern everywhere you manage object state: `useReducer`, contexts, custom hooks, event handlers. This is the cornerstone rule (see "General Principles": code must be concise). Instead of scattered `useState` calls and boilerplate `switch/case` actions, you merge partial updates:

```tsx
import {merge} from '@/utils/reducer'

const [state, dispatch] = useReducer(merge<State>, initialState)

// Usage
dispatch({field1: newValue}); // merges into prev, rest copied
dispatch({field1: val1, field2: val2}); // multiple fields at once
```

**Always import `merge` from `@/utils/reducer` — never re-declare it.** That one function is the
merge reducer for the whole app; a local `const merge = ...` / `function reducer(...)` copy inside a
feature file is the "duplicate helper functions" anti-pattern from "General Principles" and must be
replaced by the import on sight. It is the only reducer that needs a type argument at the call site
(`merge<State>`), which is also how you tell it apart from an ad-hoc reducer at a glance.

### Event Handlers

Use the same pattern in event handlers: instead of `setState(field, val)`, call `dispatch({field: val})`.

### Validation Always Happens Before Dispatch

**Validation ALWAYS occurs BEFORE dispatch**, never inside the reducer or after. If data reaches `dispatch`, it is already guaranteed valid and requires no checks in the reducer.

### Updater Variant

When a merge depends on the previous state, the same `merge` also accepts an updater function instead of a plain partial:

```tsx
// src/utils/reducer.ts
export const merge = <S extends object>(prev: S, next: Partial<S> | ((prev: S) => Partial<S>)): S =>
  ({...prev, ...(typeof next === 'function' ? next(prev) : next)})

dispatch((prev) => ({items: prev.items.filter((item) => item.id !== id)}))
```

### Async Remains Outside

The reducer stays synchronous. Async code lives in `useEffect` or event handlers that call `dispatch` after receiving data:

```tsx
useEffect(() => {
  fetchData().then(data => dispatch({loadedData: data, loading: false}));
}, []);
```

---

## Styling: Tailwind CSS

This project uses **Tailwind CSS** for styling. Do not use CSS Modules, styled-components, or React Native's `StyleSheet`.

- Use utility classes directly in the `className` prop.
- For dynamic classes, use `clsx` and `tailwind-merge` (typically via a `cn` utility function) to properly merge class names without conflicts.
- Avoid abstracting Tailwind classes into separate files or constants unless the exact same combination is reused extensively across multiple files. Keep styles inline for colocation.

```tsx
import { cn } from '@/lib/utils'

<div className={cn("flex flex-col p-4 bg-white", isActive && "bg-blue-50")}>
  Content
</div>
```

---

## File Organization

### File Fragmentation & Code Colocation

**Single-File Preference:** Do not over-fragment files prematurely. If a file (counting from the first import to the last line of code/export) is under ~200 lines total, keep everything in a single file — types, constants, helpers inline.

**When to Split:** Extract elements into separate files (e.g., `types.ts`, `constants.ts`) ONLY IF the file exceeds ~200 lines total. Do this regardless of whether those types/constants are reused elsewhere.

**Goal:** Minimize file jumping and reduce the number of tiny 10–50 line files. One focused file is easier to navigate than four half-empty sidecar files.

### Documentation, Clean Code & Synchronization

**Clean Source Code:** Keep code files clean. Do not write large architectural explanations, bug-tracking notes, or heavy comments inside `.ts`, `.tsx`, or `.js` files. Use standard, brief JSDoc comments only where necessary.

**When README is Needed:** Create a folder-level `README.md` for complex modules with multiple interrelated files, non-obvious business logic, critical invariants, or architectural decisions. Do NOT create README for small files or self-explanatory folders.

**MANDATORY & STRICT Synchronization:** 
- Whenever you modify code that changes/extends/reduces functionality, you MUST update the corresponding README.
- Never commit code without ensuring its documentation is current and correct.

#### Comment Extraction & Doc-Keys

**On Any File Edit:** Whenever you create, edit, or refactor code, scan for heavy comments. Move them to the folder's `README.md`, not the source file.

**Doc-Key Format (for Claude):** Replace extracted comments with a short reference tag: `// [DOC: key-name]`. The key should be lowercase, kebab-case, and match a heading in README.md.

---

## Hooks: Memoize by Default

Every hook must hand back stable references, not fresh ones on every render.

- Every function a hook returns is wrapped in `useCallback`.
- Every object, array, or derived value it returns is wrapped in `useMemo`.
- The hook's **own returned object** is wrapped in `useMemo` too, so consumers get one stable identity.
- Values that are already stable need no wrapper: `useRef` values, `useState`/`useReducer` setters, and `dispatch`.

---

## List Row Components: `memo` by Default

Once a component rendered many times from a list (via `.map()`) is extracted with its own name, wrap it in `memo` by default.

- **Callback props must be `useCallback`'d at the call site**, not just where the row happens to be rendered.
- **Prefer already-derived primitives/booleans over raw objects** for props.

---

## Accessibility & Semantic HTML

When building components, use correct semantic HTML elements (`<button>`, `<a>`, `<nav>`, `<main>`, etc.) instead of plain `<div>`s where applicable. Ensure interactive elements are keyboard accessible and have proper ARIA attributes if their purpose is not natively clear.
