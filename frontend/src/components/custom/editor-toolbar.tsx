import { Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'

export default function Toolbar({ editor }: { editor: Editor }) {
  if (!editor) return null

  return (
    <div className="flex flex-wrap gap-2 border-b pb-2">
      <Button type="button" onClick={() => editor.chain().focus().toggleBold().run()} variant={editor.isActive('bold') ? 'default' : 'outline'}>
        B
      </Button>
      <Button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} variant={editor.isActive('italic') ? 'default' : 'outline'}>
        I
      </Button>
      <Button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} variant={editor.isActive('underline') ? 'default' : 'outline'}>
        U
      </Button>
      <Button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} variant="outline">Trái</Button>
      <Button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} variant="outline">Giữa</Button>
      <Button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} variant="outline">Phải</Button>
      <Button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} variant="outline">• List</Button>
      <Button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} variant="outline">1. List</Button>
      <Button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} variant="outline">H2</Button>
      <Button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} variant="outline">H3</Button>
    </div>
  )
}
