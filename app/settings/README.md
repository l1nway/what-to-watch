# Settings feature

Profile screen: avatar, personal data (name + email), password change and pending group invites.

Files:
- `settings.tsx` — page shell: header, the three cards, the invites list.
- `settingsHeader.tsx` — header controls; each one swaps itself for a spinner while its navigation runs.
- `personalCard.tsx` / `useProfile.ts` — name and email, including the confirm button and the email change flow.
- `passwordCard.tsx` / `usePassword.ts` — old/new/confirm password change through re-authentication.
- `useInvites.ts` — live query of the invites addressed to this user, plus accept/reject.
- `avatar.tsx` / `editor.tsx` — avatar picking and cropping.
- `../reset/emailAction.tsx` — the screen that applies the code from the confirmation mail.
- Firebase calls live in `lib/auth.ts`; error code → message mapping in `../components/authError.tsx`
  (shared with `auth`).

## #email-status

`users/{uid}` carries the whole email confirmation state, because it has to outlive the tab that
started it: the user leaves for their mailbox and may come back in a different tab or after a
reload.

| Field          | Meaning                                                                   |
|----------------|---------------------------------------------------------------------------|
| `emailStatus`  | `unverified` \| `pending` \| `verified`                                    |
| `pendingEmail` | the address awaiting confirmation; absent unless an **address change** is in flight |

`pendingEmail` is what tells the two `pending` cases apart: with it, the user is changing their
address; without it, they are confirming the address the account already has. Both fields are
written in a single `setDoc(…, {merge: true})`, so a reader never sees `verified` together with a
leftover `pendingEmail`, and a document that the create trigger has not written yet cannot make the
write fail.

The state is read with `onSnapshot`, not a one-off `getDoc`: the `/reset` link usually opens in
another tab, and the live subscription is what makes the spinner stop and the confirm button slide
away in the settings tab without a reload.

The status is **derived**, in this order, and the document is only one of the inputs:

1. `pendingEmail` present → `pending`. An address change has to win over everything else, because
   `emailVerified` stays `true` for the whole change (the account keeps its old, verified address
   until the link is followed) and would otherwise hide the change the moment it started.
2. Otherwise Firebase's own `emailVerified` decides between `verified` and `unverified`.
3. `emailStatus: 'pending'` in the document is what keeps a confirmation of the *current* address
   visible while it is in flight.

Whenever the derived status and the stored one disagree and nothing is pending, `useProfile` writes
the derived one back. A document created without any `emailStatus` is therefore seeded on first
render, and the case where the link was followed in a browser without a session — the route can
apply the code but cannot write to Firestore — repairs itself. If the subscription itself fails, the
status still falls back to `emailVerified`, so a rules problem cannot silently hide the confirm
button.

An address change can also leave the mirror stuck on `pending` with a `pendingEmail` that never gets
cleared: `../reset/README.md#email-modes` explains why the tab that applies the code cannot always
finish the Firestore write. `useProfile` self-heals this the next time the account is opened with a
valid session: if the stored `pendingEmail` matches `user.email`, the change plainly already landed,
so the field is treated as empty and the document is corrected (`emailStatus: 'verified'`,
`pendingEmail` cleared, `email` set to `user.email`) instead of showing "pending" indefinitely.

Firestore rules must let a signed-in user write `emailStatus` and `pendingEmail` on their own
`users/{uid}` document.

## #confirm-button

The confirm button belongs to **one** job: proving the address the account already has. It exists
while `emailStatus !== 'verified'` **and** no `pendingEmail` is set — an address change is finished
by following its link, not by pressing anything here, so the button must stay out of that flow.

It sits in the label row of the email field, wrapped in `SlideLeft`, so confirming the address makes
it slide out instead of disappearing. Its height is capped to the label's own line height (`h-5`),
because anything taller makes the whole row grow the moment the button slides in.

Pressing it sends a verification mail for the **current** address, moves the document
to `pending` (with no `pendingEmail`) and locks the button for 60 seconds — the same `cooldown`
pattern as the password recovery mail in `auth`. Firebase itself is what rate-limits; the countdown
only makes that visible.

## #email-change

Changing the address goes through `verifyBeforeUpdateEmail`, so the account keeps its old address
until the **new** one is proven to belong to the user. On save:

1. If the name changed too it is saved first and unconditionally — its spinner stops as soon as
   Firestore acknowledges it, independently of the email.
2. `sendEmailChange` mails the confirmation link, then the document is moved to
   `emailStatus: 'pending'` with `pendingEmail` set to the new address.
3. The email field keeps its spinner and shows the notice for as long as `pendingEmail` exists, so
   the pending change is still visible after a reload.

The input itself stays disabled while a change is pending: a second `verifyBeforeUpdateEmail` would
invalidate the first link without the user understanding why.

## #email-routes

Both confirmation mails land on `/reset`, which is the project's only Firebase action URL and picks
the flow from the `mode` parameter. The handling of the code itself lives there:
`../reset/README.md#action-modes` and `#email-modes`.

## #email-failure

A code that is expired, already used or rejected sends the user from `/reset` back to `/settings?emailError=<code>`,
and the document is reset to `unverified` with `pendingEmail` cleared. `useProfile` turns that
parameter into a message under the email field, restores the input to the address the account
actually has, shakes it, and strips the parameter from the URL so a reload does not replay the
error.

While an error is showing, the pencil next to the label is replaced by a warning triangle. It is
the same control: pressing it reopens the field for editing and clears the error, so retrying is
one click.

## #settings-state

Both hooks follow the Compact Reducer pattern with one flat state object each — `useProfile` alone
tracks ten fields, which is well past the point where separate `useState` calls stop being
readable. Per-field errors are flat keys (`oldError`, `newError`, …) rather than a nested object,
because `merge` is a shallow merge and a nested error map would have to be rebuilt by hand on every
dispatch.

Both hooks hand back one memoized object and cache their ref callbacks per field name, for the
reason described in `auth/README.md#stable-field-refs`.
