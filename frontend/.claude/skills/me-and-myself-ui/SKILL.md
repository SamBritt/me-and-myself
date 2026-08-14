---
name: me-and-myself-ui
description: UI/design-system conventions for the Me & Myself frontend — icon library, shared button components, theming via CSS custom properties, fonts, and animation patterns. Use when writing or editing any Vue component under frontend/src, adding a button or icon, styling anything with color or typography, or adding a transition/animation.
metadata:
  type: project
---

# Me & Myself — UI conventions

Read this before adding or editing anything visual in `frontend/src`. It documents patterns
already established across the app — following them keeps new UI consistent without
re-deriving decisions that were already made (and in a couple of cases, already cost a bug fix).

## Icons

**`@lucide/vue` only.** Not `lucide-vue-next` (deprecated, superseded by `@lucide/vue`) and no
second icon library. Import named icon components directly:

```ts
import { Plus, X, Pencil, Trash2, PanelLeft } from '@lucide/vue'
```

Icons render with `stroke="currentColor"` by default — never pass a hardcoded hex color to an
icon. Let it inherit the surrounding text color so it stays theme-correct automatically (see
Theming below). Mood-tracking icons specifically use Lucide's face set: `Angry`, `Annoyed`,
`Frown`, `FaceSlightlyFrowning`, `Meh`, `Smile`, `SmilePlus`, `Laugh` — note `FaceAngry` is a
literal alias of `Angry` (same component reference), not a distinct icon; don't rely on it to
mean something different.

## Shared button components

Three components live in `frontend/src/components/ui/`. Reach for one of these before writing a
new `<button>` from scratch — duplicated button markup is exactly what these replaced.

| Component | Use for | Looks like |
|---|---|---|
| `IconButton.vue` | Icon-only controls, no label | Ghost icon, `text-text-muted` → `hover:text-text` |
| `ToggleButton.vue` | Boxed controls with an on/off state | Rounded box; active = `bg-primary text-white`, inactive = `text-text hover:bg-border/50` |
| `ActionButton.vue` | Text (+ optional icon) action links | Plain inline text, tone-colored, no background |

**`IconButton`** — props: `icon` (component, required), `label` (string, required — becomes
`title` + `aria-label`), `size` (default 18). Used for the sidebar's new-entry/hide-list controls
and the "show list" toggle when the sidebar is collapsed.

**`ToggleButton`** — props: `active`, `icon`, `iconSize` (default 16), `iconPosition`
(`'left' | 'right'`, default left), `size` (`'sm' | 'md'`, default `sm`: `px-2 py-1`; `md`:
`px-3 py-1.5`). Default slot is the label. Used for the rich-text editor toolbar (B/I/U/Highlight/
List/Outdent/Indent) and the mood picker's 11 buttons (`iconPosition="right"`, `size="md"`).
Extra classes (e.g. `class="font-bold"` for the Bold button) pass through and merge fine since
they don't collide with any class `ToggleButton` itself sets.

**`ActionButton`** — props: `icon`, `iconSize` (default 14), `iconPosition` (default left),
`tone` (`'muted' | 'danger' | 'danger-emphasis' | 'primary'`, default `muted`), `size`
(`'sm' | 'md'`, default `md`: `text-sm`; `sm`: `text-xs`, used for the compact delete controls
inside a list row). Tone map:

- `muted` — `text-text-muted hover:text-text` (Back, Done, Cancel)
- `danger` — `text-text-muted hover:text-red-600` (a Delete trigger, before confirmation)
- `danger-emphasis` — `font-medium text-red-600 hover:text-red-700` (the actual "Confirm" delete)
- `primary` — `text-primary` (Log out)

If you need a button shape that doesn't fit one of these three (e.g. a solid CTA), that's a
signal to check whether it should stay a one-off (like the "New entry" `RouterLink`, which is
intentionally not a `<button>` since it navigates) rather than forcing a fourth variant onto an
existing component.

## Journal item components

Three list-item components live in `frontend/src/components/journal/`, one per place a journal or
entry gets rendered as a row/card:

| Component | Used by | Props | Emits |
|---|---|---|---|
| `JournalCard.vue` | `JournalsListView.vue`'s grid | `journal: JournalSummary`, `confirming: boolean` | `open`, `ask-delete`, `confirm-delete`, `cancel-delete` |
| `EntryCard.vue` | `JournalListView.vue`'s full-page entry list | `entry: EntrySummary`, `confirming: boolean` | `open`, `ask-delete`, `confirm-delete`, `cancel-delete` |
| `SidebarEntryRow.vue` | `EntryListSidebar.vue` | `entry: EntrySummary`, `active: boolean` | `select` |

