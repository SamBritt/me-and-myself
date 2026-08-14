import { Extension } from '@tiptap/core'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { EditorState } from '@tiptap/pm/state'

// Notepad-style indent: a literal run of characters inserted into the text, not a paragraph-level
// margin. Non-breaking spaces (not regular spaces, which HTML collapses) so the gap survives
// normal prose `white-space` without needing `pre`/`pre-wrap`, which would also affect wrapping.
const INDENT_STR = '    '

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      indent: () => ReturnType
      outdent: () => ReturnType
    }
  }
}

// Legacy attribute, kept only so any previously-saved paragraph that used the old block-level
// margin-left indent still renders correctly. Nothing writes this anymore — indent/outdent below
// insert/remove literal whitespace instead.
function legacyIndentAttribute() {
  return {
    default: 0,
    parseHTML: (element: HTMLElement) => Number(element.style.marginLeft?.replace('px', '')) || 0,
    renderHTML: (attributes: { indent?: number }) => {
      if (!attributes.indent) return {}
      return { style: `margin-left: ${attributes.indent}px` }
    },
  }
}

// Start positions (just inside the opening tag) of every text block the selection touches.
function textBlockStarts(state: EditorState, from: number, to: number) {
  const starts: number[] = []
  state.doc.nodesBetween(from, to, (node: ProseMirrorNode, pos: number) => {
    if (node.isTextblock) {
      starts.push(pos + 1)
      return false
    }
    return true
  })
  return starts
}

export const Indent = Extension.create({
  name: 'indent',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: { indent: legacyIndentAttribute() },
      },
    ]
  },

  addCommands() {
    return {
      indent:
        () =>
        ({ editor, commands, state, dispatch }) => {
          // Inside a list, Tab nests the current item under the previous one (a sub-bullet),
          // matching every other editor's list behavior — take that over plain-text indent
          // whenever it applies. Goes through the `commands` proxy (shares this call's
          // transaction) rather than `editor.commands.sinkListItem`, which would dispatch its own
          // transaction immediately and desync it from the one this command is about to return —
          // ProseMirror then rejects the stale one with "Applying a mismatched transaction".
          if (editor.can().sinkListItem('listItem')) {
            return commands.sinkListItem('listItem')
          }

          const { from, to, empty } = state.selection
          const lineStarts = textBlockStarts(state, from, to)
          if (!dispatch) return true

          if (!empty && lineStarts.length > 1) {
            // Selection spans multiple lines: prepend an indent to the start of each one.
            const tr = state.tr
            for (let i = lineStarts.length - 1; i >= 0; i--) {
              tr.insertText(INDENT_STR, lineStarts[i])
            }
            dispatch(tr)
          } else {
            // No selection, or a selection confined to one line: insert right at the cursor
            // (replacing the selection, same as typing over it), matching a plain text editor.
            dispatch(state.tr.insertText(INDENT_STR, from, to))
          }
          return true
        },
      outdent:
        () =>
        ({ editor, commands, state, dispatch }) => {
          if (editor.can().liftListItem('listItem')) {
            return commands.liftListItem('listItem')
          }

          const { from, to } = state.selection
          const lineStarts = textBlockStarts(state, from, to)
          if (!dispatch) return true

          const tr = state.tr
          for (let i = lineStarts.length - 1; i >= 0; i--) {
            const start = lineStarts[i]
            let end = start
            while (end < start + INDENT_STR.length) {
              const char = state.doc.textBetween(end, end + 1)
              if (char !== ' ' && char !== ' ') break
              end++
            }
            if (end > start) tr.delete(start, end)
          }
          dispatch(tr)
          return true
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => this.editor.commands.indent(),
      'Shift-Tab': () => this.editor.commands.outdent(),
    }
  },
})
