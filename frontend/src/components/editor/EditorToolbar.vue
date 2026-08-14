<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { Fragment, type Node as ProseMirrorNode, type Schema } from '@tiptap/pm/model'
import { TextSelection } from '@tiptap/pm/state'
import { List, ListOrdered, ChevronDown } from '@lucide/vue'
import ToggleButton from '../ui/ToggleButton.vue'

const props = defineProps<{ editor: Editor | undefined }>()

function isActive(name: string, attrs?: Record<string, unknown>) {
  return props.editor?.isActive(name, attrs) ?? false
}

// editor.isActive('bulletList') checks whether ANY ancestor of the cursor is a bulletList — so a
// numbered sub-list nested inside a bulleted list reports both types active at once, since the
// outer bulletList is still an ancestor. The toolbar should reflect the type of the *nearest*
// enclosing list only, which is what actually applies at the cursor.
function nearestListType(): 'bulletList' | 'orderedList' | null {
  const editor = props.editor
  if (!editor) return null
  const { $from } = editor.state.selection
  for (let depth = $from.depth; depth >= 0; depth--) {
    const name = $from.node(depth).type.name
    if (name === 'bulletList' || name === 'orderedList') return name as 'bulletList' | 'orderedList'
  }
  return null
}

// Highlight should only cover real content, not the non-breaking-space indent runs the Indent
// extension inserts — selecting "    cats." and hitting Highlight should mark just "cats.".
function toggleHighlightTrimmed() {
  const editor = props.editor
  if (!editor) return
  const { state } = editor
  const { from, to } = state.selection
  if (from === to) {
    editor.chain().focus().toggleHighlight().run()
    return
  }

  let trimmedFrom = from
  let trimmedTo = to
  while (trimmedFrom < trimmedTo && state.doc.textBetween(trimmedFrom, trimmedFrom + 1) === ' ') {
    trimmedFrom++
  }
  while (trimmedTo > trimmedFrom && state.doc.textBetween(trimmedTo - 1, trimmedTo) === ' ') {
    trimmedTo--
  }
  if (trimmedFrom >= trimmedTo) return // selection was entirely indentation, nothing to mark

  editor
    .chain()
    .focus()
    .setTextSelection({ from: trimmedFrom, to: trimmedTo })
    .toggleHighlight()
    .setTextSelection({ from, to })
    .run()
}

const listMenuOpen = ref(false)
const listMenuRef = ref<HTMLElement | null>(null)

function onDocumentClick(event: MouseEvent) {
  if (listMenuRef.value && !listMenuRef.value.contains(event.target as Node)) {
    listMenuOpen.value = false
  }
}
document.addEventListener('click', onDocumentClick)
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))

// Rebuilds a run of sibling nodes (starting at document position `pos`), converting every
// bulletList/orderedList that overlaps [from, to] to `target` — at ANY nesting depth, so a
// selection spanning a numbered list with a nested bulleted sub-list converts both, in one pass.
// Nesting itself is never touched, only each list's own type: a list's items are split into
// untouched-before/touched-middle/untouched-after runs around the selection boundary exactly like
// a single-level conversion, but each item's own content is recursed into FIRST so any list nested
// inside it gets the same treatment before the item is placed in a before/middle/after bucket.
function convertListTypesInRange(
  nodes: readonly ProseMirrorNode[],
  pos: number,
  from: number,
  to: number,
  target: 'bulletList' | 'orderedList',
  schema: Schema,
): { nodes: ProseMirrorNode[]; changed: boolean } {
  const result: ProseMirrorNode[] = []
  let changed = false
  let p = pos

  for (const node of nodes) {
    const nodeStart = p
    const nodeEnd = p + node.nodeSize
    p = nodeEnd

    if (nodeEnd <= from || nodeStart >= to) {
      result.push(node)
      continue
    }

    if (node.type.name === 'bulletList' || node.type.name === 'orderedList') {
      const currentType = node.type.name as 'bulletList' | 'orderedList'

      let itemPos = nodeStart + 1
      const newItems: ProseMirrorNode[] = []
      const itemRanges: Array<{ start: number; end: number }> = []
      node.forEach((item) => {
        const itemStart = itemPos
        const { nodes: newContent, changed: itemChanged } = convertListTypesInRange(
          item.content.content,
          itemStart + 1,
          from,
          to,
          target,
          schema,
        )
        newItems.push(itemChanged ? item.copy(Fragment.from(newContent)) : item)
        if (itemChanged) changed = true

        // Only the item's own direct line (its first child, a paragraph/heading) counts toward
        // whether *this* item's own wrapper type should change — a nested list further down is
        // already handled independently by the recursive call above, so a selection that only
        // reaches into nested content shouldn't also flip the parent item's own list type.
        const ownChild = item.firstChild
        const ownStart = itemStart + 1
        const ownEnd = ownChild ? ownStart + ownChild.nodeSize : itemStart + item.nodeSize
        itemRanges.push({ start: ownStart, end: ownEnd })

        itemPos = itemStart + item.nodeSize
      })

      if (currentType === target) {
        result.push(changed ? node.copy(Fragment.from(newItems)) : node)
        continue
      }

      const itemsBefore: ProseMirrorNode[] = []
      const itemsMiddle: ProseMirrorNode[] = []
      const itemsAfter: ProseMirrorNode[] = []
      newItems.forEach((item, i) => {
        const { start, end } = itemRanges[i]
        if (end <= from) itemsBefore.push(item)
        else if (start >= to) itemsAfter.push(item)
        else itemsMiddle.push(item)
      })

      if (itemsMiddle.length === 0) {
        // None of this list's own item lines were actually touched — the selection was confined
        // to nested content deeper down, already converted above. This list's own type stays put.
        result.push(changed ? node.copy(Fragment.from(newItems)) : node)
        continue
      }

      const currentListType = schema.nodes[currentType]
      const targetListType = schema.nodes[target]
      // Ordered lists split into two ordered halves should keep counting up rather than restart.
      const afterAttrs =
        currentType === 'orderedList'
          ? { ...node.attrs, start: (Number(node.attrs.start) || 1) + itemsBefore.length + itemsMiddle.length }
          : node.attrs

      if (itemsBefore.length) result.push(currentListType.create(node.attrs, Fragment.from(itemsBefore)))
      result.push(targetListType.create(null, Fragment.from(itemsMiddle)))
      if (itemsAfter.length) result.push(currentListType.create(afterAttrs, Fragment.from(itemsAfter)))
      changed = true
      continue
    }

    // Not a list — recurse into container content (e.g. a listItem's children) to find lists
    // nested deeper, but never into a textblock's inline content (paragraphs/headings can't hold a
    // nested list in this schema, so there's nothing to find there).
    if (!node.isTextblock && !node.isText && node.content.size > 0) {
      const { nodes: newContent, changed: innerChanged } = convertListTypesInRange(
        node.content.content,
        nodeStart + 1,
        from,
        to,
        target,
        schema,
      )
      if (innerChanged) {
        result.push(node.copy(Fragment.from(newContent)))
        changed = true
        continue
      }
    }
    result.push(node)
  }

  return { nodes: result, changed }
}