These are **deliberately three separate components**, not one shared component with
style-switching props. `JournalCard`/`EntryCard` show the same *shape* of data (title/count,
snippet or count line, date, inline delete) but `SidebarEntryRow` differs enough in layout (compact
left-accent row vs. bordered card) and behavior (no delete, active-row highlighting instead) that
forcing all three together would trade real duplication for a worse kind — a component full of
variant branches. What *is* shared is `utils/date.ts`'s `formatEntryDate` and the `EntrySummary`/
`JournalSummary` types (exported from `stores/journal.ts`/`stores/journals.ts` respectively — the
store owns the shape, the component just imports the type).

The inline-delete-confirm pattern (`confirming` prop, `ask-delete`/`confirm-delete`/`cancel-delete`
emits) keeps the "which row is confirming" state in the **parent**, not the child — only one row
across a list should ever be mid-confirm at a time, and a single `confirmDeleteId` ref in the parent
enforces that naturally. The child never receives or re-emits a raw DOM `Event`; it stops
propagation itself with `@click.stop` (or wraps the whole confirm-controls block in one
`@click.stop` container) so a click on Delete/Confirm/Cancel never also triggers the card's own
`open` emit. If you're adding a fourth place that renders a journal or entry as a list row, decide
first whether it matches one of these three shapes closely enough to reuse, or is different enough
to earn its own component — don't retrofit variant props onto an existing one to save a file.

## Skeleton loading

`components/ui/Skeleton.vue` is a one-line primitive — `<div class="animate-pulse rounded
bg-text-muted/25" />` with no props — sized entirely by the classes the caller passes onto its root
(`class="h-4 w-2/3"`, etc.), the same "consumer passes sizing utility classes" convention as
everything else in this file. Reach for it directly for one-off skeleton bars (e.g. the journal-name
heading in `JournalListView.vue`: `<Skeleton v-else class="h-7 w-40" />` in place of the heading
while `journalName` is still `null`).

For a whole loading list/card, there's a matching `*Skeleton.vue` next to each real item component,
each mirroring its counterpart's exact box (same `rounded-lg border border-border` / min-height /
padding) so the page doesn't jump when real data replaces it:

| Real component | Skeleton | Rendered where |
|---|---|---|
| `JournalCard.vue` | `JournalCardSkeleton.vue` | `JournalsListView.vue`, `v-if="journals.loading"`, a handful in the same grid |
| `EntryCard.vue` | `EntryCardSkeleton.vue` | `JournalListView.vue`, `v-if="journal.loadingEntries"` |
| `SidebarEntryRow.vue` | `SidebarEntryRowSkeleton.vue` | `EntryListSidebar.vue`, `v-if="journal.loadingEntries"` |
| *(the editor body)* | `EntryEditorSkeleton.vue` | `JournalEditorView.vue`, `v-else` opposite `!journal.loadingDraft` |

Skeleton counts are a fixed small number (4–6), not tied to any real data — there's nothing to size
them against until the real content has already loaded, at which point the skeleton is gone anyway.
Same rule as everywhere else: `bg-text-muted/25` not a hardcoded gray, so the pulse reads correctly
in all 8 themes — `bg-border/60` was tried first and rejected: in themes where border sits close in
lightness to surface (e.g. Nord), the blended color was nearly indistinguishable from the card
background. `text-muted` is designed to read clearly against both `bg` and `surface`, so it stays
visibly a "pulse" at low opacity instead of disappearing.

## Grid-of-cards + dashed create-tile (JournalsListView.vue)

The top-level journals list renders cards in a CSS grid (`grid-cols-[repeat(auto-fill,minmax(220px,1fr))]`)
rather than a vertical list, with a same-sized dashed-border tile (`border-2 border-dashed`, centered
`Plus` icon) as the create affordance — no separate name input + Create button sitting above the list.
Clicking the tile swaps it in place for an autofocused text input (`creating` ref); Enter submits,
Escape/blur cancels back to the dashed tile. This is a lighter-weight creation flow than the
inline-confirm pattern used for delete — creation isn't destructive, so it doesn't need an explicit
Confirm/Cancel pair, just a natural way to back out.

