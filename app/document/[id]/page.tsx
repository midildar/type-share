import { createClient } from '@/lib/supabase/server'
import Editor from '@/components/Editor'
import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import TitleEditor from '@/components/TitleEditor'
import { cookies } from 'next/headers'

export default async function DocumentPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params

  await cookies()

  const supabase = await createClient()

  const { data: doc, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !doc) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = doc.owner_id === user?.id

  async function saveDocument(jsonContent: any) {
    'use server'
    const supabase = await createClient()
    await supabase.from('documents').update({ content: jsonContent }).eq('id', id)
  }

  async function shareDocument(formData: FormData) {
    'use server'
    const email = formData.get('email') as string
    if (!email) return

    const supabase = await createClient()
    const { data: targetUserId, error: rpcError } = await supabase.rpc('get_user_id_by_email', {
      email_input: email.trim()
    })

    if (rpcError || !targetUserId) return

    await supabase.from('document_shares').insert({
      document_id: id,
      user_id: targetUserId
    })
    
    revalidatePath(`/document/${id}`)
  }

  // NEW: Server Action to rename the document
  async function renameDocument(newTitle: string) {
    'use server'
    if (!newTitle || newTitle.trim() === '') return
    
    const supabase = await createClient()
    await supabase.from('documents').update({ title: newTitle.trim() }).eq('id', id)
    
    revalidatePath(`/document/${id}`)
    revalidatePath('/dashboard')
  }

  return (
    <main className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-6 flex justify-between items-end border-b pb-4">
        <div className="flex-1 mr-8">
          {/* NEW: Inline Editable Title Form */}
          <TitleEditor initialTitle={doc.title} onSave={renameDocument} />

          <p className="text-sm text-slate-500 mt-1 px-1">
            {isOwner ? 'You own this document' : 'Shared with you'}
          </p>
        </div>

        {isOwner && (
          <form action={shareDocument} className="flex gap-2">
            <input 
              type="email" 
              name="email" 
              placeholder="colleague@example.com" 
              required
              className="border border-slate-300 rounded-md px-3 py-1 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-4 py-1 rounded-md text-sm hover:bg-blue-700 font-medium"
            >
              Share
            </button>
          </form>
        )}
      </div>
      <Editor initialContent={doc.content} saveAction={saveDocument} />
    </main>
  )
}