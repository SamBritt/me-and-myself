<script setup lang="ts">
import { watch } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import EditorToolbar from './EditorToolbar.vue'
import { Indent } from './extensions/indent'

const props = withDefaults(defineProps<{ modelValue?: object | null; editable?: boolean }>(), {
  editable: true,
})
const emit = defineEmits<{
  'update:content': [payload: { contentJson: object; contentText: string }]
}>()

const editor = useEditor({
  content: props.modelValue ?? '',
  editable: props.editable,
  // StarterKit bundles a Link mark with autolink on by default; this app has no link-insertion
  // feature, and autolinking journal text (e.g. an email you typed) into a real, clickable
  // mailto/https link is surprising behavior we don't want, so drop it entirely.
  extensions: [StarterKit.configure({ link: false }), Highlight, Indent],
  editorProps: {
    attributes: {
      class: 'min-h-[50vh] px-4 py-4 focus:outline-none text-text leading-relaxed',
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:content', { contentJson: editor.getJSON(), contentText: editor.getText() })
  },
})

watch(
  () => props.modelValue,
  (value) => {
    if (!editor.value) return
    const current = JSON.stringify(editor.value.getJSON())
    const incoming = JSON.stringify(value ?? '')
    if (current !== incoming) {
      editor.value.commands.setContent(value ?? '', { emitUpdate: false })
    }
  },
)

defineExpose({ editor })
</script>

<template>
  <div :class="editable ? 'rounded-lg border border-border bg-surface' : ''">
    <EditorToolbar v-if="editable" :editor="editor ?? undefined" />
    <EditorContent :editor="editor" />
  </div>
</template>