`TransitionGroup` can't wrap grid items directly without becoming a grid item itself and breaking the
layout — give it `tag="div" class="contents"` so it renders a real (required) wrapper element that's
invisible to the grid via `display: contents`, letting its `v-for` children lay out as direct children
of the parent grid. Because `display: contents` removes the wrapper from the box tree, `position:
relative` for the list's FLIP-leave positioning has to live on the outer grid container instead — see
`grid-list-*` in `style.css`, a separate transition-class set from the row-list `.list-*` classes.
`.list-leave-active` sets `position: absolute; left: 0; right: 0` (correct for a full-width row list,
stretching the leaving item to fill the line while others reflow) — reusing that in a grid would
stretch a leaving card to the full grid row width. `.grid-list-*` skips the absolute-position leave
trick entirely (opacity + `scale(0.95)` only); the removed cell's grid space collapses immediately
rather than animating out, which is an accepted trade-off for a grid rather than a list.

## Theming

Every color is a CSS custom property set on `<html>` via a `.theme-*` class (`style.css`):
`--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-primary`,
`--color-highlight`, `--color-border`. There are 8 themes (Light, Dark, Sepia, Forest, Solarized,
Nord, Rose, High Contrast) — the `ThemeName` enum spans the Prisma schema, GraphQL schema, and
`stores/theme.ts`'s `THEME_NAMES` in lockstep; adding a theme means touching all three plus a
`.theme-<name>` block here and a swatch in `ThemePicker.vue`.

**Never hardcode a hex color in a component.** Use the Tailwind tokens that map to these
variables (`bg-surface`, `text-text-muted`, `border-border`, `bg-primary`, etc.) or `currentColor`
for icons. A hardcoded color is invisible in 7 of the 8 themes' worth of testing and was exactly
the mistake corrected when the mood picker's red→green gradient got replaced with plain
`currentColor` icons.

Scrollbars are themed globally (`scrollbar-color` + `::-webkit-scrollbar*`) — nothing to do
per-component.

## Fonts

Same pattern as theming, one property: `--font-sans`, set on `<html>` via a `.font-*` class
(`style.css`). 5 options — System (default), Montserrat, Lora, JetBrains Mono, Nunito — spanning
the Prisma schema's `FontFamily` enum, the GraphQL schema, and `stores/font.ts`'s `FONT_NAMES` in
lockstep, exactly like `ThemeName`/`THEME_NAMES`. `FontPicker.vue` mirrors `ThemePicker.vue`
structurally but swaps the color swatch for a live "Aa" preview rendered in each candidate
`font-family` inline.

Fonts are self-hosted via `@fontsource/*` packages (not a Google Fonts CDN `<link>`, for
privacy/offline-reliability) and imported once in `src/fonts.css` (loaded from `main.ts`).
Importing every weight up front is fine — `@fontsource`'s CSS only declares `@font-face` rules;
the browser doesn't actually fetch a font file until text using that `font-family` is rendered on
the page, so unused options cost nothing at runtime, just some extra (cacheable) CSS at build
time. If you add a 6th font option, add its `@fontsource` weights to `fonts.css`, a `.font-<name>`
block here, an entry in `FontPicker.vue`, and the enum in all three schema-adjacent places above.

## Cursors

Every clickable `<button>` needs `cursor: pointer` — browsers don't apply that by default for
`<button>` (only `<a href>` gets it natively), and Tailwind's preflight doesn't add it either.
This is handled globally (`button:not(:disabled), [role='button'] { cursor: pointer }` in
`style.css`), so it's automatic for native `<button>`s and all three shared button components —
nothing to add per-component. Non-button clickable elements (e.g. the entry list `<li>` rows) still
need an explicit `cursor-pointer` class since the global rule only targets buttons.

## Animation

`@vueuse/motion` (installed, `MotionPlugin` registered in `main.ts`) handles **mount-in**
animation via the `v-motion` directive with `:initial`/`:enter`, e.g. the mood picker's staggered
button entrance. Native Vue `<Transition>` / `<TransitionGroup>` handles **mount + unmount**
choreography (sidebar collapse, route changes, list add/remove) — `@vueuse/motion` is designed to
pair with these, not replace them, since it doesn't manage DOM lifecycle itself. Named transition
classes live centrally in `style.css` (`.route-*`, `.sidebar-*`, `.list-*`) rather than scattered
per-component `<style>` blocks.

**`@vueuse/motion` transition timing is in seconds, not milliseconds.** `transition: { delay: i *
0.03, duration: 0.25 }` — writing `duration: 200` means 200 seconds and makes an animation look
frozen. This bit the mood picker once already.

