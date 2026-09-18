# Shared components

`tokenScreen.tsx` backs routes that belong to other features, so it is documented there:
`auth/README.md#token-guard`.

## #slide-no-gap

`SlideDown` and `SlideLeft` animate their own wrapper's `height`/`width` from `0` to the
measured `scrollHeight`/`scrollWidth`, and both unmount their content when hidden
(`unmountOnExit`). Never put `gap-*` on a flex/grid container that has a `SlideDown`/`SlideLeft`
as a direct child: `gap` is applied the instant the child (re)mounts, before its height/width has
animated open, so the surrounding layout jumps by the gap amount instead of growing smoothly.

Instead, keep the container gap-free and put the spacing *inside* the slide — e.g. `pt-4` on the
child that `SlideDown` wraps — so the space is part of the animated `scrollHeight` and grows
together with the reveal. See `app/auth/auth.tsx` for the pattern (the bottom auth links) and
`FieldGroup`/`Button` in the same file for the alternative fix: `gap-0` on the container plus
manual spacing when the slide sits among other always-visible items.
