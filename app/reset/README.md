# /reset route

The single landing page for every Firebase email link.

Files:
- `reset.tsx` — reads `mode` + `oobCode` and picks the flow.
- `passwordReset.tsx` — password recovery; verifies the code, then renders `auth` in `reset` mode.
- `emailAction.tsx` — address verification and address change; applies the code and redirects.

## #action-modes

Firebase supports **one** action URL per project, shared by all email templates, so the route
cannot be split per feature. Every template points at `/reset`, and Firebase itself appends the
parameters that tell the flows apart:

| `mode`                 | Sent by                    | Handled as                        | Ends at      |
|------------------------|----------------------------|-----------------------------------|--------------|
| `resetPassword`        | `sendPasswordResetEmail`   | `PasswordReset`                   | `/dashboard` |
| `verifyEmail`          | `sendEmailVerification`    | `EmailAction`                     | `/settings`  |
| `verifyAndChangeEmail` | `verifyBeforeUpdateEmail`  | `EmailAction change`              | `/settings`  |
| `recoverEmail`         | Firebase, on a reverted change | `EmailAction change`          | `/settings`  |

`recoverEmail` shares the `change` branch because it also leaves the account on a different address
than the one the document mirrors — the direction of the change does not matter, only that the
mirror has to be rewritten from `user.email` afterwards.

An unknown `mode`, or a link with no `mode`/`oobCode` at all, is treated exactly like an expired
code: the error is shown for two seconds and `useTokenGuard` redirects
(`auth/README.md#token-guard`). The parameters are read on the client, so `page.tsx` keeps the whole
route inside a `Suspense` whose fallback is the plain `TokenScreen`: without it a valid link would
flash the "invalid" screen for the render in which the params are not resolved yet.

The route is public in the middleware **and** exempt from the "signed-in users get bounced to
`/dashboard`" rule: a mail link has to work whether or not this browser holds a session.

## #email-modes

Both modes read `pendingEmail` off `users/{uid}` **before** calling `applyActionCode`, because
applying it clears that field. They differ after that:

- `verifyEmail` (the address does not change) always reloads the Firebase user after `applyCode`,
  success or not — the SDK's cached `user` object does not pick up the account's own
  `emailVerified` flag on its own, and `/settings` reads that field synchronously on mount, so
  skipping the reload on the success path left the confirm button showing until something else
  (a manual page reload) happened to refresh it. Once reloaded, `emailStatus: 'verified'` is
  mirrored into the document and the tab redirects to `/settings`.
- the `change` modes (`verifyAndChangeEmail`, `recoverEmail`) never reload the user or touch
  `user.email` at all. Applying a code that changes the account's address can revoke **this tab's
  own session token as a side effect**, even though the call itself needs no session — if this
  browser happens to already hold a Firebase session for the same account (the usual case: the
  confirmation link is opened while `/settings` is still open in another tab), that session's
  refresh token is invalidated the instant the change lands, and every following call on it —
  reload, a Firestore write, anything — becomes unreliable. So the mirror write uses the
  `pendingEmail` value read before the call, not `user.email`, and the tab signs itself out
  (`signOut` + `POST /api/logout`) and redirects to `/auth?mode=login&emailChanged=1` instead of
  `/settings`: continuing to use a session whose token can die at any moment only produces the
  broken half-logged-in state described in `settings/README.md#email-status`. `useAuthForm` turns
  `emailChanged` into the sign-in notice.
- Address is also considered proven the moment the code applies: the user could only have reached
  it by opening a link mailed to that address, so `emailStatus` is written as `'verified'`
  unconditionally, without a separate confirmation step.

A failure sends the user to `/settings?emailError=<code>` instead — see
`settings/README.md#email-failure`.

## #already-applied

An `oobCode` is single-use, so opening the same link twice — a second tab, a reload, a prefetching
mail client, or the production domain followed by a local copy of the URL — makes the second visit
fail with `auth/invalid-action-code` although the first one did exactly what the user wanted:

- `verifyEmail` succeeded if, after a reload, `user.emailVerified` is now `true`.
- a `change` mode is treated as already applied if `users/{uid}` still carried a `pendingEmail` from
  before this call — the only signal available once this tab's own session can no longer be trusted
  (see `#email-modes`). A code that never ran at all leaves no `pendingEmail` behind, so a genuinely
  invalid or expired link still reaches `#email-failure`.

If the account already reflects the link's effect, the failure is dropped and the flow finishes
normally.