function convertListItemType(editor: Editor, target: 'bulletList' | 'orderedList') {
  const { state, view } = editor
  const { from, to } = state.selection

  const { nodes: newTopLevel, changed } = convertListTypesInRange(
    state.doc.content.content,
    0,
    from,
    to,
    target,
    state.schema,
  )
  if (!changed) return

  // Splitting lists to isolate the touched items adds a couple of wrapper tokens per split, so
  // positions after the edit can shift — but nothing before `from` ever changes size, so `from`
  // itself is still a valid, accurate position in the rebuilt document. Land the cursor there
  // rather than trying to preserve the full original selection through a structural rebuild.
  const tr = state.tr.replaceWith(0, state.doc.content.size, Fragment.from(newTopLevel))
  const cursorPos = Math.min(from, tr.doc.content.size)
  tr.setSelection(TextSelection.near(tr.doc.resolve(cursorPos)))

  view.dispatch(tr)
  editor.commands.focus()
}

function convertOrToggleList(target: 'bulletList' | 'orderedList') {
  const editor = props.editor
  if (!editor) return
  listMenuOpen.value = false

  const currentType = nearestListType()
  if (currentType === null || currentType === target) {
    // Not in a list yet (wrap the current line into one), or already this exact type (toggle it
    // off entirely) — both match Tiptap's default whole-list behavior; only converting between
    // two different types needs the split above.
    const chain = editor.chain().focus()
    if (target === 'bulletList') chain.toggleBulletList().run()
    else chain.toggleOrderedList().run()
    return
  }

  convertListItemType(editor, target)
}

function chooseBulletList() {
  convertOrToggleList('bulletList')
}

function chooseOrderedList() {
  convertOrToggleList('orderedList')
}
</script>

<template>
  <div v-if="editor" class="flex flex-wrap gap-1 border-b border-border px-3 py-2">
    <ToggleButton
      class="font-bold"
      :active="isActive('bold')"
      @click="editor.chain().focus().toggleBold().run()"
    >
      B
    </ToggleButton>
    <ToggleButton
      class="italic"
      :active="isActive('italic')"
      @click="editor.chain().focus().toggleItalic().run()"
    >
      I
    </ToggleButton>
    <ToggleButton
      class="underline"
      :active="isActive('underline')"
      @click="editor.chain().focus().toggleUnderline().run()"
    >
      U
    </ToggleButton>
    <ToggleButton :active="isActive('highlight')" @click="toggleHighlightTrimmed">Highlight</ToggleButton>

    <span class="mx-1 w-px bg-border" />

    <div ref="listMenuRef" class="relative flex items-stretch">
      <ToggleButton
        :active="nearestListType() !== null"
        :icon="nearestListType() === 'orderedList' ? ListOrdered : List"
        @click="chooseBulletList"
      />
      <ToggleButton
        :icon="ChevronDown"
        :icon-size="14"
        class="!px-1"
        @click.stop="listMenuOpen = !listMenuOpen"
      />
      <div
        v-if="listMenuOpen"
        class="absolute top-full left-0 z-10 mt-1 flex flex-col gap-0.5 rounded-lg border border-border bg-surface p-1 shadow-lg"
      >
        <ToggleButton
          :active="nearestListType() === 'bulletList'"
          :icon="List"
          icon-position="left"
          class="justify-start whitespace-nowrap"
          @click="chooseBulletList"
        >
          Bulleted list
        </ToggleButton>
        <ToggleButton
          :active="nearestListType() === 'orderedList'"
          :icon="ListOrdered"
          icon-position="left"
          class="justify-start whitespace-nowrap"
          @click="chooseOrderedList"
        >
          Numbered list
        </ToggleButton>
      </div>
    </div>

    <ToggleButton @click="editor.chain().focus().outdent().run()">⇤ Outdent</ToggleButton>
    <ToggleButton @click="editor.chain().focus().indent().run()">⇥ Indent</ToggleButton>
  </div>
</template>
