import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import Editor from '@/components/Editor'
import TitleEditor from '@/components/TitleEditor'
import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// 1. Extract the data fetching and UI into its own async component
async function DocumentContent({ id }: { id: string }) {
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

  async function renameDocument(newTitle: string) {
    'use server'
    if (!newTitle || newTitle.trim() === '') return
    
    const supabase = await createClient()
    await supabase.from('documents').update({ title: newTitle.trim() }).eq('id', id)
    
    revalidatePath(`/document/${id}`)
    revalidatePath('/dashboard')
  }

  return (
    <>
      <div className="mb-6 flex justify-between items-end border-b pb-4">
        <div className="flex-1 mr-8">
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
    </>
  )
}

// 2. The main page now just unwraps the params and provides the Suspense boundary
export default async function DocumentPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  return (
    <main className="max-w-4xl mx-auto py-10 px-4">
      {/* Vercel's build compiler sees this Suspense block and safely skips pre-rendering the database queries inside */}
      <Suspense fallback={<div className="animate-pulse text-slate-400">Loading document...</div>}>
        <DocumentContent id={id} />
      </Suspense>
    </main>
  )
}