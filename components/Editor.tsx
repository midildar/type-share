'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, Underline as UnderlineIcon, List, Heading1, Heading2 } from 'lucide-react'

export default function Editor({
    initialContent,
    saveAction
}: {
    initialContent: any,
    saveAction: (content: any) => Promise<void>
}) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: initialContent || '',
        immediatelyRender: false,
        onBlur: ({ editor }) => {
            saveAction(editor.getJSON())
        }
    })

    if (!editor) return null

    return (
        <div className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-slate-200 bg-slate-50">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('bold') ? 'bg-slate-200 font-bold' : ''}`}
                >
                    <Bold className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('italic') ? 'bg-slate-200 font-bold' : ''}`}
                >
                    <Italic className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-200 font-bold' : ''}`}
                >
                    <Heading1 className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 font-bold' : ''}`}
                >
                    <Heading2 className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('bulletList') ? 'bg-slate-200 font-bold' : ''}`}
                >
                    <List className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('underline') ? 'bg-slate-200 font-bold' : ''}`}
                >
                    <UnderlineIcon className="w-4 h-4" />
                </button>
            </div>

            {/* Editor Content Area */}
            <div className="p-6">
                <EditorContent editor={editor} className="prose max-w-none focus:outline-none min-h-[500px]" />
            </div>
        </div>
    )
}