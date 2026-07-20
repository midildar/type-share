'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Dashboard() {
  const router = useRouter()
  const supabase = createClient()
  
  const [ownedDocs, setOwnedDocs] = useState<any[]>([])
  const [sharedDocs, setSharedDocs] = useState<any[]>([])

  useEffect(() => {
    async function loadDocs() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch documents you own
      const { data: owned } = await supabase
        .from('documents')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
      
      setOwnedDocs(owned || [])

      // Fetch documents shared with you (joining the documents table)
      const { data: shared } = await supabase
        .from('document_shares')
        .select('documents(*)')
        .eq('user_id', user.id)

      // Extract the nested document objects
      setSharedDocs(shared?.map(s => s.documents) || [])
    }
    loadDocs()
  }, [])

  async function createEmptyDocument() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('documents').insert({ title: 'Untitled Document', owner_id: user?.id }).select().single()
    if (data) router.push(`/document/${data.id}`)
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data } = await supabase.from('documents').insert({
      title: file.name.replace(/\.[^/.]+$/, ""),
      content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] },
      owner_id: user?.id
    }).select().single()

    if (data) router.push(`/document/${data.id}`)
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex gap-4 mb-10">
        <button onClick={createEmptyDocument} className="bg-black text-white px-4 py-2 rounded-md hover:bg-slate-800">
          + New Blank Document
        </button>
        <label className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-md cursor-pointer border">
          Upload .txt or .md
          <input type="file" accept=".txt,.md" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      <h2 className="text-xl font-bold mb-4 border-b pb-2">My Documents</h2>
      <div className="grid gap-2 mb-10">
        {ownedDocs.map(doc => (
          <button key={doc.id} onClick={() => router.push(`/document/${doc.id}`)} className="text-left p-4 border rounded-md hover:bg-slate-50 transition">
            {doc.title || 'Untitled Document'}
          </button>
        ))}
        {ownedDocs.length === 0 && <p className="text-slate-500 text-sm">No documents yet.</p>}
      </div>

      <h2 className="text-xl font-bold mb-4 border-b pb-2">Shared With Me</h2>
      <div className="grid gap-2">
        {sharedDocs.map(doc => (
          <button key={doc.id} onClick={() => router.push(`/document/${doc.id}`)} className="text-left p-4 border rounded-md hover:bg-blue-50 transition">
            {doc.title || 'Untitled Document'}
          </button>
        ))}
        {sharedDocs.length === 0 && <p className="text-slate-500 text-sm">No shared documents.</p>}
      </div>
    </div>
  )
}