The global theme cross-fade (`background-color`/`color`/`border-color` transitions on `*`) is
scoped under a `.theme-ready` class that `main.ts` adds via `requestAnimationFrame` right after
`app.mount()`. Don't remove that gating — without it, the very first paint animates from unstyled
to styled instead of snapping instantly, giving cold loads a brief washed-out flash.

## Layout habits

- Cards: `rounded-lg border border-border bg-surface`
- Inline button/pill groups that should size to content and wrap: `flex flex-wrap gap-*` — not a
  `grid` with `justify-between`, which stretches cells and pushes label/icon pairs apart (this was
  tried for the mood picker and reverted for exactly that reason).
- `TransitionGroup` list containers need `position: relative` (via a `relative` class) for the
  `.list-leave-active { position: absolute }` FLIP technique to position correctly.

## Known gotchas already paid for

- Tiptap's `StarterKit` (v3) silently bundles a `Link` mark with autolink on, and also an
  `Underline` mark. Underline is wanted (no separate `@tiptap/extension-underline` needed); Link
  is not — `StarterKit.configure({ link: false })` in `JournalEditor.vue`, otherwise
  email-looking text in an entry silently becomes a real `mailto:` link that hijacks navigation in
  read-only mode.
- `components/editor/extensions/indent.ts`'s Indent/Outdent is **not** block-level paragraph
  indentation (that was the original v1 design — a node attribute rendered as `margin-left` on the
  whole `<p>`, matching Word/Docs). It was rebuilt to match a plain-text-editor mental model
  instead (Notepad, a code editor): indent inserts a literal run of 4 non-breaking spaces
  (` `, not regular spaces — regular spaces collapse under normal HTML whitespace rules,
  non-breaking spaces don't, so this works without `white-space: pre`/`pre-wrap`, which would
  otherwise affect the whole paragraph's wrapping). Where it lands depends on the selection: no
  selection, or a selection confined to one line → insert right at the cursor (replacing the
  selection, exactly like typing over it). Selection spanning multiple lines → prepend the indent
  to the *start* of every line touched, leaving the rest of the selection's content untouched —
  this is the "highlight a chunk of text, those lines indent" behavior. Outdent mirrors this by
  stripping up to one indent's worth of leading whitespace from the start of each touched line.
  `Tab`/`Shift-Tab` are bound directly (`addKeyboardShortcuts`), not just the toolbar buttons. The
  old `indent` node attribute is still defined (`legacyIndentAttribute`) purely so any
  previously-saved paragraph that used the old margin-left approach keeps rendering correctly —
  nothing writes it anymore, so don't extend it for new behavior. Both `indent`/`outdent`
  check `editor.can().sinkListItem('listItem')` / `liftListItem('listItem')` first and defer to
  those when inside a list, so Tab creates a nested sub-bullet there instead of inserting
  whitespace — list nesting takes priority over plain-text indent whenever both could apply. When
  calling another registered command from inside a custom command's own implementation, go through
  the `commands` proxy in that command's params (`({ commands }) => commands.sinkListItem(...)`),
  never `editor.commands.foo()`. `editor.commands.foo()` dispatches its own transaction immediately
  against the live editor state; called from inside another command that's mid-execution (e.g. the
  `Tab` keyboard shortcut calling `indent()`, which internally wanted to trigger `sinkListItem`),
  the outer command's own transaction — built from a state snapshot that's now stale — gets
  dispatched right after and ProseMirror throws `Applying a mismatched transaction`. This exact bug
  shipped once (reachable by pressing Tab on an empty, nestable bullet) and also visibly broke
  Tab's browser default of moving focus to the next element, since the thrown error aborted the
  handler before `preventDefault` semantics fully resolved. `commands.foo()` shares the calling
  command's transaction instead of dispatching its own, so this can't happen.
