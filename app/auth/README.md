# Auth feature

Sign in / registration / password recovery. The mode (`login` / `register` / `forgot` / `reset`)
is driven by the `mode` search param, not by local state, so it survives remounts and deep links.
`reset` is the only mode that cannot be reached by a search param alone — it is rendered by the
`/reset` route, which passes the verified `oobCode` and email in as a prop.

Files:
- `auth.tsx` — screen layout, field/tab configuration, mode-dependent visibility.
- `authField.tsx` — one memoized labelled input with the password visibility toggle.
- `useAuthForm.ts` — form state (Compact Reducer), validation, Firebase calls, mode switching.
- `../components/tokenScreen.tsx` — the logo + spinner screen shared by every route reached from a
  mail link (`/invite`, `/reset`), plus `useTokenGuard`.
- Firebase calls live in `lib/auth.ts`; error code → message mapping in `../components/authError.tsx`
  (shared with `settings`).

## Modes

| Mode       | Tabs                               | Visible fields         | Submit button  |
|------------|------------------------------------|------------------------|----------------|
| `login`    | Login **active**                   | email, password        | Sign in        |
| `register` | Register **active**                | name, email, pwd, conf | Create account |
| `forgot`   | Both deselected, but pressable     | email                  | Send mail      |
| `reset`    | Both deselected, but pressable     | password, confirm      | Save password  |

## #forgot-flow

`sendReset` calls `sendPasswordResetEmail` with a continue URL pointing at `/reset`. On success the
info line "Check your email and follow the link" is shown and the submit button is locked for 60
seconds (`cooldown`, ticked down by a self-rescheduling effect) so the user cannot spam the mailer.
Firebase itself is what actually rate-limits; the cooldown only makes that visible.

## #reset-route

`/reset` handles every Firebase email link, picked apart by the `mode` parameter — see
`../reset/README.md#action-modes`. The `resetPassword` branch verifies the code with
`verifyPasswordResetCode` **before** rendering the form, because the code also tells us which email
the link belongs to — that email is what we sign in with afterwards, so the user never has to type
it. While verification is in flight the shared `TokenScreen` is displayed, which is why `/reset`
looks identical to `/invite` for that moment.

## #reset-flow

On submit: `confirmPasswordReset` → `signIn` with the email from the verified code → `createSession`
(exchanges the Firebase id token for the httpOnly `session` cookie) → `/dashboard`. Failures are
mapped through `authError`, including `auth/expired-action-code` and `auth/invalid-action-code`.

## #email-changed-notice

An address change signs the tab that applied it out (`../reset/README.md#email-modes`), landing here
with `?emailChanged=1`. `useAuthForm` turns that into the same `infoStatus`/`infoMessage` line used
by `#forgot-flow` — "sign in with your new address" — and strips the param so a reload does not
replay it.

## #invite-route

`/invite` accepts a group invite by its `token` param. It waits for `AuthProvider` to resolve the
user (the middleware guarantees a session cookie exists, but the Firebase client user resolves
asynchronously), then finds the invite, checks expiry and the target email, joins the group and
deletes the invite document. A `handled` ref makes the acceptance run exactly once even if the auth
state re-emits.

## #token-guard

`useTokenGuard(invalid)` is the shared behaviour for both token routes: when the token is missing or
rejected, `TokenScreen` shows the error for two seconds and then replaces the route with
`/dashboard` for a signed-in user or `/auth?mode=login` for anyone else. This is why a bare
`/invite` or `/reset` never renders an empty screen.

## #stable-field-refs

`useAuthForm` caches one ref callback per field name in `refCallbacks` instead of creating
`(el) => {refs.current[name] = el}` inline on every render. A fresh function identity would make
React call the old callback with `null` and the new one with the element on every single render, so
`shake()` would fire against an element that momentarily is not there.

## #per-field-stable-handlers

`auth.tsx` builds the `onChange` / `onToggle` maps once with `useMemo` so each memoized `AuthField`
keeps the same handler identity across renders; building them inside `.map()` would defeat `memo`.
