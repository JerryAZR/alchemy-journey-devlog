# Additional clip types

Occasionally-useful clips beyond the core five. Same common fields (`rect`,
`startAt`, `endAt`, `transitionIn?`, `transitionOut?`, `zIndex?`) as every clip.

## animated-list

Bullet list whose items spring in one at a time.

- `items: string[]` - the bullets
- `stagger?` - frames between consecutive items (default 15)

If the clip's frame window is too short for `items.length * stagger`, the
effective stagger is compressed so the last item still appears before the clip
ends (never stretched to fill a long window). Keep lists short; one point per
item, matching the voiceover.

## progress

Outline checklist showing episode/section progress. Items can nest one level
via `children`.

- `title?` - heading above the list
- `items: { text, status, children? }[]` - status is `"done"` (checkmark,
  dimmed), `"current"` (accent highlight, pulsing marker) or `"todo"` (dimmed,
  empty marker)

Statuses are static per clip - to advance the "current" marker as the episode
progresses, use a sequence of progress clips anchored to successive lines,
each with updated statuses.

## countdown

Ring countdown timer: a ring sweeps each second, the remaining number counts
down, then a "GO!" springs in.

- `seconds?` - seconds to count down from (default 3)
- `goText?` - text shown when it finishes (default "GO!")

Rarely used in typical tutorials, but it is the natural way to demonstrate a
sync fence: end the clip with `offsetFrames` past the countdown's full length
plus a `sync` so the voiceover waits for zero:

```ts
{
  id: "count",
  type: "countdown",
  seconds: 3,
  rect: { x: "35%", y: "15%", w: "30%", h: "70%" },
  startAt: { line: "demo.countdown" },
  endAt: [{ line: "demo.countdown", offsetFrames: 140, sync: "demo.countdown" }],
}
```

## chapter-title

Numbered chapter card: small "Chapter" label, big springing number, extending
accent lines, chapter title below.

- `chapter: number` - the displayed number
- `title: string` - chapter title
- `label?` - the small uppercase label (default "Chapter")

Use for multi-chapter tutorials; distinct from `cinematic-title` (the episode
opener).

## notification-pop

Toast stack sliding in from the right, for "tests pass" / "CI green" beats.

- `notifications: { title, body?, color?, badge? }[]` - toasts in order;
  `color` is the avatar dot (default theme accent), `badge` shows a red count
  bubble
- `stagger?` - frames between toasts (default 20; compressed if the window is
  short, so no toast is ever dropped)

Toasts right-align inside the pane - give it a right-side rect. Heading text
belongs in `paneTitle`, not the clip.

## progress-steps

Horizontal stepper: numbered circles connected by filling lines, advancing
one step at a time (circle fills + pulses, connector sweeps to the next).

- `steps: string[]` - stage labels in order
- `title?` - heading above the stepper
- `stepInterval?` - frames per step (default 24; compressed if the window is
  short, so the stepper always completes)

Natural width: `steps.length * 160 + (steps.length - 1) * 120` px (4 steps ≈
1000px). Content wider than the rect is silently clipped by `overflow:
hidden` - give the pane enough width.

Competes with `progress` (the vertical checklist) as the progress tracker:
`progress-steps` wins on animation quality, `progress` wins on hierarchy and
nesting. Both are ported; pick per episode, default TBD.

## chat

pi-style conversation with the AI: scrollback on top, editor box under a
divider, decorative status bar (model + cwd) at the bottom. For scenes that
replay a real prompt/response exchange.

- `steps: ChatStep[]` - beats in order:
  - `{ role: "user", text }` - types into the editor char by char, pauses,
    then sends into the scrollback (accent `❯` prefix)
  - `{ role: "ai", text }` - streams into the scrollback, one wrapped line
    per `streamLineDelay`
  - `{ role: "thinking" }` - a dim "Thinking..." beat
- `model?` / `cwd?` - status bar text (defaults: "kimi-k3", the devlog's
  project path)
- `typeSpeed?` (chars/frame, default 1), `streamLineDelay?` (default 6),
  `sendPause?` (default 18), `thinkingFrames?` (default 45)

Text wraps by display columns (monospace, CJK = 2 columns) computed from the
rect - author natural text, no manual line breaks needed. Step pacing is
frame-driven like the terminal clip: size the step text so typing finishes
inside the narration line's window; the clip holds on the final state.

Prefer short original quotes for user steps (the typing IS the scene); AI
steps take excerpts or summaries when the real reply is long.

## `wand` — Noita-style slot vector

A row of spell slots (icons from `public/shared/noita-spells/`, or text
labels, or `empty` gaps) with a cursor bracket, stepping through casts.
Steps: `{ consume: [slots lit this cast, 1-based], cursor: resting slot,
note, wrap }`; slots: `{ icon, label, empty }`. Icons are abstract —
always pair them with `label`. Steps auto-distribute across the clip
window (`stepInterval`, default 60, compressed to fit). Slot numbers are
1-based, matching the narration ("一号位"). Used for the Noita wand
example, stepping cards, the Eval bug, sparse wands, grouping.

`animated-list` items also accept `{ icon, text }` objects (icon legend
lists) in addition to plain strings.