- Tailwind's preflight resets `ul`/`ol` to `list-style: none` with no padding globally. This also
  strips bullets/numbers from Tiptap's `BulletList`/`OrderedList` output inside `.ProseMirror`
  content — the list *node* is created correctly (`toggleBulletList()` isn't broken), it just
  renders invisibly without an explicit override. Fixed once in `style.css` under a `.ProseMirror
  ul`/`.ProseMirror ol` block (disc/circle/square by nesting depth, decimal for ordered) — don't
  reintroduce a list feature without checking this rule is still in place.
- The editor toolbar's list control is a `ToggleButton` (current type's icon, `List` or
  `ListOrdered`, clicking toggles bullet list) plus a small separate chevron `ToggleButton` that
  opens a dropdown to explicitly pick bulleted vs. numbered (`EditorToolbar.vue`). This is the
  first dropdown/menu in the app, built inline rather than as a new shared `ui/` component since
  nothing else needs one yet — a `ref` for open state, a `ref` on the wrapping container, and a
  `document.addEventListener('click', ...)` (removed in `onBeforeUnmount`) that closes the menu on
  outside click. If a second toolbar/menu dropdown shows up, that's the signal to extract a shared
  `Dropdown.vue`, not before.
- The Highlight toggle doesn't hand the raw selection straight to `toggleHighlight()`. Since
  Indent's whitespace is literal non-breaking-space characters in the text (see above), a selection
  that starts mid-indent (e.g. dragging from before an indented line's first letter) would
  highlight the indent along with the content. `toggleHighlightTrimmed()` in `EditorToolbar.vue`
  trims leading/trailing non-breaking spaces off the selection before applying the mark, then
  restores the original selection afterward — so `"    cats."` selected end-to-end only highlights
  `"cats."`. This is scoped to Highlight specifically (that's what was reported); Bold/Italic/
  Underline still use the raw selection.
- `editor.isActive('bulletList')` checks every ancestor of the cursor, not just the nearest one —
  so a numbered sub-list nested inside a bulleted list reports *both* types active at once (the
  outer bulletList is still an ancestor of a cursor sitting in the inner orderedList). The toolbar
  needs the type that actually applies at the cursor, so it never uses `isActive` for this;
  `nearestListType()` in `EditorToolbar.vue` walks `$from` up from its own depth and returns the
  first `bulletList`/`orderedList` it hits.
- Tiptap's `toggleBulletList`/`toggleOrderedList` convert the *entire* enclosing list node — every
  sibling `<li>` at that nesting level — not just the item under the cursor. That's normal
  behavior elsewhere (Docs/Word/Notion all do this), but it breaks the moment nesting or mixed
  types are involved: given `dogs > [wolves, dingos]` as a bulleted sub-list, converting just
  `dingos` to numbered would otherwise drag `wolves` along with it (same `bulletList` node); given
  a numbered list with a bulleted sub-list nested inside, highlighting across both and converting
  should flip *everything touched* to the target type without changing anyone's nesting depth.
  `convertListItemType()`/`convertListTypesInRange()` in `EditorToolbar.vue` handle this with a
  recursive rebuild, not a single-level split: for each `bulletList`/`orderedList` node touched by
  the selection (at *any* depth), each of its own items is bucketed into an untouched-before /
  touched-middle / untouched-after run based on whether the *item's own line* (its first child —
  the recursion into any nested list inside that item happens first and independently, so nested
  content being touched doesn't by itself pull the parent item into the middle bucket) overlaps
  the selection; the middle run becomes a new list of the target type, sandwiched between
  before/after lists of the original type (renumbered to keep counting if ordered). Each item's
  content is recursed into *before* bucketing it, so a nested list inside gets the same treatment
  first — this is what makes a numbered-list-containing-a-bulleted-sub-list-converts-both-at-once
  case work in one pass, and why nesting itself never changes, only each list's own type at
  whatever depth it already sits. If a list ends up with an empty middle run (the selection only
  reached its nested content, never any of its own item lines), that list's own type is left alone
  entirely — only the nested list(s) inside it change. This only runs when the current type at the
  selection's start differs from the target; wrapping a bare paragraph into a list, or clicking the
  same type again when already uniformly that type, still goes through the normal
  `toggleBulletList`/`toggleOrderedList`.
  `convertListItemType()`'s `tr.replaceWith(...)` swaps the entire top-level document content for a
  freshly rebuilt version, so there's no old position left for ProseMirror to sensibly map the
  cursor through — without an explicit `tr.setSelection(...)`, it falls back to landing somewhere
  past everything touched, forcing a click back in before typing could continue. Nothing *before*
  `from` ever changes size (only nodes overlapping the selection get rebuilt), so `from` itself
  stays a valid, accurate position in the rebuilt doc — the fix just resolves a `TextSelection`
  there before dispatching. Any future edit that rebuilds a node subtree wholesale with
  `replaceWith`/`replace` (rather than transforming in place) needs the same explicit-selection
  treatment — don't assume the cursor lands somewhere reasonable by default.
