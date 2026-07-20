'use client'

import { useState } from 'react'

export default function TitleEditor({ 
  initialTitle, 
  onSave 
}: { 
  initialTitle: string, 
  onSave: (newTitle: string) => Promise<void> 
}) {
  const [title, setTitle] = useState(initialTitle)

  return (
    <input 
      type="text"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      onBlur={() => {
        if (title.trim() !== '' && title !== initialTitle) {
          onSave(title)
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.currentTarget.blur() // This drops focus, which triggers onBlur
        }
      }}
      className="text-3xl font-bold bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 w-full"
    />
  )
}